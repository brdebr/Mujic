<template>
  <v-dialog
    :value="value"
    max-width="1150px"
    @input="v => $emit('update:value')"
  >
    <v-card :loading="loading">
      <v-card-title class="pb-4">
        Song information
      </v-card-title>
      <v-img height="240px" :src="imageBase64" class="song-info-image">
        <v-card-title class="white--text">
          {{ song.name }}
        </v-card-title>
      </v-img>
      <v-divider />
      <v-card-text class="pt-5" style="white-space: pre-wrap;"> </v-card-text>
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

@Component({})
export default class SongInfoDialog extends Vue {
  @Prop()
  value!: boolean;

  @Prop()
  song!: SongFileI;

  loading = false;

  imageBase64: string | null = null;

  info = {};

  @Watch("value")
  async fetchSongInfo(newVal: boolean, oldVal: boolean) {
    if (!newVal) {
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
