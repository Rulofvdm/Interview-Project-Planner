{
  description = "Dev shell for Interview Project Planner (Angular 20 + Express)";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs =
    { self, nixpkgs }:
    let
      systems = [
        "aarch64-linux"
        "x86_64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];
      forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
    in
    {
      devShells = forAllSystems (
        pkgs:
        let
          chromiumPkgs = pkgs.lib.optionals pkgs.stdenv.isLinux [ pkgs.chromium ];
        in
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              nodejs_22
              git
            ] ++ chromiumPkgs;

            shellHook = pkgs.lib.optionalString pkgs.stdenv.isLinux ''
              export CHROME_BIN="${pkgs.chromium}/bin/chromium"
            '';
          };
        }
      );
    };
}
