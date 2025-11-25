import { ButtonItem, DialogButton, Focusable, ModalRoot, ModalRootProps, showModal, TextField } from "@decky/ui"
import { ServerConfig, useServerApi } from "../hooks/useServerApi"
import { FC } from "react"

export interface AuthModalProperties extends Omit<ModalRootProps, "closeModal"> {
  closeModal: () => any
}

export const AuthModal: FC<AuthModalProperties> = ({closeModal}) => {
  return (
    <ModalRoot 
      // onEscKeypress={() => closeModal()}  //what does this do then??
      bHideCloseIcon={false}
    >
      <Focusable onCancel={() => closeModal()}>
        <TextField label="serverconfig-ipaddr"/>
        <TextField mustBeNumeric label="serverconfig-port"/>
        <DialogButton onClick={() => closeModal()}>
          Connect
        </DialogButton>
      </Focusable>
    </ModalRoot>
  )
}



export interface AuthButtonProperties {
}

export const AuthButton: FC<AuthButtonProperties> = ({}) => {
  const {isAuthenticated} = useServerApi()
  
  return (
      <ButtonItem onClick={
          () => {
              const modal = showModal(<AuthModal closeModal={() => modal.Close()}/>)
          }
        }
      >
        {isAuthenticated ? "Connected" : "Disconnected"} 
      </ButtonItem>
  )
}
