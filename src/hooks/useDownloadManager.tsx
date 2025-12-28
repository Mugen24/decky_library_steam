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
  const {install, uninstall} = useServerApi()
  const modalUpdates = useRef<ShowModalResult>()

  useEffect(() => {
    if (!downloads) {
      const downloadList = localStorage.getItem("library_steam_download_list")
      try {
        if (downloadList) {
          setDownloads(JSON.parse(downloadList))
        }
      }
      catch (error){
        console.log(error)
      }
    }
    else {
      localStorage.setItem("library_steam_download_list", JSON.stringify(downloads))
    }
  }, [downloads])


  function updateDownload(id: string, progressInfo: DownloadInfo) {
    console.log("Updating Download", progressInfo)
    if (modalUpdates.current) {
      const modal = modalUpdates.current
      modal.Update(<DownloadModal closeModal={() => modal.Close()} downloadsRecords={downloads}/>) 
    }

    setDownloads((oldDownloads) => {
        oldDownloads[id] = progressInfo
        return oldDownloads
    })
  }

  async function removeDownload(game: GameItemProperties) {
    setDownloads(oldDownloads => {
      delete oldDownloads[game.id]
      return oldDownloads
    })
  }

  async function showDownloadsModal() {
      const modal = showModal(<DownloadModal closeModal={() => modal.Close()} downloadsRecords={downloads}/>)
      modalUpdates.current = modal
  }

 

  useEffect(() => {
    const l = addEventListener("download_progress", updateDownload)
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
    await install(game)
    // removeDownload(game)
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
