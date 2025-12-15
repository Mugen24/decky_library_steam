import { ButtonItem, DialogButton, Focusable, joinClassNames, ModalRoot, ModalRootProps, showModal, TextField } from "@decky/ui"
import { ServerConfig, useServerApi } from "../hooks/useServerApi"
import { FC, useState } from "react"

export interface AuthModalProperties extends Omit<ModalRootProps, "closeModal"> {
  closeModal: () => any
  setServerEndpoint: (serverConfig: ServerConfig) => Promise<void>
}

export const AuthModal: FC<AuthModalProperties> = ({closeModal, setServerEndpoint}) => {
  const [ip, setIp] = useState<string>("http://192.168.0.29")
  const [port, setPort] = useState<number>(9543)
  const [buttonText, setButtonText] = useState("Connect")
  function connect() {
    setButtonText("Connecting...")
    setServerEndpoint({
      "ip": ip!,
      "port": port!
    })
    .then((_) => {
      closeModal()
    })
  }



  return (
    <ModalRoot 
      // onEscKeypress={() => closeModal()}  //what does this do then??
      bHideCloseIcon={false}
      onCancel={closeModal}
    >
      <Focusable onCancel={() => closeModal()}>
        <TextField value={ip} onChange={(v) => setIp(v.target.value)} label="serverconfig-ipaddr"/>
        <TextField mustBeNumeric value={String(port)} onChange={(v) => setPort(Number(v.target.value))} label="serverconfig-port"/>
        <ButtonItem onClick={connect}>
          {buttonText}
        </ButtonItem>
      </Focusable>
    </ModalRoot>
  )
}



export interface AuthButtonProperties {
}

export const AuthButton: FC<AuthButtonProperties> = ({}) => {
  const {isAuthenticated, setServerEndpoint} = useServerApi()
  
  return (
      <ButtonItem onClick={
          () => {
              const modal = showModal(<AuthModal setServerEndpoint={setServerEndpoint} closeModal={() => modal.Close()}/>)
          }
        }
      >
        {isAuthenticated ? "Connected" : "Disconnected"} 
      </ButtonItem>
  )
}
