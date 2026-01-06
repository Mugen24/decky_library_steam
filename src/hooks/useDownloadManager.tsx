import { createContext, ReactElement, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { GameItemProperties, GameItemType } from "../Components/GameGrid";
import { DownloadInfo, DownloadModal } from "../Components/DownloadModal";
import { useServerApi } from "./useServerApi";
import { addEventListener, removeEventListener } from "@decky/api";
import { showModal, ShowModalResult } from "@decky/ui";

export interface DownloadManagerType {
  addDownload: (game: GameItemProperties) => Promise<void>
  removeDownload: (game: GameItemProperties) => Promise<void>
  downloads: Record<string, DownloadInfo>
  showDownloadsModal: () => void
}

const DownloadManagerContext = createContext<DownloadManagerType>({})

export function DownloadManagerProvider(
  {children}:
  {
    children: ReactElement
  }

) {
  const [downloads, setDownloads] = useState<Record<string, DownloadInfo>>({})
  const {
    install, 
    remove_game,
    pause_game,
    priority_install,
    emit_download_records
  } = useServerApi()
  const modalUpdates = useRef<ShowModalResult>()

  function updateDownload(id: string, progressInfo: DownloadInfo) {
    console.log("Updating Download", progressInfo)
    const newDownloads = {...downloads}
    newDownloads[id] = progressInfo
    setDownloads(newDownloads)
  }

  async function removeDownload(game: GameItemProperties) {
    await remove_game(game)
    setDownloads(oldDownloads => {
      const newDownloads = {...oldDownloads}
      delete newDownloads[game.id]
      return newDownloads
    })
  }

  async function showDownloadsModal() {
      const modal = showModal(
        <DownloadModal 
            closeModal={() => modal.Close()} 
            downloadRecords={downloads} 
            handleCancel={removeDownload}
            handlePause={pause_game}
            handleStartDownload={priority_install}
          />
      )
      modalUpdates.current = modal
  }

 
  useEffect(() => {
    if (modalUpdates.current) {
      const modal = modalUpdates.current
      modal.Update(<DownloadModal 
                   closeModal={() => modal.Close()} 
                   downloadRecords={downloads}
                   handleCancel={removeDownload}
                   handlePause={pause_game}
                   handleStartDownload={priority_install}
                   />
      ) 
    }

  }, [downloads])

  useEffect(() => {
    const l = addEventListener("download_progress", updateDownload)
    emit_download_records()
    return () => {
      removeEventListener("download_progress", l)
    }
  }, [])


  async function addDownload(game: GameItemProperties) {
    updateDownload(`${game.id}`, {
      "game": game,
      "description": "",
      "progress": 0,
      "fileSize": undefined 
    })
    install(game)
  }


  const value = {
    addDownload,
    downloads,
    removeDownload,
    showDownloadsModal
  }

  return (
    <DownloadManagerContext.Provider
      value={value}
    >
      {children}
    </DownloadManagerContext.Provider>
  )
}

export const useDownloadManager = () => useContext<DownloadManagerType>(DownloadManagerContext) as DownloadManagerType
