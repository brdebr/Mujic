import { Module } from "vuex";
import { ipcRenderer } from "electron";
import { IpcEventNames } from "@/main/IpcManager";
import { AudioTag } from "@/main/SongTags";

export interface FolderStateI {
  folderName: string;
  selected: number;
  songFiles: Array<SongFileI>;
  loading: boolean;
  search: string;
}

export interface SongFileI {
  path: string;
  extension?: string;
  name: string;
  meta: {
    size: number;
    atimeMs: number;
    mtimeMs: number;
    ctimeMs: number;
    birthtimeMs: number;
    imageSrc: string;
  };
  tags: AudioTag;
}

const FolderStoreModule: Module<FolderStateI, any> = {
  namespaced: true,
  state: {
    folderName: "",
    selected: 0,
    songFiles: [],
    loading: false,
    search: ""
  },
  mutations: {
    setFolderName: (state, payload) => {
      state.folderName = payload;
    },
    setSearch: (state, payload) => {
      state.search = payload;
    },
    setLoading: (state, payload) => {
      state.loading = payload;
    },
    setSongFiles: (state, payload) => {
      state.songFiles = payload;
    },
    selectSong: (state, index) => {
      if (index >= 0 && index < state.songFiles.length) {
        state.selected = index;
      } else if (index < 0 && state.songFiles.length) {
        state.selected = state.songFiles.length - 1;
      } else if (index >= state.songFiles.length) {
        state.selected = 0;
      }
    }
  },
  getters: {
    selectedSong(state) {
      return state.songFiles[state.selected];
    },
    genreList(state) {
      return [
        ...new Set(state.songFiles.map(el => el.tags.genre).filter(el => el))
      ];
    },
    filteredList(state) {
      if (!state.search) {
        return state.songFiles;
      }
      return state.songFiles.filter(el =>
        el.name.toLowerCase().includes(state.search.toLowerCase())
      );
    }
  },
  actions: {
    async selectSongByIndex(ctx, index) {
      ctx.commit("selectSong", index);
      await ctx.dispatch("audio/fetchAudio64", null, { root: true });
    },
    async selectSongByPath(ctx, path) {
      ctx.commit(
        "selectSong",
        ctx.state.songFiles.findIndex(el => el.path === path)
      );
      await ctx.dispatch("audio/fetchAudio64", null, { root: true });
    },
    async selectSongByDiff(ctx, diff) {
      ctx.commit("selectSong", ctx.state.selected + diff);
      await ctx.dispatch("audio/fetchAudio64", null, { root: true });
    },
    async fetchSongFiles(ctx, folderPath) {
      ctx.commit("setFolderName", folderPath);
      ctx.commit("setLoading", true);
      let songFiles: SongFileI[] = await ipcRenderer.invoke(
        IpcEventNames.getSongFiles,
        folderPath
      );
      songFiles = songFiles.map(el => {
        if (el.tags.image?.imageBuffer) {
          const metaImageSrc = `data:image/${el.tags.image?.mime ||
            "png"};base64,${Buffer.from(
            el.tags.image?.imageBuffer as Uint8Array
          ).toString("base64")}`;
          el.meta.imageSrc = metaImageSrc;
        }
        return el;
      });
      if (songFiles.length) {
        const selectedPath = ctx.getters["selectedSong"]?.path;
        ctx.commit("setSongFiles", songFiles);
        if (selectedPath) {
          await ctx.dispatch("selectSongByPath", selectedPath);
          ctx.commit("setLoading", false);
          return;
        }
        await ctx.dispatch("selectSongByIndex", 0);
      }
      ctx.commit("setLoading", false);
    }
  }
};
export default FolderStoreModule;
