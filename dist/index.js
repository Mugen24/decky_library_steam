// Decky Loader will pass this api in, it's versioned to allow for backwards compatibility.
// @ts-ignore

// Prevents it from being duplicated in output.
const manifest = {"name":"Deck_Library_Steam","author":"John Doe","flags":["debug","_root"],"api_version":1,"publish":{"tags":["template","root"],"description":"Decky library steam plugin."}};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
// Initialize
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
// Version 1 throws on version mismatch so we have to account for that here.
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
// TODO these could use a lot of JSDoc
const call = api.call;
const addEventListener = api.addEventListener;
const removeEventListener = api.removeEventListener;
const routerHook = api.routerHook;
const definePlugin = (fn) => {
    return (...args) => {
        // TODO: Maybe wrap this
        return fn(...args);
    };
};

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var {
        attr,
        size,
        title
      } = props,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaShip (props) {
  return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 640 512"},"child":[{"tag":"path","attr":{"d":"M496.616 372.639l70.012-70.012c16.899-16.9 9.942-45.771-12.836-53.092L512 236.102V96c0-17.673-14.327-32-32-32h-64V24c0-13.255-10.745-24-24-24H248c-13.255 0-24 10.745-24 24v40h-64c-17.673 0-32 14.327-32 32v140.102l-41.792 13.433c-22.753 7.313-29.754 36.173-12.836 53.092l70.012 70.012C125.828 416.287 85.587 448 24 448c-13.255 0-24 10.745-24 24v16c0 13.255 10.745 24 24 24 61.023 0 107.499-20.61 143.258-59.396C181.677 487.432 216.021 512 256 512h128c39.979 0 74.323-24.568 88.742-59.396C508.495 491.384 554.968 512 616 512c13.255 0 24-10.745 24-24v-16c0-13.255-10.745-24-24-24-60.817 0-101.542-31.001-119.384-75.361zM192 128h256v87.531l-118.208-37.995a31.995 31.995 0 0 0-19.584 0L192 215.531V128z"},"child":[]}]})(props);
}

var ELibraryAssetType;
(function (ELibraryAssetType) {
    ELibraryAssetType[ELibraryAssetType["Capsule"] = 0] = "Capsule";
    ELibraryAssetType[ELibraryAssetType["Hero"] = 1] = "Hero";
    ELibraryAssetType[ELibraryAssetType["Logo"] = 2] = "Logo";
    ELibraryAssetType[ELibraryAssetType["Header"] = 3] = "Header";
    ELibraryAssetType[ELibraryAssetType["Icon"] = 4] = "Icon";
    ELibraryAssetType[ELibraryAssetType["HeroBlur"] = 5] = "HeroBlur";
})(ELibraryAssetType || (ELibraryAssetType = {}));
//@ts-ignore
const ServerApiContext = SP_REACT.createContext({});
function ServerApiProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = SP_REACT.useState(false);
    const setServerEndpoint = async (serverConfig) => {
        console.debug("Connecting to server");
        await call("set_server_endpoint", serverConfig);
        call("is_authenticated")
            .then(resp => {
            setIsAuthenticated(resp);
        });
    };
    // const authenticationListener = addEventListener<[
    //   isAuthenticated: boolean
    // ]>("authentication", (isAuthenticated) => {
    // });
    SP_REACT.useEffect(() => {
        call("is_authenticated")
            .then(resp => {
            setIsAuthenticated(resp);
        });
    }, []);
    const getGames = SP_REACT.useCallback(async () => {
        const games = await call("list_games");
        return games;
    }, []);
    const install = async (game) => {
        console.debug(`Install: ${game}`);
        const appId = await SteamClient.Apps.AddShortcut(game.appName, game.executablePath, game.directory, game.launchOptions);
        console.debug(`game_info: ${game.id}, appId: ${appId}`);
        //TODO: remove later
        //Need testing: Apps.SetXXX needs to be run at least once to show shortcut
        //in UI
        SteamClient.Apps.SetAppLaunchOptions(appId, `appId=${appId}`);
        // SteamClient.Apps.SpecifyCompatTool
        // const data = await SteamClient.Apps.GetAvailableCompatTools(appId)
        // console.debug(`available_compatools: appId: ${game.appName}  ${JSON.stringify(data)}`)
        //TODO: Make this more robust
        SteamClient.Apps.SpecifyCompatTool(appId, "proton_10");
        call("download_asset_base64", game.media.hero)
            .then(base64 => {
            SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Hero);
        });
        call("download_asset_base64", game.media.capsule)
            .then(base64 => {
            SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Capsule);
        });
        call("download_asset_base64", game.media.icon)
            .then(base64 => {
            SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Icon);
        });
        call("download_asset_base64", game.media.logo)
            .then(base64 => {
            SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Logo);
        });
        // getBase64Image(game.media.hero!, async (base64: string) => {
        //   SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Hero)
        // })
        // getBase64Image(game.media.capsule!, async (base64: string) => {
        //   SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Capsule)
        // })
        // //TODO: setting icon does not work
        // getBase64Image(game.media.icon!, async (base64: string) => {
        //   SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Icon)
        // })
        // getBase64Image(game.media.logo!, async (base64: string) => {
        //   SteamClient.Apps.SetCustomArtworkForApp(appId, base64, "png", ELibraryAssetType.Logo)
        // })
        const outcome = await call("install_game", game, appId);
        return outcome;
    };
    const uninstall = async (game) => {
        console.debug(`Uninstall to be implemented: ${game}`);
        // ISteamClient.Apps.RemoveShortcut(appId)
    };
    const value = {
        getGames,
        install,
        uninstall,
        setServerEndpoint,
        isAuthenticated
    };
    return (window.SP_REACT.createElement(ServerApiContext.Provider, { value: value }, children));
}
//@ts-ignore
const useServerApi = () => SP_REACT.useContext(ServerApiContext);

// THIS FILE IS AUTO GENERATED
function MdDownloading (props) {
  return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 24 24"},"child":[{"tag":"path","attr":{"fill":"none","d":"M0 0h24v24H0z"},"child":[]},{"tag":"path","attr":{"d":"M18.32 4.26A9.949 9.949 0 0 0 13 2.05v2.02c1.46.18 2.79.76 3.9 1.62l1.42-1.43zM19.93 11h2.02c-.2-2.01-1-3.84-2.21-5.32L18.31 7.1a7.941 7.941 0 0 1 1.62 3.9zm-1.62 5.9 1.43 1.43a9.981 9.981 0 0 0 2.21-5.32h-2.02a7.945 7.945 0 0 1-1.62 3.89zM13 19.93v2.02c2.01-.2 3.84-1 5.32-2.21l-1.43-1.43c-1.1.86-2.43 1.44-3.89 1.62zM13 12V7h-2v5H7l5 5 5-5h-4zm-2 7.93v2.02c-5.05-.5-9-4.76-9-9.95s3.95-9.45 9-9.95v2.02C7.05 4.56 4 7.92 4 12s3.05 7.44 7 7.93z"},"child":[]}]})(props);
}

const GameContext = ({ game, handleDownload, handleUninstall }) => {
    return (window.SP_REACT.createElement(DFL.Menu, { label: game.appName },
        window.SP_REACT.createElement(DFL.MenuItem, { onClick: !game.appId ? () => handleDownload(game) : () => handleUninstall(game) }, !game.appId ? "Install" : "Uninstall")));
};
function IconState({ lookupTable, activeState }) {
    return (window.SP_REACT.createElement("div", null, lookupTable[activeState]));
}
const GameItem = ({ game, handleDownload, handleUninstall }) => {
    const [isFocus, setIsFocus] = SP_REACT.useState(false);
    useServerApi();
    const [gameStates, setGameState] = SP_REACT.useState("Default");
    const iconMap = {
        "Installing": window.SP_REACT.createElement(MdDownloading, null),
        "Default": window.SP_REACT.createElement(window.SP_REACT.Fragment, null)
    };
    const style = {};
    return (window.SP_REACT.createElement(DFL.Focusable, { onGamepadFocus: () => setIsFocus(true), onGamepadBlur: () => setIsFocus(false), key: `item-root-${game.appName}`, onClick: () => DFL.showContextMenu(window.SP_REACT.createElement(GameContext, { game: game, handleDownload: handleDownload, handleUninstall: handleUninstall })), onActivate: () => DFL.showContextMenu(window.SP_REACT.createElement(GameContext, { game: game, handleDownload: handleDownload, handleUninstall: handleUninstall })), 
        // onSecondaryActionDescription={
        //   <div><h1>Test</h1></div>
        // }
        style: style },
        window.SP_REACT.createElement(DFL.ButtonItem, { bottomSeparator: "none", icon: window.SP_REACT.createElement(IconState, { lookupTable: iconMap, activeState: gameStates }), layout: "below" },
            window.SP_REACT.createElement("img", { src: game.media.capsule, className: DFL.libraryAssetImageClasses.Image }))));
};
const GameGrid = ({ children }) => {
    const gameItemSize = "170px";
    const style = {
        display: "grid",
        flexDirection: "row",
        gridTemplateColumns: `repeat(auto-fill, ${gameItemSize})`,
        // gap: "10px",
        justifyContent: "space-between",
    };
    return (window.SP_REACT.createElement(DFL.Focusable, { style: style, noFocusRing: true }, children));
};

const AuthModal = ({ closeModal, setServerEndpoint }) => {
    const [ip, setIp] = SP_REACT.useState("http://192.168.0.29");
    const [port, setPort] = SP_REACT.useState(9543);
    const [buttonText, setButtonText] = SP_REACT.useState("Connect");
    function connect() {
        setButtonText("Connecting...");
        setServerEndpoint({
            "ip": ip,
            "port": port
        })
            .then((_) => {
            closeModal();
        });
    }
    return (window.SP_REACT.createElement(DFL.ModalRoot
    // onEscKeypress={() => closeModal()}  //what does this do then??
    , { 
        // onEscKeypress={() => closeModal()}  //what does this do then??
        bHideCloseIcon: false, onCancel: closeModal },
        window.SP_REACT.createElement(DFL.Focusable, { onCancel: () => closeModal() },
            window.SP_REACT.createElement(DFL.TextField, { value: ip, onChange: (v) => setIp(v.target.value), label: "serverconfig-ipaddr" }),
            window.SP_REACT.createElement(DFL.TextField, { mustBeNumeric: true, value: String(port), onChange: (v) => setPort(Number(v.target.value)), label: "serverconfig-port" }),
            window.SP_REACT.createElement(DFL.ButtonItem, { onClick: connect }, buttonText))));
};
const AuthButton = ({}) => {
    const { isAuthenticated, setServerEndpoint } = useServerApi();
    return (window.SP_REACT.createElement(DFL.ButtonItem, { onClick: () => {
            const modal = DFL.showModal(window.SP_REACT.createElement(AuthModal, { setServerEndpoint: setServerEndpoint, closeModal: () => modal.Close() }));
        } }, isAuthenticated ? "Connected" : "Disconnected"));
};

// THIS FILE IS AUTO GENERATED
function RiCloseFill (props) {
  return GenIcon({"tag":"svg","attr":{"viewBox":"0 0 24 24","fill":"currentColor"},"child":[{"tag":"path","attr":{"d":"M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"},"child":[]}]})(props);
}

function GameProgress({ downloadInfo }) {
    return (window.SP_REACT.createElement(window.SP_REACT.Fragment, null,
        window.SP_REACT.createElement(DFL.Focusable, { style: {} },
            window.SP_REACT.createElement("p", null, downloadInfo.game.appName),
            window.SP_REACT.createElement("div", { style: {
                    display: "flex",
                    justifyContent: "space-between"
                } },
                window.SP_REACT.createElement(DFL.ProgressBarWithInfo, { nProgress: downloadInfo.progress, sOperationText: window.SP_REACT.createElement("small", null, downloadInfo.description), layout: "inline", focusable: false }),
                window.SP_REACT.createElement(DFL.Focusable, { style: {
                        flex: 1,
                        flexDirection: "row"
                    } },
                    window.SP_REACT.createElement(DFL.ButtonItem, null,
                        window.SP_REACT.createElement(RiCloseFill, null)))))));
}
function DownloadModal({ closeModal, downloadsRecords }) {
    return (window.SP_REACT.createElement(DFL.ModalRoot, { onEscKeypress: () => closeModal(), onCancel: () => closeModal() },
        window.SP_REACT.createElement(DFL.PanelSection, null, Object.values(downloadsRecords).map(d => {
            return (window.SP_REACT.createElement(GameProgress, { downloadInfo: d }));
        }))));
}

const DownloadManagerContext = SP_REACT.createContext({});
function DownloadManagerProvider({ children }) {
    const [downloads, setDownloads] = SP_REACT.useState({});
    const { install, uninstall } = useServerApi();
    const modalUpdates = SP_REACT.useRef();
    function updateDownload(id, progressInfo) {
        console.log("Updating Download", progressInfo);
        if (modalUpdates.current) {
            const modal = modalUpdates.current;
            modal.Update(window.SP_REACT.createElement(DownloadModal, { closeModal: () => modal.Close(), downloadsRecords: downloads }));
        }
        setDownloads((oldDownloads) => {
            oldDownloads[id] = progressInfo;
            return oldDownloads;
        });
    }
    async function removeDownload(game) {
        setDownloads(oldDownloads => {
            delete oldDownloads[game.id];
            return oldDownloads;
        });
    }
    async function showDownloadsModal() {
        const modal = DFL.showModal(window.SP_REACT.createElement(DownloadModal, { closeModal: () => modal.Close(), downloadsRecords: downloads }));
        modalUpdates.current = modal;
    }
    SP_REACT.useEffect(() => {
        const l = addEventListener("download_progress", updateDownload);
        return () => {
            removeEventListener("download_progress", l);
        };
    }, []);
    async function addDownload(game) {
        updateDownload(`${game.id}`, {
            "game": game,
            "description": "",
            "progress": 0
        });
        await install(game);
        // removeDownload(game)
    }
    const value = {
        addDownload,
        downloads,
        removeDownload,
        showDownloadsModal
    };
    return (window.SP_REACT.createElement(DownloadManagerContext.Provider, { value: value }, children));
}
const useDownloadManager = () => SP_REACT.useContext(DownloadManagerContext);

const StorePage = () => {
    const { isAuthenticated, getGames, install, uninstall } = useServerApi();
    const [games, setGames] = SP_REACT.useState(undefined);
    const [filterString, setFilterString] = SP_REACT.useState("");
    // const [downloadRecords, setDownloadRecords] = useState<Record<string, DownloadInfo>>({})
    const { addDownload, removeDownload, downloads, showDownloadsModal } = useDownloadManager();
    SP_REACT.useEffect(() => {
        (async () => {
            if (isAuthenticated) {
                if (!games) {
                    const games = await getGames();
                    setGames(games);
                }
            }
        })();
    }, [games, isAuthenticated]);
    const style = {
        overflow: "scroll",
        maxHeight: "90%"
    };
    SP_REACT.useEffect(() => {
    }, []);
    return (window.SP_REACT.createElement(DFL.Focusable, { style: style },
        window.SP_REACT.createElement(DFL.Focusable, { style: {} },
            window.SP_REACT.createElement(DFL.TextField, { onChange: (e) => { setFilterString(e.target.value); } }),
            window.SP_REACT.createElement(DFL.Focusable, { style: {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end"
                } },
                window.SP_REACT.createElement(AuthButton, null),
                window.SP_REACT.createElement(DFL.ButtonItem, { onClick: () => {
                        //const modal = showModal(<DownloadModal closeModal={() => modal.Close()} downloadsRecords={downloads}/>)
                        showDownloadsModal();
                    } }, "Downloads"))),
        window.SP_REACT.createElement(DFL.Focusable, null,
            window.SP_REACT.createElement(GameGrid, null, games ?
                games
                    .filter(g => filterString ? g.appName.toLowerCase().includes(filterString.toLowerCase()) : true)
                    .map(g => window.SP_REACT.createElement(GameItem, { game: {
                        appName: g.appName,
                        media: g.media,
                        executablePath: g.executablePath,
                        directory: g.directory,
                        launchOptions: g.launchOptions,
                        id: g.id,
                        size: 0,
                    }, handleDownload: addDownload, handleUninstall: removeDownload }))
                : []))));
};

// Plugin main page (sidebar)
function Content() {
    return (window.SP_REACT.createElement(DFL.PanelSection, { title: "Panel Section" },
        window.SP_REACT.createElement(DFL.PanelSectionRow, null,
            window.SP_REACT.createElement(DFL.ButtonItem, { layout: "below", onClick: () => {
                    DFL.Navigation.Navigate("/storePage");
                } }, "Gamestore"))));
}
var index = definePlugin(() => {
    console.log("Template plugin initializing, this is called once on frontend startup");
    // Add an event listener to the "timer_event" event from the backend
    /*
    const listener = addEventListener<[
      test1: string,
      test2: boolean,
      test3: number
    ]>("timer_event", (test1, test2, test3) => {
      console.log("Template got timer_event with:", test1, test2, test3)
      toaster.toast({
        title: "template got timer_event",
        body: `${test1}, ${test2}, ${test3}`
      });
    });
    */
    routerHook.addRoute(`/storePage`, () => (window.SP_REACT.createElement(ServerApiProvider, null,
        window.SP_REACT.createElement(DownloadManagerProvider, null,
            window.SP_REACT.createElement(StorePage, null)))), {
        exact: true //only change when layout changes
    });
    return {
        // The name shown in various decky menus
        name: "Decky Library Steam",
        // The element displayed at the top of your plugin's menu
        titleView: window.SP_REACT.createElement("div", { className: DFL.staticClasses.Title }, "what is that"),
        // The content of your plugin's menu
        content: window.SP_REACT.createElement(Content, null),
        // The icon displayed in the plugin list
        icon: window.SP_REACT.createElement(FaShip, null),
        // The function triggered when your plugin unloads
        onDismount() {
            console.log("Unloading");
            //serverApi.routerHook.removeRoute("/decky-plugin-test");
            routerHook.removeRoute("/storePage");
            //for (const routeName in routes) {
            //  routerHook.removeRoute(routeName)
            //}
        },
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
