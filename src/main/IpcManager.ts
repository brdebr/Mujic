import { ipcMain, dialog, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import { SongFileI } from "@/store/folder";
import { buildDownloader } from "@/main/YtDownloader";
import { downloadFfmpeg } from "@/main/DownloadFfmpeg";

export enum IpcEventNames {
  dialogGetFolder = "dialogGetFolder",
  getSongFiles = "getSongFiles",
  getSongBase64 = "getSongBase64",
  downloadYT = "downloadYT"
}

export default class IpcManager {
  constructor(win: BrowserWindow, appPath: string) {
    this.ffmpegPath = "";

    this.initListeners(win, appPath);
    this.setFfmpeg(win, appPath);
  }

  ffmpegPath: string;

  initListeners(win: BrowserWindow, appPath: string) {
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
          const YDMp3 = buildDownloader(this.ffmpegPath, path);
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

  async checkFfmpeg(binPath: string) {
    const ffmpegFilePath = path.join(binPath, "ffmpeg.exe");
    try {
      const ffmpegFile = await fs.promises.readFile(ffmpegFilePath);
      if (ffmpegFile.length <= 250) throw new Error("File too small");
      return true;
    } catch (error) {
      console.log("FFPEG.exe NOT FOUND");
      return false;
    }
  }

  async setFfmpeg(win: BrowserWindow, appPath: string) {
    const ffpegFound = await this.checkFfmpeg(appPath);
    if (!ffpegFound) {
      const response = await dialog.showMessageBox(win, {
        type: "warning",
        buttons: ["Cancel", "It's in another directory", "Yes, please"],
        title: "Ffmpeg.exe not found!",
        message: "Download ffmpeg.exe to the same folder?",
        detail:
          "Ffmpeg is an utility to compile the audio from the video, requires around 80Mb of free space."
      });
      switch (response.response) {
        case 0: {
          win.close();
          break;
        }
        case 1: {
          const selection = await dialog.showOpenDialog({
            properties: ["openFile"],
            title: "Ffmpeg.exe",
            filters: [{ name: "Executable", extensions: ["exe"] }]
          });
          if (selection.canceled || !selection.filePaths[0]) win.close();
          this.ffmpegPath = selection.filePaths[0];
          break;
        }
        case 2: {
          this.ffmpegPath = path.join(appPath, "ffmpeg.exe");
          win.webContents.send("ffmpeg-download-start");
          await downloadFfmpeg(appPath);
          win.webContents.send("ffmpeg-downloaded");
          break;
        }
      }
    } else {
      this.ffmpegPath = path.join(appPath, "ffmpeg.exe");
    }
  }
}
