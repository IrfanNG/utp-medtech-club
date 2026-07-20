export const defaultClientLogoPaths: Record<string, string> = {
  PETRONAS: "/media/clients/petronas.svg",
  UTP: "/media/clients/utp.png",
  TM: "/media/clients/tm.webp",
  "Yayasan PETRONAS": "/media/clients/yayasan-petronas.png",
  MIDA: "/media/clients/mida.png",
  MDEC: "/media/clients/mdec.svg",
};

export function getClientLogoSrc(name: string, logoMedia: string): string {
  return logoMedia || defaultClientLogoPaths[name] || "";
}
