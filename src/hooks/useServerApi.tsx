import { createContext, useContext, ReactElement, FC, ReactNode, useCallback, useState, Dispatch, useEffect} from "react"
import type { GameItemProperties } from "../Components/GameGrid"
import { call, callable } from "@decky/api"

export type ServerApiProperties = {
  isAuthenticated: boolean
  getGames: () => Promise<GameItemProperties[]>
  install: (game: GameItemProperties) => Promise<void>
  setServerEndpoint: (serverConfig: ServerConfig) => Promise<void>

  // install_game: (game: GameItemProperties, appId: number) => Promise<void>
  remove_game: (game: GameItemProperties) => Promise<void>
  pause_game: (game: GameItemProperties) => Promise<void>
  priority_install: (game: GameItemProperties) => Promise<void>
  emit_download_records: () => Promise<void>
}

export type ServerConfig = {
  ip: string,
  port: number
}

export enum ELibraryAssetType {
    Capsule,
    Hero,
    Logo,
    Header,
    Icon,
    HeroBlur,
}

//@ts-ignore
export const ServerApiContext = createContext<ServerApiProperties>({})


export function ServerApiProvider({children}: {children?: ReactElement}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const setServerEndpoint = async (serverConfig: ServerConfig) => {
    console.debug("Connecting to server") 
    await call("set_server_endpoint", serverConfig)
    const resp = await call("is_authenticated") 
    setIsAuthenticated(resp)
  }

  // const authenticationListener = addEventListener<[
  //   isAuthenticated: boolean
  // ]>("authentication", (isAuthenticated) => {
  // });

  useEffect(() => {
     call("is_authenticated") 
     .then(resp => {
       setIsAuthenticated(resp)
     })
  }, [])


  const getGames = useCallback(async () => {
    const games: GameItemProperties[] = await call("list_games")
    return games
  }, [])



  const install = async (game: GameItemProperties) => {
      console.debug(`Install: ${game}`)
      const appId = await SteamClient.Apps.AddShortcut(game.appName, game.executablePath, game.directory, game.launchOptions)

      console.debug(`game_info: ${game.id}, appId: ${appId}`)
      const outcome = await call("install_game", game, appId)

      //TODO: remove later
      //Need testing: Apps.SetXXX needs to be run at least once to show shortcut
      //in UI
      //SteamClient.Apps.SetAppLaunchOptions(appId, `appId=${appId}`)
      SteamClient.Apps.SetAppLaunchOptions(appId, ``)
      
      // SteamClient.Apps.SpecifyCompatTool
      // const data = await SteamClient.Apps.GetAvailableCompatTools(appId)
      // console.debug(`available_compatools: appId: ${game.appName}  ${JSON.stringify(data)}`)

      //TODO: Make this more robust
      SteamClient.Apps.SpecifyCompatTool(appId, "proton_10")


      call("download_asset_base64", game.media.hero)
      .then(base64 => {
         SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Hero)
      })

      call("download_asset_base64", game.media.capsule)
      .then(base64 => {
         SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Capsule)
      })

      call("download_asset_base64", game.media.icon)
      .then(base64 => {
         SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Icon)
      })

      call("download_asset_base64", game.media.logo)
      .then(base64 => {
         SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Logo)
      })

      // getBase64Image(game.media.hero!, async (base64: string) => {
      //   SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Hero)
      // })
      // getBase64Image(game.media.capsule!, async (base64: string) => {
      //   SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Capsule)
      // })
      // //TODO: setting icon does not work
      // getBase64Image(game.media.icon!, async (base64: string) => {
      //   SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Icon)
      // })
      // getBase64Image(game.media.logo!, async (base64: string) => {
      //   SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Logo)
      // })

      return outcome
  }

  async function remove_game(game: GameItemProperties) {
    await call("remove_game", game)
    return 
  }

  async function pause_game(game: GameItemProperties) {
    await call("pause_game", game)
    return 
  }
  
  async function priority_install(game: GameItemProperties) {
    await call("priority_install", game)
    return 
  }

  async function emit_download_records() {
    await call("emit_download_records")
  }

  const value: ServerApiProperties = {
    getGames,
    install,
    setServerEndpoint,
    remove_game,
    pause_game,
    priority_install,
    emit_download_records,
    isAuthenticated,
  }

  return (
    <ServerApiContext.Provider
      value={value}
    >
      {children}
    </ServerApiContext.Provider>
  )
}

//@ts-ignore
export const useServerApi = () => useContext<ServerApiProperties>(ServerApiContext)
