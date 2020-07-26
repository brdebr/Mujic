import { Module } from "vuex";

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
    }
  },
  actions: {
    fetchSongFiles(context) {
      context.commit("setFolderName", "aa");
      context.commit("layout/toggleDrawer", null, { root: true });
    }
  }
};
export default FolderStoreModule;
