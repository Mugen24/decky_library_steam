import { SteamClient } from "@decky/ui";
export {}

interface ISteamClient extends Omit<SteamClient, "Apps"> {
  Apps: {
      AddShortcut: (appName: string, executablePath: string, directory: string, launchOptions: string) => Promise<number>;
      RemoveShortcut: (appId: number) => void;
      RunGame: (gameId: string, _1: string, _2: number, _3: number) => void;
      TerminateApp: (gameId: string, _1: boolean) => void;
      SetAppHidden: (appId: number, value: boolean) => void;
      SetAppLaunchOptions: (appId: number, options: string) => void;
      SetShortcutName: (appId: number, name: string) => void;
      SetShortcutLaunchOptions: (appId: number, options: string) => void;
      SetShortcutExe: (appId: number, exe: string) => void;
      SetShortcutStartDir: (appId: number, directory: string) => void;
      SpecifyCompatTool: (appId: number, strToolName: string) => void;
  } 
}

declare global {
  var ISteamClient: ISteamClient
}
