import time
from logging import exception
import os
from typing import Any, Callable, Coroutine, Literal, NewType, NotRequired, Tuple
import json
from textwrap import dedent
import shutil
from urllib import response
from multiprocessing import Pool
from collections import deque

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code repo
# and add the `decky-loader/plugin/imports` path to `python.analysis.extraPaths` in `.vscode/settings.json`
import decky
import os
import subprocess
import asyncio
from dataclasses import asdict, dataclass
from base64 import b64encode

from pathlib import Path
from urllib import request
from zipfile import ZipFile

from typing import TypedDict
import traceback
from http import HTTPStatus

logger = decky.logger

DEBUG = 1

class Media(TypedDict):
    #TODO: return base64 encoded
    capsule: str | None 
    hero: str | None 
    logo: str | None
    icon: str | None 

class Game(TypedDict):
    appName: str
    media: Media
    size: float# in MB?
    executablePath: str # relative
    id: str #server_id
    
class SteamShortCut(Game):
    directory: str # working directory
    launchOptions: str

class ServerAuth(TypedDict):
    ip: str
    port: int
    
class GameStoreClientConfig(TypedDict):
    server_ip: NotRequired[str]
    server_port: NotRequired[int]


def check_dependencies():
    dependencies = ["winetricks", "protontrick"] # use steam to run game
    try: 
        subprocess.run("which rsync", capture_output=True, check=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"Missing dependencies: {e}")
    pass

def check_system() -> Literal["linux", "window"]:
    return "linux"

def is_enough_storage(required_space: int) -> bool:
    return True




async def download(game: SteamShortCut, url, download_to: Path):
    r = request.Request(url, headers={
        "Content-Type": "application/zip",
        "Connection": "keep-alive",
    })

    print(f"Downloading: {download_to}")
    await decky.emit(f"download_progress", game['id'], {
            "game": game,
            "progress": 0,
            "description": "Creating zip file",
            "fileSize": None,
    })

    resp = request.urlopen(r)
    if resp.status != 200:
        print("Server Error")
        return 

    # chunk_size = 1024 * 1024
    # chunk_size = 31457280 #30mb
    chunk_size = 10 ** 6 * 1000 * 1 #1gb

    file_size = int(resp.headers.get("content-length", None))
    downloaded = 0
    assert file_size is not None

    print(f"File-size: {file_size}")

    await decky.emit(f"download_progress", game['id'], {
            "game": game,
            "progress": 0,
            "description": "Starting download",
            "fileSize": file_size,
    })


    tic = time.perf_counter()
    with open(download_to, "wb") as fp:
        while chunk := resp.read(chunk_size):
            fp.write(chunk)
            downloaded += chunk_size
            dl = round((downloaded / file_size) * 100)
            # print(f"Downloading: {download_to} {dl}%")

            # await decky.emit(f"download_progress", game['id'], {
            #         "game": game,
            #         "progress": dl,
            #         "description": f"{dl}%"
            # })

            # make it increment of 5 to reduce await task
            # TODO: make a loop that emit download progress every x seconds
            if dl % 25 == 0:
                print(f"Downloading: {download_to} {dl}%")
                await decky.emit(f"download_progress", game['id'], {
                        "game": game,
                        "progress": dl,
                        "description": f"{dl}%",
                        "fileSize": file_size,
                })
    toc = time.perf_counter()
    print(f"Completed in {toc - tic} seconds")

    return download_to

def _download_asset_base64(asset_url: str):
    runtime_dir = Path(decky.DECKY_PLUGIN_RUNTIME_DIR) 
    resp = request.urlopen(asset_url)
    image_content = resp.read()

    return b64encode(image_content).decode("utf-8")








#------------------------------------------------------------------HTTP-FORWARDER------------------------------------------------------------------------------------------

from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse
import re
import threading
from urllib.response import addinfourl


class ForwardHTTPHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        resp: addinfourl = request.urlopen(f"http://{self.server.game_server[0]}:{self.server.game_server[1]}{self.path}") #type: ignore
        assert resp.status is not None
        self.send_response(resp.status)
        for key, value in resp.headers.items():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(resp.read())

class HTTPForwarder(HTTPServer):
    def __init__(self, server_address, RequestHandlerClass, game_root_server: Tuple[str, int], bind_and_activate: bool = True) -> None:
        super().__init__(server_address, RequestHandlerClass, bind_and_activate)
        self.game_server = game_root_server


#------------------------------------------------------------------Download-manager------------------------------------------------------------------------------------------

DownloadState = Literal["download", "downloading", "paused", "downloaded", "removed"]

class DownloadRecord(TypedDict):
    game_id: str
    url: str
    download_to: str
    start: int
    state: DownloadState
    # emit_game_state: Callable[[int, str], Any]
    game_detail: SteamShortCut
    install_to: str


class DownloadManager():
    def __init__(self, server_root: Path) -> None:
        self.downloading: deque[DownloadRecord] = deque()
        self.download_records: dict[str, DownloadRecord] = {}

        self.download_records_lock = threading.Lock()
        self.downloading_lock = threading.Lock()


        self._is_any_download = threading.Event()
        self._stop = False


        self.loop = asyncio.get_event_loop()
        self.loop.create_task(self.progress_event_emitter())


        self.config_path = server_root / "download_record.json"
        if self.config_path.exists():

            with self.download_records_lock:
                self.download_records = json.loads(self.config_path.read_text())

                # remove all previously downloaded games
                removed_game: list[str] = []
                for game_id, record in self.download_records.items():
                    if record["state"] == "downloaded" or record["state"] == "removed":
                        removed_game.append(game_id)

                    elif record["state"] == "paused"  or record["state"] == "download":
                        if record["state"] == "paused":
                            record["state"] = "download"

                        with self.downloading_lock:
                            self.downloading.append(record)

                    

                for rm_id in removed_game:
                    del self.download_records[rm_id]

        self.save_config()

        # !!IMPORTANT 
        # Must start thread at the very end to load all the necessary config
        self.consumer_task = threading.Thread(target=self.consumer)
        self.consumer_task.start()


    def save_config(self):
        with self.config_path.open("w+") as fp:
            fp.write(json.dumps(self.download_records))


    def update_state(self, game_id: str, state: DownloadState):
        game_record = self.download_records.get(game_id)

        if game_record is None:
            print(f"Game entry not found: {game_id}")
            return

        print("Updating state: " , game_record["game_detail"]["appName"], state)

        if state == "download":
            game_record["state"] = state
            with self.download_records_lock:
                self.download_records[game_id] = game_record 

            with self.downloading_lock:
                self.downloading.append(self.download_records[game_id])

        elif state == "paused":
            game_record["state"] = state
            with self.download_records_lock:
                self.download_records[game_id] = game_record 
            pass

        elif state == "downloading":
            game_record["state"] = state
            with self.download_records_lock:
                self.download_records[game_id] = game_record 
            pass
        elif state == "removed":
            game_record["state"] = state
            with self.download_records_lock:
                self.download_records[game_id] = game_record 

            # Remove partially downloaded zip file
            print("Removing:", game_record["download_to"])
            if Path(game_record["download_to"]).exists():
                os.remove(game_record["download_to"])

        elif state == "downloaded":
            game_record["state"] = state
            with self.download_records_lock:
                self.download_records[game_id] = game_record 
            pass
        else: 
            raise Exception(f"State {state} not implemented")


    def add_to_queue(self, game_id: str, url: str, download_to: str, game_detail: SteamShortCut, install_to: str):
        print("Adding to queue")
        print(self.download_records)
        game_record = self.download_records.get(game_id)
        if game_record and (game_record["state"] == "paused" or game_record["state"] == "download"):
            self.update_state(game_id, "download")
        else:
            with self.download_records_lock:
                self.download_records[game_id] = {
                            "game_id": game_id,
                            "url": url, 
                            "download_to": download_to,
                            "start": 0,
                            "state": "download",
                            "game_detail": game_detail,
                            "install_to": install_to
                        }

        with self.downloading_lock:
            self.downloading.append(self.download_records[game_id])
        print(self.download_records)
        self._is_any_download.set()

    def consumer(self):
        print("Starting consumer")
        print(self.download_records)
        print(self.downloading)
        try:
            while not self._stop:
                try: 
                    with self.downloading_lock:
                        game_record = self.downloading.popleft()
                        game_id = game_record["game_id"]
                except IndexError:
                    self._is_any_download.clear()
                    print("Empty Queue")
                    self._is_any_download.wait()
                    continue

                if game_record["state"] != "download":
                    print(game_record)
                    print(self.download_records)
                    continue

                url = game_record["url"]
                r: request.Request = request.Request(game_record["url"])
                resp = request.urlopen(r)
                try: 
                    file_size = int(resp.headers.get("Content-Length"))
                except Exception as e:
                    print(e)
                    continue

                print("Starting Download:", game_record)
                self.update_state(game_id, "downloading")


                decky.logger.warn("TODO: get server to return file size instead")
                # this only working because it's set before the state is updated to downloading
                # and is what the self.progress_event_emitter looks for 
                with self.download_records_lock:
                    game_record["game_detail"]["size"] = file_size


                print(resp.headers)
                chunk_size = 1024 * 1024 * 10

                start = game_record["start"]
                end = None
                part = (file_size - start) // chunk_size

                for i in range(0, part):
                    print("Tack:", i, "-", part)
                    if end is not None:
                        start = end + 1
                    end = file_size - 1 if i == part - 1 else (start + chunk_size - 1)

                    # Check if game still need to be downloaded
                    if game_record["state"] != "downloading":
                        break

                    with self.download_records_lock:
                        game_record["start"] = start

                    if self._stop:
                        self.update_state(game_id, "paused")
                        break

                    self._download_part(start, end, url, game_record["download_to"])

                    # game_record["emit_game_state"](round(( i / part) * 100), "Downloading")

                    
                    if end == file_size - 1:
                        self.update_state(game_id, "downloaded")

                        ZipFile(game_record["download_to"]).extractall(path=f"{game_record['install_to']}")

                        os.remove(game_record["download_to"])

                        decky.logger.info(f"Finished: {game_record['game_detail']['appName']}")

        except Exception as e:
            print("Download thread encountered error")
            print(e)
        finally:
            print(self.download_records)
            self._download_thread_cleanup()

    def priority_download(self, game_id: str):
        game_record = self.download_records.get(game_id)
        if game_record is None:
            print(f"Game entry not found: {game_id}")
            return

        with self.download_records_lock:
            game_record["state"] = "download"
            self.download_records[game_id] = game_record

        with self.downloading_lock:
            self.downloading.appendleft(self.download_records[game_id])

        has_paused_current_game = 0
        for game_id, record in self.download_records.items():
            if record["state"] == "downloading":
                self.update_state(game_id, "paused")
                has_paused_current_game += 1

        if has_paused_current_game > 1:
            print(self.download_records)
            raise Exception("Should not be more than one game being downloaded")

        self._is_any_download.set()



    def _download_part(self, start, end, url, file_dest: str):
        # url = "http://192.168.0.29:9543/download/75750689628605614378287604382577387587"
        print(f"starting {start} {end}")
        r = request.Request(url, headers={
            "Content-Type": "application/zip",
            "Range": f"bytes={start}-{end}",
            "Transfer-Encoding": "chunked",
        })

        resp = request.urlopen(r)
        # content_length = end - start + 1
        # content = resp.read(content_length)


        with open(file_dest, "ab+") as fp:
            while content := resp.read():
                fp.seek(start)
                fp.write(content)

        print(f"Downloaded-part: {start} - {end}")

    def _download_thread_cleanup(self):
        print("Cleaning up")
        with self.download_records_lock:
            for record in self.download_records.values():
                if record["state"] == "downloading":
                    record["state"] = "paused"

        self.save_config()

    def stop(self):
        # Thread might be as sleep waiting for queue
        # We need to wake it up then exit
        print("set True")
        self._stop = True
        self._is_any_download.set()

    def get_download_record(self):
        return self.download_records


    def download_records_cleanup(self):
        with self.download_records_lock:
            # remove all previously downloaded games
            removed_game: list[str] = []
            for game_id, record in self.download_records.items():
                if record["state"] == "downloaded" or record["state"] == "removed":
                    removed_game.append(game_id)
            for rm_id in removed_game:
                del self.download_records[rm_id]

    # TODO: 
    async def progress_event_emitter(self):
        try:
            while True:
                downloaded_or_removed_flag = 0
                for record in self.download_records.values():
                    if record["state"] == "downloading":
                        progress = round((record["start"] / record["game_detail"]["size"]) * 100)
                        await decky.emit("download_progress", record["game_detail"]["id"], {
                            "game": record["game_detail"],
                            "progress": progress,
                            "description": f"Downloading: {progress}"
                        })
                    elif record["state"] == "downloaded":
                        await decky.emit("download_progress", record["game_detail"]["id"], {
                            "game": record["game_detail"],
                            "progress": round((record["start"] / record["game_detail"]["size"]) * 100),
                            "description": "Downloaded"
                        })

                        downloaded_or_removed_flag = 1
                    elif record["state"] == "removed":
                        downloaded_or_removed_flag = 1

                if downloaded_or_removed_flag:
                    # This is needed so that we don't emit identical event multiple time
                    self.download_records_cleanup()

                await asyncio.sleep(20)

        except asyncio.CancelledError:
            print("Infinite bg loop cancelled")




#------------------------------------------------------------------SERVER_INTERFACE------------------------------------------------------------------------------------------

class GameStoreClient():
    def __init__(self, 
                 server_ip: str,
                 server_port: int,
                 config: GameStoreClientConfig = {},
                 prefix_dir: Path | None = None,
                 install_path: Path | None = None,
                 proton_dir: Path | None = None
        ) -> None:

        self.name: str = "Komorebi"
        self.config_dir: Path = Path(decky.DECKY_PLUGIN_SETTINGS_DIR) 

        self.config_file: Path = self.config_dir / "config.json"

        self.config = config

        self.server_ip = server_ip
        self.server_port = server_port

        self.proxy_ip = "127.0.0.1"
        self.proxy_port = 9865

        self.data_dir: Path = Path(decky.DECKY_PLUGIN_RUNTIME_DIR) 
        self.log_file: Path = Path(decky.DECKY_PLUGIN_LOG)

        self.install_path: Path = install_path if install_path else self.data_dir / "games" 
        self.install_path.mkdir(parents=False, exist_ok=True)

        self.store_assets_dir = self.data_dir / "store"
        self.store_assets_dir.mkdir(parents=False, exist_ok=True)

        self.download_manager = DownloadManager(server_root=self.data_dir)

        print(dedent(f"""
            Saving file: {self.config_dir}
            Plugin setting: {decky.DECKY_PLUGIN_SETTINGS_DIR}
            Plugin dir: {decky.DECKY_PLUGIN_DIR}
            Plugin log: {decky.DECKY_PLUGIN_LOG}
            Plugin log dir: {decky.DECKY_PLUGIN_LOG_DIR}
            Plugin runtime dir: {decky.DECKY_PLUGIN_RUNTIME_DIR}
        """))

        self.start_server() 

    def get_server_url(self):
        return f"http://{self.server_ip}:{self.server_port}"
    def get_proxy_url(self):
        return f"http://{self.proxy_ip}:{self.proxy_ip}"

    def start_server(self):
        # TODO: Rename this 
        # Basically spins a server thread for our local http forwarder
        # to bypass loading http images on an https website
        self.server = HTTPForwarder((self.proxy_ip, self.proxy_port), ForwardHTTPHandler, (self.server_ip, self.server_port))
        self.server_thread = threading.Thread(target=self.server.serve_forever)
        self.server_thread.start()

    def stop_server(self):
        if self.server is not None:
            self.server.shutdown()
            self.server_thread.join()

        # also stop out download manager thread
        self.download_manager.stop()

    def save_config(self):
        self.config.update(
            {
                "server_port": self.server_port,
                "server_ip": self.server_ip,
            }
        )

        print("Saving config: ", self.config)
        with self.config_file.open("w+") as fp:
            fp.write(json.dumps(self.config))

    # A normal method. It can be called from the TypeScript side using @decky/api.
    def set_server_endpoint(self, server_auth: ServerAuth):
        print(f"setting server endpoint: {server_auth}")
        self.server_ip = server_auth["ip"].strip("http://")
        self.server_port = server_auth["port"]
        # self.save_config()
        # return


    def list_games(self) -> list[SteamShortCut]:
        print(self.server_ip)
        print(self.server_port)

        resp = request.urlopen(f"http://{self.server_ip}:{self.server_port}/list-games")

        data = resp.read()
        resp_body = json.loads(data)
        games = []
        for game in resp_body["games"]:
            games.append(SteamShortCut(
                    appName=game["name"],
                    media={
                        "capsule": f"http://{self.proxy_ip}:{self.proxy_port}/game/{game['id']}/capsule",
                        "hero": f"http://{self.proxy_ip}:{self.proxy_port}/game/{game['id']}/hero",
                        "logo": f"http://{self.proxy_ip}:{self.proxy_port}/game/{game['id']}/logo",
                        "icon": f"http://{self.proxy_ip}:{self.proxy_port}/game/{game['id']}/icon",
                    },
                    id=game["id"],
                    executablePath=str(self.install_path / game["name"] / game["executable_path"]),
                    size=-935,
                    directory=str(self.install_path / game["name"] / game["working_dir"]),
                    launchOptions=""
                ))
        return games

    #!!Important!! appId is generated shortcut appId
    async def install(self, steam_shortcut: SteamShortCut, appId: int):
        print(f"Download: {steam_shortcut}")
        games = self.list_games()
        installing_game = None
        for game in games:
            if steam_shortcut["id"] == game["id"]:
                installing_game = game
                break

        if installing_game is None:
            decky.logger.info(f"Cannot find game: {steam_shortcut}")
            return False

        try:
            await self.download(steam_shortcut)
        except Exception as e:
            print(e)
            return False
        return True


    async def download(self, game: SteamShortCut):
        decky.logger.info(f"Downloading: {game['appName']}")

        url = f"http://{self.server_ip}:{self.server_port}/download/{game['id']}"
        download_path = Path(f"{self.install_path}/{game['appName']}.zip")

        loop = asyncio.get_event_loop()
        # emitted_task: list[asyncio.Task] = []
        # def emit_game_state(progress: int, description: str):
        #     task = asyncio.run_coroutine_threadsafe(decky.emit(f"download_progress", game['id'], {
        #             "game": game,
        #             "progress": progress,
        #             "description": description
        #     }), loop)

        #     # emitted_task.append(task)

        await decky.emit(f"download_progress", game['id'], {
                "game": game,
                "progress": 0,
                "description": f"Zipping"
        })

        game_path = f"{self.install_path}/{game['appName']}"
        self.download_manager.add_to_queue(
            game_id=game["id"],
            url=url,
            download_to=download_path.as_posix(),
            install_to=game_path,
            game_detail=game,
        )

        # decky.logger.info(f"Extracting: {game['appName']}")
        # await decky.emit(f"download_progress", game['id'], {
        #         "game": game,
        #         "progress": 100,
        #         "description": f"unzipping"
        # })

        # Wait for all coroutine to be submitted to frontend


    def download_asset(self, id: str, asset_type: Literal["capsule", "hero", "logo", "icon"]):
        url = f"http://{self.proxy_ip}:{self.proxy_port}/game/{id}/{asset_type}"
        decky.logger.info(f"Download asset {url}")

        game_asset_dir = self.store_assets_dir / f'{id}'
        asset_file = game_asset_dir / f"{asset_type}.jpg"

        if asset_file.exists():
            return

        game_asset_dir.mkdir(exist_ok=True)

        resp = request.urlopen(url)

        if resp.status == 200:
            with asset_file.open("wb+") as fp:
                fp.write(resp.read())
        else:
            decky.logger.info(f'Game {id} cannot find capsule image from server')


    async def prefetch_game_capsule(self):
        games = self.list_games()
        for game in games:
            self.download_asset(game["id"], asset_type="capsule")
            self.download_asset(game["id"], asset_type="hero")
            self.download_asset(game["id"], asset_type="logo")
            self.download_asset(game["id"], asset_type="icon")

    async def emit_download_record(self):
        dl_records = self.download_manager.get_download_record()

        for record in dl_records.values():
            game = record["game_detail"]

            await decky.emit(f"download_progress", game['id'], {
                    "game": game,
                    "progress": game["size"] / record["start"],
                    "description": f"{record['state']}"
            })






#----------------------------------------------------------------DECKY-INTERFACE------------------------------------------------------


class Plugin:
    def __init__(self) -> None:
        config_file = Path(decky.DECKY_PLUGIN_SETTINGS_DIR) / "config.json"
        self.store = None
        try:
            config: GameStoreClientConfig = json.loads(config_file.read_text())
            self.store = GameStoreClient(server_ip=config["server_ip"], server_port=config["server_port"], config=config)
        except Exception as e: 
            print(e)

    async def is_authenticated(self):
        return self.store is not None

    async def get_saved_config(self):
        if self.store:
            return self.store.config

    async def set_server_endpoint(self, server_auth: ServerAuth):
        server_auth["ip"] = server_auth["ip"].strip("http://")
        print("auth: ", server_auth) 
        print("store: ", self.store)
        if self.store is not None:
            self.store.set_server_endpoint(server_auth)
        else:
            self.store = GameStoreClient(server_ip=server_auth["ip"], server_port=server_auth["port"])
            # self.store.save_config()

        return True

    async def list_games(self):
        if self.store:
            return self.store.list_games()

        return 

            

    async def download_asset_base64(self, asset_url: str):
        return _download_asset_base64(asset_url)



    # Download control
    async def install_game(self, steam_shortcut: SteamShortCut, appId: int):
        if self.store:
            await self.store.install(steam_shortcut, appId)

    async def remove_game(self, game: SteamShortCut):
        if self.store:
            self.store.download_manager.update_state(game["id"], "removed")

    async def pause_game(self, game: SteamShortCut):
        if self.store:
            self.store.download_manager.update_state(game["id"], "paused")
    
    async def priority_install(self, game: SteamShortCut):
        if self.store:
            self.store.download_manager.priority_download(game["id"])

    async def emit_download_records(self):
        # TODO: Remove this from UI
        if self.store:
            await self.store.emit_download_record()
    




    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        self.loop = asyncio.get_event_loop()
        decky.logger.info("Starting!")

    # Function called first during the unload process, utilize this to handle your plugin being stopped, but not
    # completely removed
    async def _unload(self):
        decky.logger.info("Goodnight World!")
        if self.store:
            self.store.stop_server()
            self.store.save_config()

    # Function called after `_unload` during uninstall, utilize this to clean up processes and other remnants of your
    # plugin that may remain on the system
    async def _uninstall(self):
        decky.logger.info("Goodbye World!")


    # Migrations that should be performed before entering `_main()`.
    async def _migration(self):
        # plugin_dir = decky.DECKY_PLUGIN_NAME

        # decky.logger.info("Migrating")
        # # Here's a migration example for logs:
        # # - `~/.config/decky-template/template.log` will be migrated to `decky.decky_LOG_DIR/template.log`
        # decky.migrate_logs(os.path.join(decky.DECKY_USER_HOME,
        #                                        ".config", plugin_dir, "template.log"))
        # # Here's a migration example for settings:
        # # - `~/homebrew/settings/template.json` is migrated to `decky.decky_SETTINGS_DIR/template.json`
        # # - `~/.config/decky-tempCCEWlate/` all files and directories under this root are migrated to `decky.decky_SETTINGS_DIR/`
        # decky.migrate_settings(
        #     os.path.join(decky.DECKY_HOME, "settings", "template.json"),
        #     os.path.join(decky.DECKY_USER_HOME, ".config", plugin_dir))

        # # Here's a migration example for runtime data:
        # # - `~/homebrew/template/` all files and directories under this root are migrated to `decky.decky_RUNTIME_DIR/`
        # # - `~/.local/share/decky-template/` all files and directories under this root are migrated to `decky.decky_RUNTIME_DIR/`
        # decky.migrate_runtime(
        #     os.path.join(decky.DECKY_HOME, plugin_dir),
        #     os.path.join(decky.DECKY_USER_HOME, ".local", "share", plugin_dir))
        pass

