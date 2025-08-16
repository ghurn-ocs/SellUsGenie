{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.npm-9_x
    pkgs.nodePackages.typescript
    pkgs.nodePackages.serve
  ];
}