import { Module } from "vuex";
import { ipcRenderer, dialog } from "electron";
import { SongFileI } from "./folder";
import moment, { Duration, Moment } from "moment";

export const parseDuration = (duration: Duration) => {
  if (!duration) {
    return "00:00:00";
  }
  return `${duration
    .hours()
    .toString()
    .padStart(2, "0")}:${duration
    .minutes()
    .toString()
    .padStart(2, "0")}:${duration
    .seconds()
    .toString()
    .padStart(2, "0")}`;
};

interface PlaylistStateI {
  list: Array<SongFileI>;
  index: number;
  textDuration: string;
  mDuration: Duration;
}

const PlaylistStoreModule: Module<PlaylistStateI, any> = {
  namespaced: true,
  state: {
    list: [],
    index: 0,
    textDuration: "00:00:00",
    mDuration: moment.duration(0, "seconds")
  },
  mutations: {
    setIndex(state, val) {
      state.index = val;
    },
    addSecond(state) {
      state.mDuration.add(1, "seconds");
      state.textDuration = parseDuration(state.mDuration);
    },
    addToList(state, val) {
      state.list.push(val);
    },
    removeFromListByIndex(state, index) {
      state.list.splice(index, 1);
    },
    resetState(state){
      state.mDuration = moment.duration(0, "seconds")
      state.textDuration = "00:00:00"
    }
  },
  getters: {
    selectedSongPath(state) {
      if (!state.list.length) {
        return null;
      }
      return state.list[state.index].path;
    },
    playlistMode(state) {
      return !!state.list.length;
    },
    info(state) {
      const aux = state.list.reduce(
        (acc, el) => {
          // @ts-ignore
          const [minutes, seconds] = el.tags.length?.split(":");
          if (!minutes || !seconds) {
            return acc;
          }
          if (acc.duration) {
            acc.duration = acc.duration.add({
              // @ts-ignore
              minutes,
              // @ts-ignore
              seconds
            });
          } else {
            acc.duration = moment.duration({
              // @ts-ignore
              minutes,
              // @ts-ignore
              seconds
            });
          }
          return acc;
        },
        {} as {
          duration: Duration;
        }
      );
      const result: {
        duration?: string;
        length?: number;
      } = {};
      result.duration = parseDuration(aux.duration);
      result.length = state.list.length;
      return result;
    }
  },
  actions: {}
};
export default PlaylistStoreModule;
