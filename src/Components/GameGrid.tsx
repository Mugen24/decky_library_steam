import { ButtonItem, ConfirmModal, DialogButton, Focusable, FocusRing, focusRingClasses, libraryAssetImageClasses, Menu, MenuGroup, MenuItem, ModalRoot, ModalRootProps, ProgressBarWithInfo, ScrollPanel, ScrollPanelGroup, showContextMenu, showModal, Tabs } from "@decky/ui";
import { VFC, FC, ReactElement, FunctionComponent, CSSProperties, useState, useEffect, useCallback, ReactNode } from "react";
import { ServerApiProperties, useServerApi } from "../hooks/useServerApi";
import { MdDownloading } from "react-icons/md";



interface GameContextProperties {
  game: GameItemProperties
  handleDownload: (game: GameItemProperties) => void
  handleUninstall: (game: GameItemProperties) => void
}


export const GameContext: FunctionComponent<GameContextProperties> = ({game, handleDownload, handleUninstall}) => {
  return (
    <Menu label={game.appName}>
        <MenuItem onClick={!game.appId? () => handleDownload(game) : () => handleUninstall(game)}>
          {!game.appId? "Install" : "Uninstall"}
        </MenuItem>
    </Menu>
  )
}


type URLString=  string
type GameMedia = {
    capsule?: URLString // 170x255
    hero?: URLString
    logo?: URLString
    icon?: URLString
}

export type GameItemProperties = {
    appName: string
    media: GameMedia
    size: number
    executablePath: string,
    directory: string,
    launchOptions: string,
    id: number,
    // appId: number
} 

export type GameItemType = {
  game: GameItemProperties,
  handleDownload: (game: GameItemProperties) => void,
  handleUninstall: (game: GameItemProperties) => void
}

export function IconState({lookupTable, activeState}:
    {
      lookupTable: Record<string, ReactNode>,
      activeState: string
    }
) {
  return (
    <div>
      {
          lookupTable[activeState]
      }
    </div>
  )
}

export type GameState = "Installing" | "Default"

export const GameItem: VFC<GameItemType> = (
  {
    game,
    handleDownload,
    handleUninstall
  }
) => { 

  const [isFocus, setIsFocus] = useState(false)
  const serverActions = useServerApi()

  const [gameStates, setGameState] = useState<GameState>("Default")

  const iconMap: Record<GameState, ReactNode> = {
    "Installing": <MdDownloading/>,
    "Default": <></>

  }

  const style: CSSProperties = {
  }






  return (
    <Focusable 
      onGamepadFocus={() => setIsFocus(true)}
      onGamepadBlur={() => setIsFocus(false)}
      key={`item-root-${game.appName}`}
      onClick={() => showContextMenu(<GameContext game={game} handleDownload={handleDownload} handleUninstall={handleUninstall} />)}
      onActivate={() => showContextMenu(<GameContext game={game} handleDownload={handleDownload} handleUninstall={handleUninstall} />)}
      // onSecondaryActionDescription={
      //   <div><h1>Test</h1></div>
      // }
      style={style}

    > 

      <ButtonItem 
        bottomSeparator="none"
        icon={<IconState lookupTable={iconMap} activeState={gameStates}/>}
        layout="below"
      >
        <img 
          src={game.media.capsule}
          className={libraryAssetImageClasses.Image}
        />
      </ButtonItem>
    </Focusable>
  )
}


export const FilterModal: VFC<ModalRootProps> = () => {
  return (
    <ModalRoot>
      <DialogButton> 
    </ModalRoot>
  )
}

export type GameGridProperties = {
  children?: ReactElement<GameItemProperties, typeof GameItem> | ReactElement<GameItemProperties, typeof GameItem>[]
}

export const GameGrid: FC<GameGridProperties> = ({children}) => {
  const gameItemSize = "170px"

  const style: CSSProperties = {
    display: "grid",
    flexDirection: "row",
    gridTemplateColumns: `repeat(auto-fill, ${gameItemSize})`,
    // gap: "10px",
    justifyContent: "space-between",
  }

  return (
    <Focusable
      style={style}
      noFocusRing={true}
    >
       {children}
    </Focusable>
  )
}



