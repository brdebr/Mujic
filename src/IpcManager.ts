import { ipcMain, dialog } from "electron";
import fs from "fs";
import path from "path";

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
        return fs
        .readdirSync(folderPath, { withFileTypes: true })
        .filter(el => el.isFile())
        .map(el => {
          let fullPath = path.join(folderPath, el.name);
          let extension = path.extname(el.name);
          return {
            path: fullPath,
            extension,
            name: path.basename(el.name, extension)
          };
        })
    });

    ipcMain.handle("getSongBase64", (event, songPath: string) => {
      return fs.readFileSync(songPath, {encoding: 'base64'});
    });
  }
}
