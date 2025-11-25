{
  description = "Decky auto steam";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }: 
  let 
    system = "x86_64-linux";
    pkgs = import nixpkgs { 
      inherit system; 
    };
  in
  {
    devShells."${system}".default = pkgs.mkShell {
      packages = with pkgs; [
        rsync
        putty
        (nodePackages.pnpm.override {
          version = "9.0.0";
          hash = "sha256-vfyaezcrXEYhdpk+WGSSYD4g2lhk0viIHtwkYkgsdvo=";
        })
      ];
      shellHook = ''
        export DEBUG=1
        export DECK_IP=192.168.0.51
        export DECK_USER=root
        export PLUGIN_PATH=/home/mugen/Programing/decky_env/decky_library_steam
      '';
    };
  };
}
