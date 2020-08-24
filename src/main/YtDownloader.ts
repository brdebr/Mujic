import YoutubeMp3Downloader from "youtube-mp3-downloader";
import AdmZip from "adm-zip";
import fetch from "node-fetch";
import { ipcMain } from "electron";
import { IpcEventNames } from "@/main/IpcManager";
import { writeSongTags } from "@/main/SongTags";
import IpcManager from "@/main/IpcManager";
import axios from "axios";

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

export function handleDownloadYT(ipcManager: IpcManager) {
  ipcMain.on(
    IpcEventNames.downloadYT,
    async (event, videoUrl: string, path: string, videoImage: string) => {
      const videoURL = new URL(videoUrl);
      const videoId = videoURL.searchParams.get("v") || "";
      if (videoUrl) {
        const YDMp3 = buildDownloader(ipcManager.ffmpegPath, path);
        YDMp3.download(videoId);

        YDMp3.on("finished", async function(err, data) {
          const filePath = data.file;
          const videoUrl = data.youtubeUrl;
          const { artist, title } = data;

          const resp = await axios.get(videoImage, {
            responseType: "arraybuffer"
          });

          writeSongTags(
            {
              artist,
              title,
              image: {
                mime: resp.headers["content-type"].split("/")[1],
                imageBuffer: Buffer.from(resp.data)
              },
              userDefinedUrl: [
                {
                  description: "Youtube URL",
                  url: videoUrl
                }
              ]
            },
            filePath
          );
          event.reply("download-finished", data);
          // console.log(JSON.stringify(data));
        });

        YDMp3.on("error", function(error) {
          event.reply("download-error", true);
          console.log(error);
        });

        YDMp3.on("progress", function(info) {
          event.reply("download-progress", info.progress.percentage);
        });
      }
    }
  );
}
