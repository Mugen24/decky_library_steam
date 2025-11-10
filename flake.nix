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
        npm
        (pnpm.override {
          version = 9;
        })
      ];
      shellHook = ''
        export DEBUG=1
      '';
    };
  };
}
