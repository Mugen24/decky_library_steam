import { createContext, useContext, ReactElement, FC, ReactNode, useCallback, useState, Dispatch} from "react"
import type { GameItemProperties } from "../Components/GameGrid"

export type ServerApiProperties = {
  isAuthenticated: boolean
  getGames: () => GameItemProperties[]
  install: (game: GameItemProperties) => void
  uninstall: (appId: number) => void
} 

export type ServerConfig = {
  ipAddr: string,
  port: number
}

//@ts-ignore
export const ServerApiContext = createContext<ServerApiProperties>({})


export function ServerApiProvider({children}: {children?: ReactElement}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const auth = useCallback((serverConfig: ServerConfig) => {
    console.debug("Connecting to server") 
    setIsAuthenticated(true)
  }, [])


  const getGames = useCallback(() => {
    const fakeGame: GameItemProperties = {
      "media": {
        "capsule": "https://cdn2.steamgriddb.com/thumb/27565002c4e5a784a1c9599648328e93.jpg"
      },
      "appName": "Fake Game"
    }

    const fakeGame2: GameItemProperties = {
      "media": {
        "capsule": "https://cdn2.steamgriddb.com/thumb/27565002c4e5a784a1c9599648328e93.jpg"
      },
      "appName": "Fake Game2"
    }

    const fakeGame3: GameItemProperties = {
      "media": {
        "capsule": "https://cdn2.steamgriddb.com/thumb/27565002c4e5a784a1c9599648328e93.jpg"
      },
      "appName": "Fake Game3"
    }

    const fakeGame4: GameItemProperties = {
      "media": {
        "capsule": "https://cdn2.steamgriddb.com/thumb/27565002c4e5a784a1c9599648328e93.jpg"
      },
      "appName": "Fake Game4"
    }

    const fakeGame5: GameItemProperties = {
      "media": {
        "capsule": "https://cdn2.steamgriddb.com/thumb/27565002c4e5a784a1c9599648328e93.jpg"
      },
      "appName": "Fake Game5"
    }

    return [
      fakeGame,
      fakeGame2,
      fakeGame3,
      fakeGame4,
      fakeGame5,
    ] 
  }, [])

  const install = async (game: GameItemProperties) => {
      console.debug(`Install: ${game}`)
      // await ISteamClient.Apps.AddShortcut(game.appName, game.executablePath, game.directory, game.launchOptions)
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
