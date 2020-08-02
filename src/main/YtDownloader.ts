import YoutubeMp3Downloader from "youtube-mp3-downloader";
import AdmZip from "adm-zip";
import fetch from "node-fetch";

export function buildDownloader(ffmpegPath: string, outputPath: string) {
  return new YoutubeMp3Downloader({
    ffmpegPath,
    outputPath,
    youtubeVideoQuality: "highestaudio",
    queueParallelism: 1,
    progressTimeout: 1000
  });
}

const ffmpegUrl =
  "https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-20200730-134a48a-win64-static.zip";

export async function downloadFfmpeg(path: string) {
  const response = await fetch(ffmpegUrl);
  const buffer = await response.buffer();
  const zip = new AdmZip(buffer);
  const zipEntries = zip.getEntries();
  zipEntries.forEach(entry => {
    if (entry.entryName.match(/ffmpeg.exe/i)) {
      zip.extractEntryTo(entry.entryName, path, false, true);
    }
  });
}
