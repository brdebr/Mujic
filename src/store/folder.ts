import { Module } from "vuex";
import { ipcRenderer } from "electron";

export interface FolderStateI {
  folderName: string;
  selected: number;
  songFiles: Array<SongFileI>;
  loading: boolean;
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
    songFiles: [],
    loading: false
  },
  mutations: {
    setFolderName: (state, payload) => {
      state.folderName = payload;
    },
    setLoading: (state, payload) => {
      state.loading = payload;
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
    async selectSongByIndex(ctx, index) {
      ctx.commit("selectSong", index);
      await ctx.dispatch("audio/fetchAudio64", null, { root: true });
    },
    async fetchSongFiles(ctx, folderPath) {
      ctx.commit("setFolderName", folderPath);
      ctx.commit("setLoading", true);
      const songFiles = await ipcRenderer.invoke("getSongFiles", folderPath);
      ctx.commit("setSongFiles", songFiles);
      await ctx.dispatch("selectSongByIndex", 0);
      ctx.commit("setLoading", false);
    }
  }
};
export default FolderStoreModule;
