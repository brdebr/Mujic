import { Module } from "vuex";
import { ipcRenderer } from "electron";
import { SongFileI } from "@/store/folder";
import { IpcEventNames } from "@/main/IpcManager";
import WaveSurfer from "wavesurfer.js";

export interface AudioStateI {
  state: "playing" | "paused" | "stopped";
  audioEl: HTMLAudioElement | null;
  waveshape: WaveSurfer | null;
  base64: string;
}

const AudioStoreModule: Module<AudioStateI, any> = {
  namespaced: true,
  state: {
    state: "stopped",
    audioEl: null,
    waveshape: null,
    base64: ""
  },
  mutations: {
    setBase64(state, payload) {
      state.base64 = payload;
    },
    setAudioEl(state, payload) {
      state.audioEl;
    },
    initAudioEl(state) {
      state.audioEl = new Audio(`data:audio/x-wav;base64, ${state.base64}`);
    },
    initWaveShape(state) {
      state.waveshape = WaveSurfer.create({
        container: "#wave-shape",
        waveColor: "#FB8C00",
        progressColor: "#BF360C",
        cursorColor: "#FF6D00",
        height: 50,
        backend: "MediaElement",
        responsive: true,
        barWidth: 1,
        cursorWidth: 2,
        barMinHeight: 0.5
      });
      state.waveshape.setVolume(0.5);
    },
    loadWave(state) {
      if (!state.audioEl) {
        return;
      }
      state.waveshape?.load(state.audioEl);
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
        await ipcRenderer.invoke(IpcEventNames.getSongBase64, song.path)
      );
      ctx.commit("initAudioEl");
      ctx.commit("loadWave");
      // @ts-ignore
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.tags.title,
        artist: song.tags.artist,
        album: song.tags.album,
        artwork: [
          {
            sizes: "320x180",
            src: song.meta.imageSrc
          }
        ]
      });
    }
  }
};
export default AudioStoreModule;
