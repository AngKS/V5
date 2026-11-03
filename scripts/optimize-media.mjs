import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";

// Keep the source artwork; only these delivery copies are used by the site.
await mkdir("public/media", { recursive: true });
const jobs = [
  ["public/comic-transition.png", "public/media/comic-transition.webp", 84],
  ["public/panda-wallpaper.webp", "public/media/panda-wallpaper.webp", 76],
  [
    "public/video/kah-shin-walking-cutout.png",
    "public/media/walking-cutout.webp",
    90,
  ],
];
for (const [source, output, quality] of jobs) {
  await sharp(source)
    .webp({ quality, effort: 6, alphaQuality: 100 })
    .toFile(output);
  console.log(
    `${output}: ${(await stat(source)).size} → ${(await stat(output)).size} bytes`,
  );
}
await sharp("public/comics/observe.webp")
  .resize({ width: 160 })
  .webp({ quality: 78, effort: 6 })
  .toFile("public/media/comic-peek.webp");

// A keyframe every four frames bounds random-seek decoding while avoiding
// the much larger all-intra source. Retain the original colour/alpha matte.
for (const [name, quality, scale] of [
  ["desktop", "22", null],
  ["mobile", "23", "1920:540:flags=lanczos"],
]) {
  const output = `public/video/kah-shin-walking-${name}.mp4`;
  const result = spawnSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-y",
      "-i",
      "public/video/kah-shin-walking-matted.mp4",
      ...(scale ? ["-vf", `scale=${scale}`] : []),
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      quality,
      "-g",
      "4",
      "-keyint_min",
      "4",
      "-sc_threshold",
      "0",
      "-bf",
      "0",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      output,
    ],
    { stdio: "inherit" },
  );
  if (result.error || result.status !== 0)
    throw result.error ?? new Error(`Failed to encode ${output}`);
  console.log(`${output}: ${(await stat(output)).size} bytes`);
}
