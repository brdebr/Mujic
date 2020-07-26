import { Module } from "vuex";
import { ipcRenderer } from "electron";
import { SongFileI } from "@/store/folder";

export interface AudioStateI {
  state: "playing" | "paused" | "stopped";
  audio: HTMLAudioElement | null;
  base64: string;
}

const AudioStoreModule: Module<AudioStateI, any> = {
  namespaced: true,
  state: {
    state: "stopped",
    audio: null,
    base64: ""
  },
  mutations: {
    setBase64(state, payload) {
      state.base64 = payload;
    },
    setAudio(state, payload) {
      state.audio;
    },
    initAudio(state) {
      state.audio = new Audio(`data:audio/x-wav;base64, ${state.base64}`);
    },
    setAudioState(state, payload) {
      state.state = payload;
    }
  },
  getters: {},
  actions: {
    async fetchAudio64(ctx) {
      const song: SongFileI = ctx.rootGetters["folder/selectedSong"];
      // console.log({ song });
      ctx.commit(
        "setBase64",
        await ipcRenderer.invoke("getSongBase64", song.path)
      );
      ctx.commit("initAudio");
    }
  }
};
export default AudioStoreModule;
