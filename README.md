# Plugin Template: https://github.com/SteamDeckHomebrew/decky-loader 
# Deck wiki: https://wiki.deckbrew.xyz/en/plugin-dev/getting-started 

# Install dep
``bash
npm i pnpm@9 #deprecated?
pnpm i
pnpm run build
``

# Frontend debugging:
    https://wiki.deckbrew.xyz/en/plugin-dev/cef-debugging    
    !!note 
        on bazzite CEF port forward needs to be manually enable 
        sh ~/CEF_forward.sh



# In case Junk store dep doesn't install
export DECKY_PLUGIN_RUNTIME_DIR=~/homebrew/data/Junk Store
export PYTHONPATH=~/homebrew/plugins/Junk Store/scripts:$PYTHONPATH:~/homebrew/plugins/Junk Store/scripts/shared
export DECKY_PLUGIN_DIR=~/homebrew/plugins/Junk Store
export DECKY_PLUGIN_LOG_DIR=~/homebrew/logs/Junk Store
cd ~/homebrew/plugins/Junk Store
./scripts/install_deps.sh

# BUGS:
    Rework download modals:
        Description:
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

          - The function remove_game can't actually be awaited from backend 
          since the download loop is inside a thread. 
          There is a chance where
        
          1. removeDownload
          2. remove_game
          3. setDownload -> remove from download state
          4. backend consumers ->
            - emit download_progress
            - then sees state == "removed"
            - then exits

            The emit download_progress events 
            then propagate into the frontend updateDownload 
            and then added back into the UI even though it's already 
            removed and stopped from the backend

         Solutions:
            - Instead of deleting it from the downloads useState
            - we keep it but add a state prop then mark it as deleted
            - so when the event update we know the that entry is already been marked as deleted




        
        
