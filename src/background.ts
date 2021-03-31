"use strict";

import { app, protocol, BrowserWindow, ipcMain, session } from 'electron';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import IpcManager from '@/main/IpcManager';
import path from 'path'
const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;
let appPath = process.env.PORTABLE_EXECUTABLE_DIR || __dirname // === /dist_electron

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

async function createWindow() {
  let manager = new IpcManager(appPath);

  manager.preWindowListeners()

  // Create the browser window.
  win = new BrowserWindow({
    title: 'Mujic',
    height: 950,
    minHeight: 800,
    maxHeight: 1050,
    width: 1550,
    minWidth: 800,
    maxWidth: 1800,
    // @ts-ignore
    icon: path.join(__static, 'icon.png'),
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.webContents.on('did-finish-load', () => {
    if(win){
      manager.configFfmpeg(win);
    }
  })

  if(!isDevelopment) win.removeMenu();

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);

    if (!process.env.IS_TEST) {
      win.webContents.openDevTools();
    }
  } else {
    createProtocol("app");

    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  win.on("closed", () => {
    win = null;
  });

  manager.initListeners();

  const cookie = {
    url: "http://www.youtube.com",
    name: "CONSENT",
    value: "YES+ES.es+20181216-18-0"
  };

  session.defaultSession.cookies.set(cookie).then(
    () => {
      console.log("Cookie set successfully");
    },
    error => {
      console.log("Error setting cookie");
      console.log(error);
    }
  );
}
app.commandLine.appendSwitch('disable-web-security'); 

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
