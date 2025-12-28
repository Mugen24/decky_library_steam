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
    if (Object.keys(downloads).length === 0) {
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
        const newDownloads = {...oldDownloads}
        newDownloads[id] = progressInfo
        return newDownloads
    })
  }

  async function removeDownload(id: string) {
    setDownloads(oldDownloads => {
      const newDownloads = {...oldDownloads}
      delete newDownloads[id]
      return newDownloads
    })
  }

  async function showDownloadsModal() {
      const modal = showModal(<DownloadModal closeModal={() => modal.Close()} downloadsRecords={downloads} handleCancel={removeDownload}/>)
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
    install(game)
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
