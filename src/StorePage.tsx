import { ChangeEventHandler, CSSProperties, FC, useEffect, useState } from "react"
import { GameGrid, GameItem, GameItemProperties } from "./Components/GameGrid"
import { ButtonItem, ControlsList, Field, Focusable, ModalPosition, ModalRoot, Navigation, PanelSection, PanelSectionRow, ProgressBarWithInfo, showModal, TextField } from "@decky/ui"
import { useServerApi } from "./hooks/useServerApi"
import { AuthButton } from "./Components/ServerAuth"
import { DownloadInfo, DownloadModal } from "./Components/DownloadModal"
import { useDownloadManager } from "./hooks/useDownloadManager"

type StorePageProperties = {
}

export const StorePage: FC<StorePageProperties> = () => {

  const {isAuthenticated, getGames, install} = useServerApi()
  const [games, setGames] = useState<undefined | GameItemProperties[]>(undefined)
  const [filterString, setFilterString] = useState("")
  // const [downloadRecords, setDownloadRecords] = useState<Record<string, DownloadInfo>>({})
  const {addDownload, removeDownload, downloads, showDownloadsModal} = useDownloadManager()

  
  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        console.log(`Games: ${games}`)
        if (!games || games.length === 0) {
          const g = await getGames()  
          setGames(g)
        }
      }
    })()
  }, [games, isAuthenticated])

  const style: CSSProperties = {
    overflow: "scroll",
    maxHeight: "90%"
  }
  useEffect(() => {
  }, [])


  return (
    <Focusable
      style={style} 
    >
          <Focusable style={{}}>
            <TextField 
              onChange={(e) => {setFilterString(e.target.value)}}
            />

            <Focusable 
              style={
                {
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end"
                }
              }>
              <AuthButton/>
              <ButtonItem 
                onClick={() => {
                  //const modal = showModal(<DownloadModal closeModal={() => modal.Close()} downloadsRecords={downloads}/>)
                  showDownloadsModal()
                }}
              >
                Downloads
              </ButtonItem>
            </Focusable>


          </Focusable>

          <Focusable>
            <GameGrid>
              {
                games ?
                games
                .filter(g => filterString ? g.appName.toLowerCase().includes(filterString.toLowerCase()) : true)
                .map(g => 
                    <GameItem 
                      game={{
                          appName: g.appName,
                          media: g.media,
                          executablePath: g.executablePath,
                          directory: g.directory,
                          launchOptions: g.launchOptions,
                          id: g.id,
                          size: 0,
                      }}
                      handleDownload={addDownload}
                      handleUninstall={removeDownload}

                    />
                  )
                : []
              }       
            </GameGrid>
          </Focusable>
    </Focusable>
  )

}
