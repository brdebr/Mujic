<template>
  <v-row no-gutters style="padding-bottom: 100px;" class="flex-wrap">
    <v-col
      cols="12"
      class="mb-5"
      v-if="$store.state.folder.folderName && !$store.state.folder.loading"
    >
      <v-card>
        <v-card-text class="pa-2">
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
        </v-card-text>
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
          :items="$store.getters['folder/filteredList']"
          bench="1"
          class="virt-song-list"
          :item-height="73"
          height="480"
          v-if="
            $store.state.folder.folderName &&
              !$store.state.folder.loading &&
              $store.state.folder.songFiles.length
          "
        >
          <template #default="{ item, index }">
            <v-list-item
              :key="item.path"
              @click="selectSong(item)"
              :ripple="{ center: true }"
              :class="
                (index === $store.state.folder.selected
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
          LOADING
        </v-card-text>
      </v-card>
    </v-col>
    <SongInfoDialog :dialog.sync="songInfoDialog" :song="selectedSong" />
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
import { SongFileI } from "@/store/folder";

@Component({
  components: {
    OpenFolder,
    OpenDownload,
    SongInfoDialog
  }
})
export default class SongsList extends Vue {
  async selectSong(song: SongFileI) {
    await this.$store.dispatch("folder/selectSongByPath", song.path);
    this.$store.state.audio.waveshape.play();
  }

  openFolder() {
    ipcRenderer.invoke("open-folder", this.$store.state.folder.folderName);
  }

  search = "";

  songInfoDialog = false;

  selectedSong = {};

  showSongInfo(song: any) {
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
</style>
