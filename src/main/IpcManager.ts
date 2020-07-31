import { ipcMain, dialog } from "electron";
import fs from "fs";
import path from "path";
import { SongFileI } from "@/store/folder";
import YDMp3 from '@/main/YtDownloader';

enum IpcEventNames {
  dialogGetFolder = "dialogGetFolder",
  getSongFiles = "getSongFiles",
  getSongBase64 = "getSongBase64",
  downloadYT = "downloadYT",
}

export default class IpcManager {
  static initListeners() {
    ipcMain.handle(IpcEventNames.dialogGetFolder, async () => {
      let selection = await dialog.showOpenDialog({
        properties: ["openDirectory"],
        title: "Music folder",
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
        let extensions = [".mp3", ".ogg", ".wav"];
        return fs
          .readdirSync(folderPath, { withFileTypes: true })
          .filter(
            (el) => el.isFile() && extensions.includes(path.extname(el.name))
          )
          .map((el) => {
            let fullPath = path.join(folderPath, el.name);
            let extension = path.extname(el.name);
            let {
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
                birthtimeMs,
              },
              name: path.basename(el.name, extension),
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

    ipcMain.handle(
      IpcEventNames.downloadYT,
      async (event, videoUrl: string) => {
        const videoURL = new URL(videoUrl);
        const videoId = videoURL.searchParams.get("v") || '';
        if(videoUrl){
          YDMp3.download(videoId);
        }
      }
    );
  }
}
