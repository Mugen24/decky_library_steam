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
