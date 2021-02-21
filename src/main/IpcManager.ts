import { ipcMain, dialog, BrowserWindow, shell } from "electron";
import fs from "fs";
import path from "path";
import { SongFileI } from "@/store/folder";
import { fetchSongTag, updateSongTags, writeSongTags } from "@/main/SongTags";
import * as mm from "music-metadata";
import {
  buildDownloader,
  downloadFfmpeg,
  handleDownloadYT
} from "@/main/YtDownloader";
import moment from "moment";
import Store from "electron-store";

export enum IpcEventNames {
  dialogGetFolder = "dialogGetFolder",
  getSongFiles = "getSongFiles",
  getSongBase64 = "getSongBase64",
  downloadYT = "downloadYT"
}

function parseSecondsToHuman(seconds: number) {
  return moment
    .utc()
    .startOf("day")
    .add({ seconds: seconds })
    .format("mm:ss");
}

export default class IpcManager {
  constructor(appPath: string) {
    this.ffmpegPath = "";
    this.appPath = appPath;
    this.configs = new Store({
      name: "mujic-cfg",
      cwd: appPath
    });
  }

  ffmpegPath: string;
  appPath: string;
  configs: Store;

  preWindowListeners() {
    ipcMain.handle("check-ffmpeg", event => {
      return !!this.ffmpegPath;
    });
  }

  initListeners() {
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
        const promises = fs
          .readdirSync(folderPath, { withFileTypes: true })
          .filter(
            el => el.isFile() && extensions.includes(path.extname(el.name))
          )
          .map(async el => {
            const fullPath = path.join(folderPath, el.name);
            const extension = path.extname(el.name);
            const audioMetadata = await mm.parseFile(fullPath, {
              duration: true,
              includeChapters: false,
              skipCovers: true,
              skipPostHeaders: true
            });
            const audioTags = await fetchSongTag(fullPath);
            audioTags.length = parseSecondsToHuman(
              audioMetadata.format.duration || 0
            );
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
              tags: audioTags,
              name: path.basename(el.name, extension)
            } as SongFileI;
          });

        return (await Promise.all(promises)).sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      }
    );

    ipcMain.handle(
      IpcEventNames.getSongBase64,
      async (event, songPath: string) => {
        return await fs.promises.readFile(songPath, { encoding: "base64" });
      }
    );

    ipcMain.handle("open-folder", async (event, folderPath: string) => {
      shell.openPath(folderPath);
    });

    ipcMain.handle("open-link", async (event, link: string) => {
      shell.openExternal(link);
    });

    ipcMain.handle("fetch-song-tags", (event, songPath) => {
      return fetchSongTag(songPath);
    });

    ipcMain.handle("save-song-tags", (event, tags, songPath) => {
      return writeSongTags(tags, songPath);
    });

    ipcMain.handle("update-song-tags", (event, tags, songPath) => {
      return updateSongTags(tags, songPath);
    });

    ipcMain.handle(
      "set-store-config",
      (event, store: string, key: string, data: object) => {
        this.configs.set(`${store}.${key}`, data);
      }
    );

    ipcMain.handle("get-store-config", (event, store: string, key: string) => {
      return this.configs.get(`${store}.${key}`);
    });

    handleDownloadYT(this);
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

  async configFfmpeg(win: BrowserWindow) {
    const ffpegFound = await this.checkFfmpeg(this.appPath);
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
          win.webContents.send("ffmpeg-set");
          break;
        }
        case 2: {
          this.ffmpegPath = path.join(this.appPath, "ffmpeg.exe");
          win.webContents.send("ffmpeg-download-start");
          await downloadFfmpeg(this.appPath);
          win.webContents.send("ffmpeg-downloaded");
          break;
        }
      }
    } else {
      this.ffmpegPath = path.join(this.appPath, "ffmpeg.exe");
      await dialog.showMessageBox(win, {
        type: "info",
        buttons: ["Okay"],
        title: "Ffmpeg loaded",
        message: "Using ffmpeg from same folder"
      });
      win.webContents.send("ffmpeg-set");
    }
  }
}
