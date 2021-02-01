<template>
  <v-dialog
    :value="dialog"
    max-width="1150px"
    scrollable
    @input="v => $emit('update:dialog')"
  >
    <v-card :loading="loading">
      <v-card-title class="pb-4">
        <div>
          Song information
        </div>
        <v-spacer />
        <div v-if="!editing">
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
        <div class="ml-3" v-if="!editing">
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
            <v-btn
              depressed
              outlined
              @click="openExternalLink"
              @contextmenu="copyExternalLink"
            >
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
              <v-divider />
            </v-col>
            <v-col cols="12">
              <v-text-field
                outlined
                label="Filename"
                v-model="song.name"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12">
              <v-divider />
            </v-col>
            <v-col cols="12">
              <v-text-field
                outlined
                label="Title"
                v-model="info.title"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="8">
              <v-text-field
                outlined
                label="Artist"
                v-model="info.artist"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                outlined
                label="Album"
                v-model="info.album"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="6">
              <v-combobox
                outlined
                :items="$store.getters['folder/genreList']"
                label="Genre"
                v-model="info.genre"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="3">
              <v-text-field
                outlined
                label="Year"
                v-model="info.year"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="3">
              <v-text-field
                outlined
                label="BPM"
                v-model="info.bpm"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="py-3 px-6" style="white-space: pre-wrap;">
          <div v-if="editing">
            <v-btn
              depressed
              outlined
              color="red darken-2"
              @click="editing = false"
            >
              Cancel
            </v-btn>
          </div>
          <v-spacer />
          <div class="mr-2">
            <v-btn
              depressed
              color="green darken-2"
              outlined
              dark
              @click="saveSongTags"
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

@Component({})
export default class SongInfoDialog extends Vue {
  @Prop()
  dialog!: boolean;

  showingImage = false;
  containImage = false;
  editing = false;

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
    if (!link) {
      return;
    }
    ipcRenderer.invoke("open-link", link);
  }

  async copyExternalLink() {
    const link = this.info.userDefinedUrl?.find(
      el => (el.description = "Youtube URL")
    )?.url;
    if (!link) {
      return;
    }
    await navigator.clipboard.writeText(link);
  }

  async saveSongTags() {
    await ipcRenderer.invoke("update-song-tags", this.info, this.song.path);
    this.dialog = false;
    this.$store.dispatch(
      "folder/fetchSongFiles",
      this.$store.state.folder.folderName
    );
  }

  loading = false;

  imageBase64: string | null = null;

  info: AudioTag = {};

  resetState() {
    this.showingImage = false;
    this.containImage = false;
    this.editing = false;
  }

  @Watch("dialog")
  async fetchSongInfo(newVal: boolean, oldVal: boolean) {
    if (!newVal) {
      this.resetState();
      return;
    }
    const { image, raw, ...info } = this.song.tags;
    if (info.comment === undefined) {
      info.comment = {
        language: "spa",
        text: ""
      };
    }
    this.info = info;
    this.imageBase64 = this.song.meta.imageSrc;
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
