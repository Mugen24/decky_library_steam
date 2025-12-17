import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  Navigation,
  staticClasses,
} from "@decky/ui";
import {
  definePlugin,
  routerHook } from "@decky/api"
import { FaShip } from "react-icons/fa";
import { StorePage } from "./StorePage";
import { ServerApiProvider } from "./hooks/useServerApi";
import { DownloadManagerProvider } from "./hooks/useDownloadManager";




// Plugin main page (sidebar)
function Content() {
  return (
    <PanelSection title="Panel Section">
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Navigation.Navigate("/storePage");
          }}
        >
          Gamestore
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

export default definePlugin(() => {
  console.log("Template plugin initializing, this is called once on frontend startup")

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

  routerHook.addRoute(`/storePage`, () => (
        <ServerApiProvider>
          <DownloadManagerProvider>
           <StorePage/>
          </DownloadManagerProvider>
        </ServerApiProvider>
  ), {
    exact: true //only change when layout changes
  })

  return {
    // The name shown in various decky menus
    name: "Test Plugin",
    // The element displayed at the top of your plugin's menu
    titleView: <div className={staticClasses.Title}>what is that</div>,
    // The content of your plugin's menu
    content: <Content />,
    // The icon displayed in the plugin list
    icon: <FaShip />,
    // The function triggered when your plugin unloads
    onDismount() {
      console.log("Unloading")
      //serverApi.routerHook.removeRoute("/decky-plugin-test");

      routerHook.removeRoute("/storePage")


      //for (const routeName in routes) {
      //  routerHook.removeRoute(routeName)
      //}

    },
  };
});
