import { createContext, useContext, ReactElement, FC, ReactNode, useCallback, useState, Dispatch} from "react"
import type { GameItemProperties } from "../Components/GameGrid"
import { call, callable } from "@decky/api"

export type ServerApiProperties = {
  isAuthenticated: boolean
  getGames: () => GameItemProperties[]
  install: (id: number) => void
  uninstall: (appId: number) => void
} 

export type ServerConfig = {
  ipAddr: string,
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

  const auth = useCallback((serverConfig: ServerConfig) => {
    console.debug("Connecting to server") 
    setIsAuthenticated(true)
  }, [])


  const getGames = useCallback(async () => {
    const games = await call("list_games")
    return games
  }, [])

  const getBase64Image = useCallback(async(imageURL: string, callback: (base64Img: any) => void) => {
    const resp = await fetch(imageURL, {
    })

    console.log("imageurl", imageURL)
    console.log("Image_fetch", resp)
    if (resp.status !== 200) return undefined
    
    const blob = await resp.blob()
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => {
        const re = new RegExp("data:.+\/.+;base64,")
        let base64 = reader.result!
        base64 = base64.replace(re, "")
        // console.log(base64)
        callback(base64)
    }
  }, [])


  const install = async (game: GameItemProperties) => {
      console.debug(`Install: ${game}`)
      const appId = await SteamClient.Apps.AddShortcut(game.appName, game.executablePath, game.directory, game.launchOptions)

      console.debug(`game_info: ${game.id}, appId: ${appId}`)

      //TODO: remove later
      //Need testing: Apps.SetXXX needs to be run at least once to show shortcut
      //in UI
      // SteamClient.Apps.SetAppLaunchOptions(appId, `appId=${appId}`)
      
      // SteamClient.Apps.SpecifyCompatTool
      // const data = await SteamClient.Apps.GetAvailableCompatTools(appId)
      // console.debug(`available_compatools: appId: ${game.appName}  ${JSON.stringify(data)}`)

      //TODO: Make this more robust
      // SteamClient.Apps.SpecifyCompatTool(appId, "proton_10")


      getBase64Image(game.media.hero!, async (base64: string) => {
        SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Hero)
      })
      getBase64Image(game.media.capsule!, async (base64: string) => {
        SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Capsule)
      })
      //TODO: setting icon does not work
      getBase64Image(game.media.icon!, async (base64: string) => {
        SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Icon)
      })
      getBase64Image(game.media.logo!, async (base64: string) => {
        SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Logo)
      })

      // const outcome = await call("install_game", game, appId)
      // return outcome
  }

  const uninstall = async (appId: number) => {
      console.debug(`Uninstall: ${appId}`)
    // ISteamClient.Apps.RemoveShortcut(appId)
  }

  const value: ServerApiProperties = {
    getGames,
    install,
    uninstall, 
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
