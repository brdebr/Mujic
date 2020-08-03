import { Module } from "vuex";
import { ipcRenderer, dialog } from "electron";

interface DownloadStateI {
  dialog: boolean;
  loadedFfmpeg: boolean;
}

const DownloadStoreModule: Module<DownloadStateI, any> = {
  namespaced: true,
  state: {
    dialog: false,
    loadedFfmpeg: false
  },
  mutations: {
    setDialog(state, val) {
      state.dialog = val;
    },
    setLoadedFfmpeg(state, val) {
      state.loadedFfmpeg = val;
    }
  },
  getters: {},
  actions: {}
};
export default DownloadStoreModule;
