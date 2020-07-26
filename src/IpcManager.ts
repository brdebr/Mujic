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
          return {
            path: path.join(folderPath, el.name),
            name: path.basename(el.name, path.extname(el.name))
          };
        })
      });
  }
}
