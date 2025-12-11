import { ChangeEventHandler, FC, useEffect, useState } from "react"
import { GameGrid, GameItem, GameItemProperties } from "./Components/GameGrid"
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
  const [games, setGames] = useState<undefined | GameItemProperties[]>(undefined)
  const [filterString, setFilterString] = useState("")

  useEffect(() => {
    (async () => {
      if (!games) {
        const games = await getGames()  
        setGames(games)
      }
    })()
  }, [games])


  console.log("store", games)
  return (
    <>
      <PanelSection title="store">
        <PanelSectionRow>
          <Focusable style={{}}>
            <TextField 
              placeholder="search..." 
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
            </Focusable>
          </Focusable>


        </PanelSectionRow>
        <PanelSectionRow>
          <GameGrid>
            {
              games ?
              games
              .filter(g => filterString ? g.appName.toLowerCase().includes(filterString.toLowerCase()) : true)
              .map(g => 
                  <GameItem 
                    appName={g.appName}
                    media={g.media}
                    executablePath={g.executablePath}
                    directory={g.directory}
                    launchOptions={g.launchOptions}
                    id={g.id}
                    appId={g.appId}
                  />
                )
              : []
            }       
          </GameGrid>
        </PanelSectionRow>
      </PanelSection>
    </>
  )

}
