<template>
  <v-dialog
    :value="dialog"
    max-width="1150px"
    @input="v => $emit('update:dialog')"
  >
    <v-card :loading="loading">
      <v-card-title class="pb-4">
        <div>
          Song information
        </div>
        <v-spacer />
        <div>
          <v-btn outlined color="info" title="Edit song information">
            <v-icon size="18">
              $edit
            </v-icon>
          </v-btn>
        </div>
        <div class="ml-3">
          <v-btn
            outlined
            @click="showingImage = !showingImage"
            title="Focus song thumbnail"
          >
            <v-icon> {{ showingImage ? "far" : "fas" }} fa-image </v-icon>
          </v-btn>
        </div>
      </v-card-title>
      <v-divider />
      <v-img
        :height="showingImage ? '560px' : '240px'"
        :src="imageBase64"
        class="song-info-image"
        :class="{ 'showing-image': showingImage }"
        :contain="containImage"
      >
        <v-card-title class="white--text">
          {{ song.name }}
        </v-card-title>
      </v-img>
      <v-divider />
      <v-card-actions class="" style="white-space: pre-wrap;">
        <div>
          {{ info.artist }}
        </div>
        <v-spacer />
        <div>
          <v-btn depressed outlined @click="openExternalLink">
            <span style="padding-top: 3px">
              Visit webpage
            </span>
            <v-icon class="ml-3" small>
              fas fa-external-link-square-alt
            </v-icon>
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { ipcRenderer } from "electron";
import { SongFileI } from "@/store/folder";
// import { ipcRenderer } from "electron";
// import { IpcEventNames } from "@/main/IpcManager";

interface SongTags {
  artist?: string;
  image?: object;
  title?: string;
  userDefinedUrl?: [
    {
      description: string;
      url: string;
    }
  ];
}

@Component({})
export default class SongInfoDialog extends Vue {
  @Prop()
  dialog!: boolean;

  showingImage = false;
  containImage = false;

  @Watch("showingImage")
  delayedContain(newVal: boolean) {
    if (!newVal) {
      this.containImage = newVal;
    } else {
      setTimeout(() => {
        this.containImage = newVal;
      }, 150);
    }
  }

  @Prop()
  song!: SongFileI;

  openExternalLink() {
    const link = this.info.userDefinedUrl?.find(
      el => (el.description = "Youtube URL")
    )?.url;
    console.log({ link });

    if (!link) {
      return;
    }
    ipcRenderer.invoke("open-link", link);
  }

  loading = false;

  imageBase64: string | null = null;

  info: SongTags = {};

  @Watch("dialog")
  async fetchSongInfo(newVal: boolean, oldVal: boolean) {
    if (!newVal) {
      this.showingImage = false;
      this.containImage = false;
      return;
    }
    const info = await ipcRenderer.invoke("fetch-song-tags", this.song.path);
    console.log({ songInfo: info });

    this.info = { ...info };

    const imgByteArr = new Buffer(info.image?.imageBuffer as Uint8Array);
    if (!imgByteArr.length) {
      return;
    }
    this.imageBase64 = `data:image/${info.image?.mime ||
      "png"};base64,${imgByteArr.toString("base64")}`;
  }
}
</script>

<style lang="scss">
.song-info-image {
  transition: height 0.15s ease-in;
  &.showing-image {
    .v-responsive__content {
      background-color: transparent;
      .v-card__title {
        opacity: 0;
      }
    }
  }
  .v-image__image {
    background-color: #000;
  }
  .v-responsive__content {
    display: flex;
    background-color: rgba(0, 0, 0, 0.35);
    .v-card__title {
      margin-top: auto;
      background-color: rgba(0, 0, 0, 0.2);
      width: 100%;
    }
  }
}
</style>
