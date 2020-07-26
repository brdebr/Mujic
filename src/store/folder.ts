import { Module } from "vuex";
import { ipcRenderer } from "electron";

interface FolderStateI {
  folderName: string;
  songFiles: [];
}

const FolderStoreModule: Module<FolderStateI, any> = {
  namespaced: true,
  state: {
    folderName: "",
    songFiles: []
  },
  mutations: {
    setFolderName: (state, payload) => {
      state.folderName = payload;
    },
    setSongFiles: (state, payload) => {
      state.songFiles = payload;
    }
  },
  actions: {
    async fetchSongFiles(context, folderPath) {
      context.commit("setFolderName", folderPath);
      const songFiles = await ipcRenderer.invoke("getSongFiles", folderPath);
      context.commit("setSongFiles", songFiles);
    }
  }
};
export default FolderStoreModule;
