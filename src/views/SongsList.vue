<template>
  <v-row no-gutters style="padding-bottom: 100px;" class="flex-wrap">
    <v-col
      cols="12"
      class="mb-7"
      v-if="$store.state.folder.folderName && !$store.state.folder.loading"
    >
      <v-card>
        <v-card-text class="pa-2">
          <v-row no-gutters>
            <v-col cols="8" class="pr-3">
              <v-text-field
                placeholder="Search..."
                dense
                v-model="search"
                @input="v => $store.commit('folder/setSearch', v)"
                clearable
                outlined
                color="orange darken-1"
                hide-details
                class="search-box"
              >
                <template #append>
                  <v-icon size="20">
                    $search
                  </v-icon>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="4" class="d-flex align-center sort-songs__container">
              <v-select
                outlined
                hide-details="auto"
                :menu-props="{ offsetY: true }"
                label="Sort by"
                :value="$store.state.folder.selectedSort"
                @input="v => $store.commit('folder/setSelectedSort', v)"
                return-object
                dense
                :items="sortByListMap"
              >
              </v-select>
              <v-btn
                outlined
                color="grey darken-1"
                height="40px"
                @click.stop="$store.commit('folder/toggleSortOrder')"
                small
              >
                <v-icon>
                  {{
                    $store.state.folder.sortOrder === "asc"
                      ? "$sortAsc"
                      : "$sortDesc"
                  }}
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" class="mb-3" v-if="$store.state.playlist.list.length">
      <v-card class="px-3 py-2 d-flex align-center justify-space-between">
        <span class="text-h6 pr-1">
          Playlist
        </span>
        <span class="playlist-card-label">
          <span class="text-subtitle-2">
            {{ $store.getters["playlist/info"].length }} songs
          </span>
          <span class="text-subtitle-2">
            {{ $store.getters["playlist/info"].duration }} minutes total
          </span>
          <span class="text-subtitle-2">
            {{ $store.state.playlist.textDuration }}
          </span>
        </span>
        <span>
          <span>
            <v-btn outlined class="mr-2" @click="playPlaylist">
              <v-icon>
                fas fa-play
              </v-icon>
            </v-btn>
          </span>
          <span>
            <v-dialog scrollable width="800px">
              <template #activator="{attrs, on}">
                <v-btn outlined v-on="on" v-bind="attrs">
                  <v-icon>
                    fas fa-clipboard-list
                  </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  Playlist
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-0">
                  <v-list class="py-0">
                    <v-list-item
                      v-for="(item, index) in $store.state.playlist.list"
                      :key="item.path"
                      @click="removeFromPlaylist(index)"
                      :ripple="{ center: true }"
                      :class="
                        (item.path ===
                        $store.getters['folder/selectedSong'].path
                          ? 'v-item--active v-list-item--active amber--text'
                          : null) + ' pl-1 py-1'
                      "
                    >
                      <v-list-item-avatar
                        tile
                        class="my-0 pa-0 mr-0"
                        size="112"
                        height="62"
                      >
                        <v-img
                          class="black"
                          v-if="item.meta.imageSrc"
                          :src="item.meta.imageSrc"
                        />
                        <v-sheet
                          v-else
                          height="100%"
                          width="100%"
                          color="grey lighten-3"
                        >
                          <v-icon x-large color="blue-grey lighten-2">
                            fas fa-music
                          </v-icon>
                        </v-sheet>
                      </v-list-item-avatar>
                      <v-list-item-content
                        style="border-left: 1px solid #E0E0E0"
                        class="ml-1 pl-3"
                      >
                        <v-list-item-title class="black--text">
                          {{ item.name }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          <div class="d-flex align-center pt-1">
                            <div class="pr-3">
                              <span>
                                {{ item.tags.length }}
                              </span>
                              <span>
                                <v-icon size="12">
                                  far fa-clock
                                </v-icon>
                              </span>
                            </div>
                            <div class="pr-3">
                              {{ item.tags.genre }}
                            </div>
                            <div class="pr-3" v-if="item.tags.bpm">
                              {{ item.tags.bpm || "???" }} ♪
                            </div>
                            <div>
                              {{ item.tags.artist }}
                            </div>
                          </div>
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-dialog>
          </span>
        </span>
      </v-card>
    </v-col>
    <v-col cols="12">
      <v-card width="100%" class="pb-1">
        <v-card-title class="text-h5 py-3 px-4">
          <div class="d-flex align-center">
            <v-btn
              outlined
              title="Open on explorer"
              class="mr-4"
              :disabled="!$store.state.folder.folderName"
              @click="openFolder"
            >
              <v-icon>
                fas fa-folder
              </v-icon>
            </v-btn>
            <span class="font-weight-bold">
              Songs
            </span>
          </div>
          <v-spacer />
          <span class="subtitle-1" v-if="$store.state.folder.folderName">
            <span class="mr-5"> [ {{ $store.state.folder.folderName }} ] </span>
            <span> [ {{ $store.state.folder.songFiles.length }} ] </span>
          </span>
        </v-card-title>
        <v-divider />
        <v-virtual-scroll
          :items="$store.getters['folder/filteredSortedList']"
          bench="1"
          class="virt-song-list"
          :item-height="73"
          :height="$store.state.playlist.list.length ? 437 : 510"
          v-if="
            $store.state.folder.folderName &&
              !$store.state.folder.loading &&
              $store.state.folder.songFiles.length
          "
        >
          <template #default="{ item }">
            <v-list-item
              :key="item.path"
              @click="selectSong(item)"
              @contextmenu="addToPlaylist(item)"
              :ripple="{ center: true }"
              :class="
                (item.path === $store.getters['folder/selectedSong'].path
                  ? 'v-item--active v-list-item--active amber--text'
                  : null) + ' pl-1 py-1'
              "
            >
              <v-list-item-avatar
                tile
                class="my-0 pa-0 mr-0"
                size="112"
                height="62"
              >
                <v-img
                  class="black"
                  v-if="item.meta.imageSrc"
                  :src="item.meta.imageSrc"
                />
                <v-sheet
                  v-else
                  height="100%"
                  width="100%"
                  color="grey lighten-3"
                >
                  <v-icon x-large color="blue-grey lighten-2">
                    fas fa-music
                  </v-icon>
                </v-sheet>
              </v-list-item-avatar>
              <v-list-item-content
                style="border-left: 1px solid #E0E0E0"
                class="ml-1 pl-3"
              >
                <v-list-item-title class="black--text">
                  {{ item.tags.title || item.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  <div class="d-flex align-center pt-1">
                    <div class="pr-3" style="font-size: 12.5px;">
                      <span>
                        {{ item.tags.length }}
                      </span>
                      <span>
                        <v-icon size="11" style="padding-bottom: 1px;">
                          far fa-clock
                        </v-icon>
                      </span>
                    </div>
                    <div
                      class="pr-4"
                      style="font-size: 12.5px;"
                      v-if="item.tags.bpm"
                    >
                      {{ item.tags.bpm }} ♪
                    </div>
                    <div class="pr-3" style="font-size: 12.5px;">
                      {{ item.tags.artist }}
                    </div>
                    <div
                      class="pl-4 pr-5 language-view"
                      v-if="item.tags.language"
                    >
                      <div>
                        {{ languageFlag(item.tags.language) }}
                      </div>
                    </div>
                    <div class="pr-3">
                      <v-chip
                        x-small
                        :key="genre"
                        :color="genreColorMap[genre]"
                        :dark="genreDarkMap[genre]"
                        class="mr-1"
                        v-for="genre in (item.tags.genre || '')
                          .split(',')
                          .filter(el => !!el)"
                      >
                        {{ genre }}
                      </v-chip>
                    </div>
                    <div class="ml-auto">
                      <span class="mr-10">
                        {{ formatBytes(item.meta.size) }}
                      </span>
                      <span>
                        {{ formatDate(item.meta.mtimeMs) }}
                      </span>
                    </div>
                  </div>
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action class="pl-5">
                <v-btn outlined @click.stop="showSongInfo(item)">
                  <v-icon>
                    far fa-file-audio
                  </v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-divider :key="`${item.path}-divid`" />
          </template>
        </v-virtual-scroll>
        <v-card-text
          v-if="!$store.state.folder.folderName && !$store.state.folder.loading"
        >
          <v-row no-gutters class="flex-wrap">
            <v-col cols="12" class="text-center pb-2 pt-1 subtitle-1">
              Open a folder to list it's songs here
            </v-col>
            <v-col cols="12" class="text-center py-3">
              <OpenFolder dark />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text
          v-if="
            $store.state.folder.folderName &&
              !$store.state.folder.loading &&
              !$store.state.folder.songFiles.length
          "
        >
          <v-row no-gutters class="flex-wrap">
            <v-col cols="12" class="text-center pb-2 pt-1 subtitle-1">
              This folder is empty, start adding songs from Youtube
            </v-col>
            <v-col cols="12" class="text-center py-3">
              <OpenDownload dark />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text
          v-if="$store.state.folder.loading"
          class="text-center subtitle-1 pb-2 pt-1"
        >
          <v-progress-circular
            indeterminate
            class="ma-2 mt-4"
            color="orange darken-1"
          ></v-progress-circular>
        </v-card-text>
      </v-card>
    </v-col>
    <SongInfoDialog
      v-model="songInfoDialog"
      @close="songInfoDialog = false"
      :song="selectedSong"
    />
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import OpenFolder from "@/components/Actions/OpenFolder.vue";
import SongInfoDialog from "@/components/Dialogs/SongInfoDialog.vue";

import moment from "moment";
import OpenDownload from "@/components/Actions/OpenDownload.vue";
import { ipcRenderer } from "electron";
import { SongFileI, SortTypes } from "@/store/folder";

@Component({
  components: {
    OpenFolder,
    OpenDownload,
    SongInfoDialog
  }
})
export default class SongsList extends Vue {
  async selectSong(song: SongFileI) {
    if (this.$store.state.playlist.list.length) {
      this.addToPlaylist(song);
      return;
    }
    await this.$store.dispatch("folder/selectSongByPath", song.path);
    this.$store.state.audio.waveshape.play();
  }

  get genreColorMap() {
    // @ts-ignore
    return this.$store.state?.folder?.genreArray.reduce((acc, el) => {
      acc[el.text] = el.color || "#102030";
      return acc;
    }, {});
  }

  get genreDarkMap() {
    // @ts-ignore
    return this.$store.state?.folder?.genreArray.reduce((acc, el) => {
      acc[el.text] = el.dark;
      return acc;
    }, {});
  }

  languageFlag(value: string) {
    switch (value) {
      case "Spanish":
        return "ES";
      case "English":
        return "EN";
      default:
        return value;
    }
  }

  openFolder() {
    ipcRenderer.invoke("open-folder", this.$store.state.folder.folderName);
  }

  async addToPlaylist(song: SongFileI) {
    if (!this.$store.getters["playlist/playlistMode"]) {
      await this.$store.dispatch("folder/selectSongByPath", song.path);
    }
    this.$store.commit("playlist/addToList", song);
  }

  removeFromPlaylist(index: number) {
    this.$store.commit("playlist/removeFromListByIndex", index);
  }

  async playPlaylist() {
    const selectedSongPath = this.$store.getters["playlist/selectedSongPath"];
    if (!selectedSongPath) {
      return;
    }
    await this.$store.dispatch("folder/selectSongByPath", selectedSongPath);
    this.$store.state.audio.waveshape.play();
  }

  sortByListMap: Array<SortTypes> = [
    {
      text: "Filename",
      property: "name",
      type: "name"
    },
    {
      text: "Title",
      property: "title",
      type: "tag"
    },
    {
      text: "Artist",
      property: "artist",
      type: "tag"
    },
    {
      text: "Album",
      property: "album",
      type: "tag"
    },
    {
      text: "Genre",
      property: "genre",
      type: "tag"
    },
    {
      text: "Year",
      property: "year",
      type: "tag"
    },
    {
      text: "BPM",
      property: "bpm",
      type: "tag"
    },
    {
      text: "Language",
      property: "language",
      type: "tag"
    },
    {
      text: "Rating",
      property: "popularimeter",
      type: "tag"
    },
    {
      text: "Created",
      property: "birthtimeMs",
      type: "meta"
    },
    {
      text: "Modified",
      property: "mtimeMs",
      type: "meta"
    },
    {
      text: "Duration",
      property: "length",
      type: "tag"
    }
  ];

  search = "";

  songInfoDialog = false;

  selectedSong = {};

  showSongInfo(song: SongFileI) {
    this.selectedSong = { ...song };
    this.songInfoDialog = true;
  }

  formatDate(ms: number) {
    return moment(ms).format("HH:mm - DD/MM/yyyy");
  }
  formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
}
</script>
<style lang="scss">
.search-box {
  .v-input__append-inner {
    margin: auto !important;
  }
}
.playlist-card-label {
  > span {
    padding-top: 3px;
    &:not(:last-of-type) {
      &::after {
        content: "|";
        color: rgb(192, 192, 192);
        margin: 0 8px;
      }
    }
  }
}
.sort-songs {
  &__container {
    > .v-select {
      border-bottom-right-radius: 0;
      border-top-right-radius: 0;
    }
    > .v-btn {
      border-bottom-left-radius: 0;
      border-top-left-radius: 0;
      border-left: 0;
    }
  }
}
.language-view {
  > div {
    padding: 1px 2px;
    border: 1px solid silver;
    font-size: 9px;
    line-height: 11px;
    letter-spacing: 0.5px;
  }
}
</style>
