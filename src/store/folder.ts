import { Module } from "vuex";
import { ipcRenderer } from "electron";

export interface FolderStateI {
  folderName: string;
  selected: number;
  songFiles: Array<SongFileI>;
}

export interface SongFileI {
  path: string;
  extension?: string;
  name: string;
}

const FolderStoreModule: Module<FolderStateI, any> = {
  namespaced: true,
  state: {
    folderName: "",
    selected: 0,
    songFiles: []
  },
  mutations: {
    setFolderName: (state, payload) => {
      state.folderName = payload;
    },
    setSongFiles: (state, payload) => {
      state.songFiles = payload;
    },
    selectSong: (state, payload) => {
      state.selected = payload;
    }
  },
  getters: {
    selectedSong(state) {
      return state.songFiles[state.selected];
    }
  },
  actions: {
    async fetchSongFiles(context, folderPath) {
      context.commit("setFolderName", folderPath);
      const songFiles = await ipcRenderer.invoke("getSongFiles", folderPath);
      context.commit("setSongFiles", songFiles);
    }
    // async fetchAudio64(context, songPath) {
    //   return await ipcRenderer.invoke("getSongBase64", songPath);
    // }
  }
};
export default FolderStoreModule;
