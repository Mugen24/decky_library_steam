import { ChangeEventHandler, FC, useState } from "react"
import { GameGrid, GameItem } from "./Components/GameGrid"
import { ButtonItem, ControlsList, Field, Focusable, PanelSection, PanelSectionRow, TextField } from "@decky/ui"
import { useServerApi } from "./hooks/useServerApi"
import { AuthButton } from "./Components/ServerAuth"

type StorePageProperties = {
}

export const StorePage: FC<StorePageProperties> = (
{
  
}
) => {

  const {getGames} = useServerApi()
  const [games, setGames] = useState(getGames)
  const [filterString, setFilterString] = useState("")

  return (
    <>
      <PanelSection title="store">
        <PanelSectionRow>
          <Focusable style={{}}>
            <TextField 
              placeholder="search..." 
              onChange={(e) => {setFilterString(e.target.value)}}
            />

            <Focusable style={{display: "flex", flexDirection: "row"}}>
              
              <AuthButton/>
            </Focusable>
          </Focusable>


        </PanelSectionRow>
        <PanelSectionRow>
          <GameGrid>
            {
              games
              .filter(g => filterString ? g.appName.toLowerCase().includes(filterString.toLowerCase()) : true)
              .map(g => 
                  <GameItem 
                    appName={g.appName}
                    media={g.media}
                  />
                )
            }       
          </GameGrid>
        </PanelSectionRow>
      </PanelSection>
    </>
  )

}
