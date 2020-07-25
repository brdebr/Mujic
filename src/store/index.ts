import Vue from "vue";
import Vuex from "vuex";
import LayoutStoreModule from "@/store/layout";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    layout: LayoutStoreModule
  }
});
