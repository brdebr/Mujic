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
          <v-btn
            outlined
            color="orange darken-3"
            title="Edit song information"
            @click="editing = !editing"
          >
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
      <template v-if="!editing">
        <v-img
          :height="showingImage ? '560px' : '240px'"
          :src="imageBase64"
          class="song-info-image"
          :class="{ 'showing-image': showingImage }"
          :contain="containImage"
        >
          <v-card-title class="white--text">
            <div>
              {{ song.name }}
            </div>
            <v-spacer />
            <div>[ {{ info.length }} ]</div>
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
      </template>
      <template v-else>
        <v-img
          height="240px"
          v-if="imageBase64"
          :src="imageBase64"
          style="border-radius: 4px;border: 1px solid #90A4AE !important;"
          class="mx-auto my-4 grey lighten-3"
          width="620px"
        />
        <v-sheet
          v-else
          height="240px"
          color="grey lighten-3"
          outlined
          rounded
          class="d-flex mx-auto my-4"
          style="border-color: #90A4AE !important;"
          width="620px"
        >
          <v-icon x-large color="blue-grey lighten-2" class="ma-auto">
            fas fa-music
          </v-icon>
        </v-sheet>
        <v-card-text>
          <v-row class="flex-wrap">
            <v-col cols="12">
              <v-text-field
                outlined
                label="Title"
                v-model="info.title"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                outlined
                label="Title"
                v-model="info.title"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="" style="white-space: pre-wrap;">
          <div>
            {{ info.artist }}
          </div>
          <v-spacer />
          <div>
            <v-btn
              depressed
              color="green darken-2"
              outlined
              dark
              @click="openExternalLink"
            >
              <span style="padding-top: 3px">
                Save tags info
              </span>
              <v-icon class="ml-3" small>
                fas fa-tags
              </v-icon>
            </v-btn>
          </div>
        </v-card-actions>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { ipcRenderer } from "electron";
import { SongFileI } from "@/store/folder";
import { AudioTag } from "@/main/SongTags";
// import { ipcRenderer } from "electron";
// import { IpcEventNames } from "@/main/IpcManager";

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

  info: AudioTag = {};

  @Watch("dialog")
  async fetchSongInfo(newVal: boolean, oldVal: boolean) {
    if (!newVal) {
      this.showingImage = false;
      this.containImage = false;
      return;
    }
    const info = this.song.tags;
    this.info = { ...info };
    this.imageBase64 = this.song.meta.imageSrc;
  }

  editing = false;
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
