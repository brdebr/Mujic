import { Module } from "vuex";
import { ipcRenderer, dialog } from "electron";

interface DownloadStateI {
  dialog: boolean;
}

const DownloadStoreModule: Module<DownloadStateI, any> = {
  namespaced: true,
  state: {
    dialog: false
  },
  mutations: {
    setDialog(state, val) {
      state.dialog = val;
    }
  },
  getters: {},
  actions: {}
};
export default DownloadStoreModule;
