export const FILE_NAMES = [
  "resume.pdf",
  "USER_MANUAL.md",
  "hello.txt",
] as const;
export type PortfolioFile = (typeof FILE_NAMES)[number];
export const LEGACY_RESUME =
  "https://drive.google.com/file/d/1FGJF03knWlGFdvS7HdlUm8NSfGoe7Ls2/view";
export function isPortfolioFile(name: string): name is PortfolioFile {
  return FILE_NAMES.some((file) => file === name);
}
export function blobFileUrl(
  name: PortfolioFile,
  base = process.env.PORTFOLIO_BLOB_URL,
): string | null {
  if (!base) return null;
  const url = new URL(base);
  if (
    url.protocol !== "https:" ||
    !/^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/.test(url.hostname) ||
    url.username ||
    url.password ||
    url.port ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  ) {
    throw new Error(
      "PORTFOLIO_BLOB_URL must be a public Vercel Blob store origin.",
    );
  }
  return new URL(`portfolio/${name}`, url).href;
}
