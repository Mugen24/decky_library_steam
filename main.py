from logging import exception
import os
from typing import Any, Literal, NewType, NotRequired, Tuple
import json
from textwrap import dedent
from urllib import response

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
    id: str
    
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
            "description": "Creating zip file"
    })

    resp = request.urlopen(r)
    if resp.status != 200:
        print("Server Error")
        return 

    chunk_size = 10 * 1024
    file_size = int(resp.headers.get("content-length", None))
    downloaded = 0
    assert file_size is not None


    with open(download_to, "wb") as fp:
        while chunk := resp.read(chunk_size):
            fp.write(chunk)
            downloaded += chunk_size
            print(file_size)
            print(downloaded)
            dl = round((downloaded / file_size) * 100)
            print(f"Downloading: {download_to} {dl}%")

            await decky.emit(f"download_progress", game['id'], {
                    "game": game,
                    "progress": dl,
                    "description": f"{dl}%"
            })

    return download_to

def _download_asset_base64(asset_url: str):
    runtime_dir = Path(decky.DECKY_PLUGIN_RUNTIME_DIR) 
    resp = request.urlopen(asset_url)
    image_content = resp.read()

    return b64encode(image_content).decode("utf-8")

from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse
import re
import threading
from urllib.response import addinfourl


class ForwardHTTPHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # url = "http://192.168.0.29:9543/game/75647578090013437797342484020852550194/capsule"

        # regex = r"\/game\/(?P<id>[^\/]*)\/(?P<asset_type>[^\/]*)"

        # url = urlparse(self.path)
        # print(url.path)
        # match_obj = re.search(regex, url.path)
        # assert match_obj is not None
        # print(match_obj.group("id"))
        # print(match_obj.group("asset_type"))

        # resp: addinfourl = request.urlopen(f"http://{self.server.game_server[0]}:{self.server.game_server[1]}/game/{match_obj.group("id")}/{match_obj.group("asset_type")}") #type: ignore
        resp: addinfourl = request.urlopen(f"http://{self.server.game_server[0]}:{self.server.game_server[1]}{self.path}") #type: ignore

        print("Server:", resp.status)


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

        print(dedent(f"""
            Saving file: {self.config_dir}
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
        self.server = HTTPForwarder((self.proxy_ip, self.proxy_port), ForwardHTTPHandler, (self.server_ip, self.server_port))
        self.server_thread = threading.Thread(target=self.server.serve_forever)
        self.server_thread.start()

    def stop_server(self):
        if self.server is not None:
            self.server.shutdown()
            self.server_thread.join()

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
        self.save_config()


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
        download_path = await download(game, f"http://{self.server_ip}:{self.server_port}/download/{game['id']}", download_to=Path(f"{self.install_path}/{game['appName']}.zip"))
        if download_path is None:
            return

        decky.logger.info(f"Extracting: {game['appName']}")
        ZipFile(download_path).extractall(path=f"{self.install_path}/{game['appName']}")

        decky.logger.info(f"Finished: {game['appName']}")


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





class Plugin:
    # async def long_running(self):
    #     await asyncio.sleep(15)
    #     # Passing through a bunch of random data, just as an example
    #     await decky.emit("timer_event", "Hello from the backend!", True, 2)

    # async def start_timer(self):
    #     self.loop.create_task(self.long_running())

    def __init__(self) -> None:
        # Loads the store images

        # if self.store.server_endpoint is not None:
        #     self.loop.create_task(self.store.prefetch_game_capsule())

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

        return True



    async def list_games(self):
        if self.store:
            return self.store.list_games()

    async def install_game(self, steam_shortcut: SteamShortCut, appId: int):
        if self.store:
            await self.store.install(steam_shortcut, appId)

        return 
            

    async def download_asset_base64(self, asset_url: str):
        return _download_asset_base64(asset_url)


    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        self.loop = asyncio.get_event_loop()
        decky.logger.info("World!")

    # Function called first during the unload process, utilize this to handle your plugin being stopped, but not
    # completely removed
    async def _unload(self):
        decky.logger.info("Goodnight World!")
        if self.store:
            self.store.stop_server()
            self.store.save_config()

        pass

    # Function called after `_unload` during uninstall, utilize this to clean up processes and other remnants of your
    # plugin that may remain on the system
    async def _uninstall(self):
        decky.logger.info("Goodbye World!")
        pass


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
        # # - `~/.config/decky-template/` all files and directories under this root are migrated to `decky.decky_SETTINGS_DIR/`
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

