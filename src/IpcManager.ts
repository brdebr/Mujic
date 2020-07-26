import { ipcMain, dialog } from "electron";
import fs from "fs";
import path from "path";
import { SongFileI } from '@/store/folder';

export default class IpcManager {
  static initListeners() {
    ipcMain.handle("dialogGetFolder", async () => {
      let selection = await dialog.showOpenDialog({
        properties: ["openDirectory"],
        title: "Music folder",
      });
      if (selection.canceled) {
        return "";
      }
      return selection.filePaths[0] || "";
    });

    ipcMain.handle("getSongFiles", async (event, folderPath: string) => {
        // console.log(`getSongFiles(${folderPath})`);
        let extensions = ['.mp3', '.ogg', '.wav']
        return fs
        .readdirSync(folderPath, { withFileTypes: true })
        .filter(el => el.isFile() && extensions.includes(path.extname(el.name)))
        .map(el => {
          let fullPath = path.join(folderPath, el.name);
          let extension = path.extname(el.name);
          return {
            path: fullPath,
            extension,
            name: path.basename(el.name, extension)
          } as SongFileI;
        })
    });

    ipcMain.handle("getSongBase64", async (event, songPath: string) => {
      return await fs.promises.readFile(songPath, {encoding: 'base64'})
    });
  }
}
