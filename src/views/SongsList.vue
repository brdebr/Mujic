<template>
  <v-row no-gutters style="padding-bottom: 100px;">
    <v-col>
      <v-card width="100%">
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
          :items="$store.state.folder.songFiles"
          bench="1"
          :item-height="61"
          height="510"
          v-if="
            $store.state.folder.folderName &&
              !$store.state.folder.loading &&
              $store.state.folder.songFiles.length
          "
        >
          <template #default="{ item, index }">
            <v-list-item
              :key="item.name"
              @click="selectSong(item, index)"
              :ripple="{ center: true }"
              :class="
                index === $store.state.folder.selected
                  ? 'v-item--active v-list-item--active amber--text'
                  : null
              "
            >
              <v-list-item-avatar>
                <v-icon large>
                  fas fa-compact-disc
                  {{
                    index === $store.state.folder.selected &&
                    $store.state.audio.state === "playing"
                      ? "fa-spin"
                      : null
                  }}
                </v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="black--text">
                  {{ item.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  <div class="d-flex align-center">
                    <div>
                      Lorem ipsum
                    </div>
                    <div class="ml-auto">
                      <span class="mr-10">
                        {{ formatBytes(item.meta.size) }}
                      </span>
                      <span class="mr-4">
                        {{ formatDate(item.meta.atimeMs) }}
                      </span>
                      <span>
                        {{ formatDate(item.meta.mtimeMs) }}
                      </span>
                    </div>
                  </div>
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn outlined rounded @click.stop="showSongInfo(item)">
                  <v-icon>
                    far fa-file-audio
                  </v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-divider inset :key="`${item.name}-divid`" />
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
    <SongInfoDialog :value.sync="songInfoDialog" :song="selectedSong" />
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

@Component({
  components: {
    OpenFolder,
    OpenDownload,
    SongInfoDialog
  }
})
export default class SongsList extends Vue {
  async selectSong(song: Record<string, any>, i: number) {
    await this.$store.dispatch("folder/selectSongByIndex", i);
    this.$store.state.audio.audio.play();
  }

  openFolder() {
    ipcRenderer.invoke("open-folder", this.$store.state.folder.folderName);
  }

  songInfoDialog = false;

  selectedSong = {};

  showSongInfo(song: Record<string, any>) {
    this.selectedSong = { ...song };
    this.songInfoDialog = true;
  }

  formatDate(ms: number) {
    return moment(ms).format("HH:mm DD/MM/yyyy");
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
