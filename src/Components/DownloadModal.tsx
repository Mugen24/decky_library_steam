import { ButtonItem, Focusable, ModalRoot, PanelSection, ProgressBarWithInfo } from "@decky/ui"
import { GameItemProperties } from "./GameGrid"
import { RiCloseFill } from "react-icons/ri";
import { useState } from "react";
import { FaPlay, FaPause } from "react-icons/fa";

export type DownloadInfo = {
  game: GameItemProperties
  progress: number
  description: string
  fileSize: number | undefined
}
export type DownloadModalType = {
  closeModal: () => void
  downloadRecords: Record<string, DownloadInfo>
  handleCancel: (game: GameItemProperties) => Promise<void>
  handlePause: (game: GameItemProperties) => Promise<void>
  handleStartDownload: (game: GameItemProperties) => Promise<void>
}

export type DownloadState = "downloading" | "paused" 



export interface GameProgressType extends Omit<DownloadModalType, "downloadRecords" | "closeModal"> {
  downloadInfo: DownloadInfo
}

export function GameProgress({
  downloadInfo,
  handleCancel,
  handleStartDownload,
  handlePause,
}: GameProgressType) {
  const [dlState, setDlState] = useState<DownloadState>("downloading")

  function getDlStateButton() {
    let handler = undefined
    let icon = undefined
    if (dlState === "downloading") {
      icon = (
          <FaPause/>
      )
      handler = () => {
        setDlState("paused")
        handlePause(downloadInfo.game)
      }
    }
    else if  (dlState === "paused") {
      icon = <FaPlay/>
      handler = () => {
        setDlState("downloading")
        handleStartDownload(downloadInfo.game)
      }
    }
    else {
      throw new Error("Undefined state")
    }

    return (
      <ButtonItem onClick={() => handler()}>
        {icon}
      </ButtonItem>
    )
  }

  return (
    <>
      <Focusable
        style={{
        }}
      >
        <p>{downloadInfo.game.appName}</p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <ProgressBarWithInfo
            nProgress={downloadInfo.progress}
            sOperationText={<small>{downloadInfo.description}</small>}
            layout="inline"
            focusable={false}
          />
          <Focusable
            style={{
              flex: 1,
              flexDirection: "row"
            }}
          >
            {getDlStateButton()}

            <ButtonItem
              onClick={() => {
                handleCancel(downloadInfo.game)
              }}
            >
              <RiCloseFill/>
            </ButtonItem>
          </Focusable>
        </div>

      </Focusable>
    </>
  )
}

export function DownloadModal(
  {
    closeModal,
    downloadRecords,
    handleCancel,
    handlePause,
    handleStartDownload,
  }: DownloadModalType) {
  return (
    <ModalRoot
      onEscKeypress={() => closeModal()}
      onCancel={() => closeModal()}
    >
      <PanelSection>
        {Object.values(downloadRecords).map(d => {
          return (
            <GameProgress 
              downloadInfo={d}
              handleStartDownload={handleStartDownload}
              handlePause={handlePause}
              handleCancel={handleCancel}
            />
          )
        })}
      </PanelSection>
    </ModalRoot>
  )
}



