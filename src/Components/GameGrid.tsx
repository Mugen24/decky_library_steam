import { ButtonItem, ConfirmModal, DialogButton, Focusable, focusRingClasses, libraryAssetImageClasses, Menu, MenuGroup, MenuItem, ModalRoot, ModalRootProps, ScrollPanelGroup, showContextMenu, showModal } from "@decky/ui";
import { VFC, FC, ReactElement, FunctionComponent, CSSProperties, useState, useEffect, useCallback } from "react";
import { ServerApiProperties, useServerApi } from "../hooks/useServerApi";



interface GameContextProperties extends GameItemProperties {
  serverActions: ServerApiProperties
}


export const GameContext: FunctionComponent<GameContextProperties> = ({appName, steamAppId, serverActions}) => {
  return (
    <Menu label={appName}>
        <MenuItem onClick={!steamAppId ? () => serverActions.install({appName, steamAppId}) : () => serverActions.uninstall(steamAppId)}>
          {!steamAppId ? "Install" : "Uninstall"}
        </MenuItem>
    </Menu>
  )
}


type URLString=  string
type GameMedia = {
    capsule?: URLString // 170x255
    hero?: URLString
    logo?: URLString
    header?: URLString
    icon?: URLString
    heroblur?: URLString
}

export type GameItemProperties = {
    appName: string
    media: GameMedia
    executablePath: string,
    directory: string,
    launchOptions: string
    steamAppId?: number
} 

export const GameItem: VFC<GameItemProperties> = ({
  appName,
  media,
  executablePath,
  directory,
  launchOptions,
  steamAppId,
}: GameItemProperties
) => { 

  const [isFocus, setIsFocus] = useState(false)
  const serverActions = useServerApi()

  return (
    <Focusable 
      onGamepadFocus={() => setIsFocus(true)}
      onGamepadBlur={() => setIsFocus(false)}
      key={`item-root-${appName}`}
      onClick={() => showContextMenu(<GameContext appName={appName} serverActions={serverActions}/>)}
    > 
      <ButtonItem 
        bottomSeparator="none"
      >
        <img 
          src={media.capsule}
          width={"170px"}
          // height={"200"}
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



