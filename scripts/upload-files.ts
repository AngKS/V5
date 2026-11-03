import { loadEnvConfig } from "@next/env";
import { readFile } from "node:fs/promises";
import { put } from "@vercel/blob";
import { HELLO, MANUAL } from "../src/lib/terminal";

async function main() {
  loadEnvConfig(process.cwd());
  const args = process.argv.slice(2);
  const overwrite = args.includes("--overwrite");
  const resumePath = args.find((arg) => !arg.startsWith("--"));
  if (args.includes("--help")) {
    console.log(
      "Usage: npm run files:upload -- [/absolute/path/resume.pdf] [--overwrite]\nUploads PUBLIC portfolio files. Without a PDF, uploads only the manual and hello.txt.",
    );
    return;
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error(
      "Set BLOB_READ_WRITE_TOKEN in .env.local from your connected public Blob store.",
    );
  const files: { name: string; body: string | Buffer; contentType: string }[] =
    [
      {
        name: "USER_MANUAL.md",
        body: MANUAL,
        contentType: "text/plain; charset=utf-8",
      },
      {
        name: "hello.txt",
        body: HELLO,
        contentType: "text/plain; charset=utf-8",
      },
    ];
  if (resumePath) {
    const pdf = await readFile(resumePath);
    if (
      pdf.length > 10 * 1024 * 1024 ||
      pdf.subarray(0, 5).toString() !== "%PDF-"
    )
      throw new Error("Resume must be a PDF of at most 10 MB.");
    files.unshift({
      name: "resume.pdf",
      body: pdf,
      contentType: "application/pdf",
    });
  }
  for (const file of files) {
    const blob = await put(`portfolio/${file.name}`, file.body, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: overwrite,
      contentType: file.contentType,
      cacheControlMaxAge: 300,
    });
    console.log(`${file.name}: ${blob.url}`);
    if (file.name === "resume.pdf")
      console.log(
        `Set PORTFOLIO_BLOB_URL=${new URL(blob.url).origin} locally and on Vercel.`,
      );
  }
  if (!resumePath)
    console.log(
      "Resume not uploaded. The existing resume link stays active until resume.pdf is uploaded.",
    );
}
main().catch(() => {
  console.error(
    "Upload failed. Check the Blob token, PDF path/format, and whether files already exist (use --overwrite to replace them).",
  );
  process.exitCode = 1;
});
