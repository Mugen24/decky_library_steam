import { ButtonItem, ConfirmModal, DialogButton, Focusable, FocusRing, focusRingClasses, libraryAssetImageClasses, Menu, MenuGroup, MenuItem, ModalRoot, ModalRootProps, ScrollPanelGroup, showContextMenu, showModal } from "@decky/ui";
import { VFC, FC, ReactElement, FunctionComponent, CSSProperties, useState, useEffect, useCallback } from "react";
import { ServerApiProperties, useServerApi } from "../hooks/useServerApi";



interface GameContextProperties {
  game: GameItemProperties
  serverActions: ServerApiProperties
}


export const GameContext: FunctionComponent<GameContextProperties> = ({game, serverActions}) => {
  return (
    <Menu label={game.appName}>
        <MenuItem onClick={!game.appId? () => serverActions.install(game) : () => serverActions.uninstall(game.appId)}>
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


export const GameItem: VFC<GameItemProperties> = (game: GameItemProperties
) => { 

  const [isFocus, setIsFocus] = useState(false)
  const serverActions = useServerApi()

  const style: CSSProperties = {
    padding: 2,
    // filter: isFocus ? 'saturate(3) brightness(200%) blur(50px)' : ''
  }

  return (
    <Focusable 
      onGamepadFocus={() => setIsFocus(true)}
      onGamepadBlur={() => setIsFocus(false)}
      key={`item-root-${game.appName}`}
      onClick={() => showContextMenu(<GameContext game={game} serverActions={serverActions}/>)}
    > 

      <ButtonItem 
        bottomSeparator="none"
        style={style}
      >
        <img 
          src={game.media.capsule}
          // width={"600"}
          // height={"900"}
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



