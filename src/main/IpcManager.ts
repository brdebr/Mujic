import { ipcMain, dialog, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import { SongFileI } from "@/store/folder";
import { buildDownloader } from "@/main/YtDownloader";

export enum IpcEventNames {
  dialogGetFolder = "dialogGetFolder",
  getSongFiles = "getSongFiles",
  getSongBase64 = "getSongBase64",
  downloadYT = "downloadYT"
}

export default class IpcManager {
  static initListeners(
    win: BrowserWindow,
    appPath: string,
    ffmpegPath: string
  ) {
    ipcMain.handle(IpcEventNames.dialogGetFolder, async () => {
      const selection = await dialog.showOpenDialog({
        properties: ["openDirectory"],
        title: "Music folder"
      });
      if (selection.canceled) {
        return "";
      }
      return path.normalize(selection.filePaths[0]) || "";
    });

    ipcMain.handle(
      IpcEventNames.getSongFiles,
      async (event, folderPath: string) => {
        // console.log(`getSongFiles(${folderPath})`);
        const extensions = [".mp3", ".ogg", ".wav"];
        return fs
          .readdirSync(folderPath, { withFileTypes: true })
          .filter(
            el => el.isFile() && extensions.includes(path.extname(el.name))
          )
          .map(el => {
            const fullPath = path.join(folderPath, el.name);
            const extension = path.extname(el.name);
            const {
              size,
              atimeMs,
              mtimeMs,
              ctimeMs,
              birthtimeMs,
              ...waste
            } = fs.statSync(fullPath);
            return {
              path: fullPath,
              extension,
              meta: {
                size,
                atimeMs,
                mtimeMs,
                ctimeMs,
                birthtimeMs
              },
              name: path.basename(el.name, extension)
            } as SongFileI;
          });
      }
    );

    ipcMain.handle(
      IpcEventNames.getSongBase64,
      async (event, songPath: string) => {
        return await fs.promises.readFile(songPath, { encoding: "base64" });
      }
    );

    ipcMain.on(
      IpcEventNames.downloadYT,
      async (event, videoUrl: string, path: string) => {
        const videoURL = new URL(videoUrl);
        const videoId = videoURL.searchParams.get("v") || "";
        if (videoUrl) {
          const YDMp3 = buildDownloader(ffmpegPath, path);
          YDMp3.download(videoId);

          YDMp3.on("finished", function(err, data) {
            event.reply("download-finished", data);
            // console.log(JSON.stringify(data));
          });

          YDMp3.on("error", function(error) {
            event.reply("download-error", true);
            console.log(error);
          });

          YDMp3.on("progress", function(info) {
            event.reply("download-progress", info.progress.percentage);
            // console.log(JSON.stringify(info));
          });
        }
      }
    );
  }
}
