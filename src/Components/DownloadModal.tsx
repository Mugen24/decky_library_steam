import { ButtonItem, Focusable, ModalRoot, PanelSection, ProgressBarWithInfo } from "@decky/ui"
import { GameItemProperties } from "./GameGrid"
import { RiCloseFill } from "react-icons/ri";

export type DownloadInfo = {
  game: GameItemProperties
  progress: number
  description: string
  fileSize: number | undefined
}
export type DownloadModalType = {
  closeModal: () => void
  downloadsRecords: Record<string, DownloadInfo> 
//   handleCancel: (id: string) => void
//   handlePause: (id: string) => void
//   handlePlay: (id: string) => void
}

export function GameProgress({downloadInfo}: {downloadInfo: DownloadInfo}) {
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
            <ButtonItem>
              <RiCloseFill/>
            </ButtonItem>
          </Focusable>
        </div>

      </Focusable>
    </>
  )
}

export function DownloadModal({closeModal, downloadsRecords}: DownloadModalType) {
  return (
    <ModalRoot
      onEscKeypress={() => closeModal()}
      onCancel={() => closeModal()}
    >
      <PanelSection>
        {Object.values(downloadsRecords).map(d => {
          return (
            <GameProgress downloadInfo={d}/>
          )
        })}
      </PanelSection>
    </ModalRoot>
  )
}



