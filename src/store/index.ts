import Vue from "vue";
import Vuex from "vuex";
import LayoutStoreModule from "@/store/layout";
import FolderStoreModule from "@/store/folder";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    layout: LayoutStoreModule,
    folder: FolderStoreModule
  }
});
