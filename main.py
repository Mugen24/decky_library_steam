from logging import exception
import os
from typing import Any, Literal, NewType
import json

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code repo
# and add the `decky-loader/plugin/imports` path to `python.analysis.extraPaths` in `.vscode/settings.json`
import decky
import os
import subprocess
import asyncio
from dataclasses import asdict, dataclass

from pathlib import Path
from urllib import request
from zipfile import ZipFile

from typing import TypedDict
import traceback

logger = decky.logger

DEBUG = 1

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


def download(url, download_path: Path):
    # url = "http://127.0.0.1:8000/download/308836784772523141175612368748750693433"
    r = request.Request(url, headers={
        "Content-Type": "application/zip",
        "Connection": "keep-alive",
    })

    resp = request.urlopen(r)
    if resp.status != 200:
        print("Server Error")
        return 

    chunk_size = 10 * 1024

    with open(download_path, "wb") as fp:
        print(f"Downloading: {download_path}")
        while chunk := resp.read(chunk_size):
            fp.write(chunk)

    return download_path


class ServerAuth:
    ip: str
    port: int

    
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
    id: int
    
class SteamShortCut(Game):
    directory: str # working directory
    launchOptions: str


class GameStoreClient():
    def __init__(self, prefix_dir: Path | None = None, install_path: Path | None = None, proton_dir: Path | None = None) -> None:
        self.name: str = "Komorebi"
        self.config_dir : Path = Path(decky.DECKY_PLUGIN_SETTINGS_DIR) 

        self.prefix_dir: Path = prefix_dir if prefix_dir else self.config_dir / "prefixes"
        self.install_path: Path = install_path if install_path else self.config_dir / "games" 
        self.proton_dir: Path = proton_dir if proton_dir else self.config_dir / "protons"

        self.config_dir.mkdir(parents=False, exist_ok=True)
        self.prefix_dir.mkdir(parents=False, exist_ok=True)
        self.install_path.mkdir(parents=False, exist_ok=True)
        self.proton_dir.mkdir(parents=False, exist_ok=True)

        self.server_endpoint = "http://127.0.0.1:8000"


    # A normal method. It can be called from the TypeScript side using @decky/api.
    async def authenticate(self, server_auth: ServerAuth) -> bool:
        return True

    # cloud saves: backup wine prefix
    def login(self):
        pass

    def list_games(self) -> list[SteamShortCut]:
        # test_game: SteamShortCut = SteamShortCut(
        #                     appName="Signalis",
        #                     media=Media(),
        #                     size=1126.4,
        #                     executablePath=self.install_path / Path("SIGNALIS/SIGNALIS v1.2.1/SIGNALIS.exe"),
        #                     directory=self.install_path / Path("SIGNALIS/SIGNALIS v1.2.1/"),
        #                     launchOptions="",
        #                     id=0
        #                 )

        # url = "http://127.0.0.1:8000"

        resp = request.urlopen(f"{self.server_endpoint}/list-games")
        data = resp.read()
        resp_body = json.loads(data)

        games = []
        for game in resp_body["games"]:
            games.append(SteamShortCut(
                    appName=game["name"],
                    media={
                        "capsule": f"{self.server_endpoint}/game/{game["id"]}/capsule",
                        "hero": f"{self.server_endpoint}/game/{game["id"]}/hero",
                        "logo": f"{self.server_endpoint}/game/{game["id"]}/logo",
                        "icon": f"{self.server_endpoint}/game/{game["id"]}/icon",
                    },
                    id=game["id"],
                    executablePath=str(self.install_path / game["name"] / game["executable_path"]),
                    size=1126.4,
                    directory=str(self.install_path / game["name"] / game["working_dir"]),
                    launchOptions=""
                ))

            
        return games

    def install(self, steam_shortcut: SteamShortCut, appId: int):
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
            self.download(steam_shortcut, appId)
        except Exception as e:
            print(e)
            return False

        return True

        # try:
        #     game = [game for game in games if game.id == gameId][0]
        # except IndexError:
        #     raise Exception(f"Cannot find gameId: ${gameId}")

        # if not is_enough_storage(required_space=game.size): 
        #     return

        # self._download(game)
        # self.download_dll(appId)


    def download_dll(self, appId):
        pass

    def download(self, game: SteamShortCut, appId: int):
        decky.logger.info(f"Downloading: {game["appName"]}")
        download_path = download(f"{self.server_endpoint}/download/{game["id"]}", download_path=Path(f"{self.install_path}/{game["appName"]}.zip"))
        if download_path is None:
            return

        ZipFile(download_path).extractall(path=f"{self.install_path}/{game["appName"]}")
        decky.logger.info(f"Finished: {game["appName"]}")



class Plugin:
    # async def long_running(self):
    #     await asyncio.sleep(15)
    #     # Passing through a bunch of random data, just as an example
    #     await decky.emit("timer_event", "Hello from the backend!", True, 2)

    # async def start_timer(self):
    #     self.loop.create_task(self.long_running())

    def __init__(self) -> None:
        if DEBUG:
            self.store = GameStoreClient(install_path=Path("/home/mugen/Programing/decky_env/downloads"))
        else:
            self.store = GameStoreClient()

    async def list_games(self):
        return self.store.list_games()

    async def install_game(self, steam_shortcut: SteamShortCut, appId: int):
        return self.store.install(steam_shortcut, appId)


    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        self.loop = asyncio.get_event_loop()
        decky.logger.info("World!")

    # Function called first during the unload process, utilize this to handle your plugin being stopped, but not
    # completely removed
    async def _unload(self):
        decky.logger.info("Goodnight World!")
        pass

    # Function called after `_unload` during uninstall, utilize this to clean up processes and other remnants of your
    # plugin that may remain on the system
    async def _uninstall(self):
        decky.logger.info("Goodbye World!")
        pass


    # Migrations that should be performed before entering `_main()`.
    async def _migration(self):
        plugin_dir = decky.DECKY_PLUGIN_NAME

        decky.logger.info("Migrating")
        # Here's a migration example for logs:
        # - `~/.config/decky-template/template.log` will be migrated to `decky.decky_LOG_DIR/template.log`
        decky.migrate_logs(os.path.join(decky.DECKY_USER_HOME,
                                               ".config", plugin_dir, "template.log"))
        # Here's a migration example for settings:
        # - `~/homebrew/settings/template.json` is migrated to `decky.decky_SETTINGS_DIR/template.json`
        # - `~/.config/decky-template/` all files and directories under this root are migrated to `decky.decky_SETTINGS_DIR/`
        decky.migrate_settings(
            os.path.join(decky.DECKY_HOME, "settings", "template.json"),
            os.path.join(decky.DECKY_USER_HOME, ".config", plugin_dir))

        # Here's a migration example for runtime data:
        # - `~/homebrew/template/` all files and directories under this root are migrated to `decky.decky_RUNTIME_DIR/`
        # - `~/.local/share/decky-template/` all files and directories under this root are migrated to `decky.decky_RUNTIME_DIR/`
        decky.migrate_runtime(
            os.path.join(decky.DECKY_HOME, plugin_dir),
            os.path.join(decky.DECKY_USER_HOME, ".local", "share", plugin_dir))

