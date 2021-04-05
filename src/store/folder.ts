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
  genreArray: Array<{
    text: string;
    color?: string;
    dark?: boolean;
  }>;
  selectedSort: SortTypes;
  sortOrder: "asc" | "desc";
}

export interface SortTypes {
  text: string;
  property: string;
  type: string;
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
    search: "",
    genreArray: [],
    selectedSort: {
      text: "Filename",
      property: "name",
      type: "name"
    },
    sortOrder: "asc"
  },
  mutations: {
    setFolderName: (state, payload) => {
      state.folderName = payload;
    },
    setSearch: (state, payload) => {
      state.search = payload;
    },
    setSelectedSort: (state, payload) => {
      state.selectedSort = payload;
    },
    setSortOrder(state, val) {
      state.sortOrder === val;
    },
    toggleSortOrder(state) {
      if (state.sortOrder === "desc") state.sortOrder = "asc";
      else state.sortOrder = "desc";
    },
    setLoading: (state, payload) => {
      state.loading = payload;
    },
    setSongFiles: (state, payload) => {
      state.songFiles = payload;
    },
    setGenreArray: (state, list) => {
      state.genreArray = list;
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
    genreTextArray(state) {
      return state.genreArray.map(el => el.text);
    },
    filteredList(state) {
      if (!state.search) {
        return state.songFiles;
      }
      return state.songFiles.filter(el =>
        el.name.toLowerCase().includes(state.search.toLowerCase())
      );
    },
    sortFunction(state) {
      return (a: SongFileI, b: SongFileI) => {
        switch (state.selectedSort.type) {
          case "name":
            if (state.sortOrder === "asc") return a.name.localeCompare(b.name);
            else return b.name.localeCompare(a.name);
          case "meta":
            switch (state.selectedSort.property) {
              case "birthtimeMs":
                if (state.sortOrder === "asc")
                  return a.meta.birthtimeMs - b.meta.birthtimeMs;
                else return b.meta.birthtimeMs - a.meta.birthtimeMs;
              case "mtimeMs":
                if (state.sortOrder === "asc")
                  return a.meta.mtimeMs - b.meta.mtimeMs;
                else return b.meta.mtimeMs - a.meta.mtimeMs;
              default:
                return a.name.localeCompare(b.name);
            }
          case "tag":
            switch (state.selectedSort.property) {
              case "title":
                if (state.sortOrder === "asc")
                  return a.tags.title?.localeCompare(b.tags.title || "");
                else return b.tags.title?.localeCompare(a.tags.title || "");
              case "artist":
                if (state.sortOrder === "asc")
                  return a.tags.artist?.localeCompare(b.tags.artist || "");
                else return b.tags.artist?.localeCompare(a.tags.artist || "");
              case "album":
                if (state.sortOrder === "asc")
                  return a.tags.album?.localeCompare(b.tags.album || "");
                else return b.tags.album?.localeCompare(a.tags.album || "");
              case "genre":
                if (state.sortOrder === "asc")
                  return a.tags.genre?.localeCompare(b.tags.genre || "");
                else return b.tags.genre?.localeCompare(a.tags.genre || "");
              case "year":
                if (state.sortOrder === "asc")
                  return a.tags.year?.localeCompare(b.tags.year || "");
                else return b.tags.year?.localeCompare(a.tags.year || "");
              case "bpm":
                if (state.sortOrder === "asc")
                  return (a.tags.bpm || 0) - (b.tags.bpm || 0);
                else return (b.tags.bpm || 0) - (a.tags.bpm || 0);
              case "length":
                if (state.sortOrder === "asc")
                  return (
                    new Date(`December 1, 1995 00:${a.tags.length}`).getTime() -
                    new Date(`December 1, 1995 00:${b.tags.length}`).getTime()
                  );
                else
                  return (
                    new Date(`December 1, 1995 00:${b.tags.length}`).getTime() -
                    new Date(`December 1, 1995 00:${a.tags.length}`).getTime()
                  );
              default:
                return a.name.localeCompare(b.name);
            }
          default:
            return a.name.localeCompare(b.name);
        }
      };
    },
    filteredSortedList(state, getters) {
      if (!state.search) {
        return state.songFiles.sort(getters.sortFunction);
      }
      return state.songFiles
        .filter(el =>
          el.name.toLowerCase().includes(state.search.toLowerCase())
        )
        .sort(getters.sortFunction);
    }
  },
  actions: {
    async fetchGenreArray(ctx) {
      ctx.commit(
        "setGenreArray",
        (await ipcRenderer.invoke("get-store-config", "genres", "list")) || []
      );
    },
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
    async refreshSongFiles(ctx) {
      ctx.commit("setLoading", true);
      let songFiles: SongFileI[] = await ipcRenderer.invoke(
        IpcEventNames.getSongFiles,
        ctx.state.folderName
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
        ctx.commit("setSongFiles", songFiles);
        const selectedPath = ctx.getters["selectedSong"]?.path;
        if (selectedPath) {
          ctx.commit(
            "selectSong",
            ctx.state.songFiles.findIndex(el => el.path === selectedPath)
          );
        } else {
          await ctx.dispatch("selectSongByIndex", 0);
        }
        ctx.commit("setLoading", false);
      }
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
