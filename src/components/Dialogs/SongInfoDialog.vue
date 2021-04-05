<template>
  <v-dialog
    :value="dialog"
    scrollable
    :persistent="editing"
    no-click-animation
    @input="v => $emit('input', v)"
    transition="fade-transition"
  >
    <v-card :loading="loading">
      <v-card-title class="pb-4">
        <div>
          Song information
        </div>
        <v-spacer />
        <template v-if="!editing">
          <div>
            <v-btn
              outlined
              color="red darken-3"
              title="Search in YouTube"
              @click="findInYoutube(song.name)"
            >
              <v-icon size="18">
                fas fa-search
              </v-icon>
            </v-btn>
          </div>
          <div class="ml-3">
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
          <div class="ml-3" v-if="imageBase64">
            <v-btn
              outlined
              @click="showingImage = !showingImage"
              title="Focus song thumbnail"
            >
              <v-icon> {{ showingImage ? "far" : "fas" }} fa-image </v-icon>
            </v-btn>
          </div>
        </template>
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
        <v-card-text v-if="song && song.meta" class="pt-1">
          <v-row class="flex-wrap align-center pt-4">
            <v-col cols="6">
              <v-row no-gutters class="flex-wrap">
                <v-col cols="12">
                  <v-hover #default="{ hover }">
                    <v-img
                      aspect-ratio="31/12"
                      min-height="240px"
                      v-if="imageBase64"
                      :src="imageBase64"
                      style="border-radius: 4px;border: 1px solid #90A4AE !important;"
                      class="grey lighten-3"
                    >
                      <v-fade-transition>
                        <div
                          v-if="hover"
                          class="d-flex v-card--reveal white--text"
                        >
                          <v-btn
                            small
                            class="mx-auto px-6 py-5 font-weight-bold"
                            depressed
                            color="white"
                          >
                            Change image
                          </v-btn>
                        </div>
                      </v-fade-transition>
                    </v-img>
                  </v-hover>
                  <v-hover #default="{ hover }">
                    <v-sheet
                      v-if="!imageBase64"
                      height="100%"
                      color="grey lighten-3"
                      outlined
                      rounded
                      min-height="240px"
                      class="d-flex mx-auto"
                      style="border-color: #90A4AE !important;position: relative;"
                      width="100%"
                    >
                      <v-icon
                        x-large
                        color="blue-grey lighten-2"
                        class="ma-auto"
                        v-if="!hover"
                      >
                        fas fa-music
                      </v-icon>
                      <v-fade-transition>
                        <div
                          v-if="hover"
                          class="d-flex v-card--reveal white--text"
                        >
                          <v-btn
                            small
                            class="mx-auto px-6 py-5 font-weight-bold"
                            depressed
                            color="white"
                          >
                            Set image
                          </v-btn>
                        </div>
                      </v-fade-transition>
                    </v-sheet>
                  </v-hover>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="6">
              <v-row no-gutters class="flex-wrap">
                <v-col cols="12" class="mt-1 mb-2">
                  <v-text-field
                    outlined
                    label="Filename"
                    readonly
                    class="filename-input"
                    :title="song.name + song.extension"
                    :value="song.name + song.extension"
                    hide-details="auto"
                  >
                    <template #append-outer>
                      <div class="pl-2">
                        <v-btn
                          height="42"
                          width="42"
                          min-width="42"
                          outlined
                          color="grey darken-1"
                        >
                          <v-icon small>
                            fas fa-file-export
                          </v-icon>
                        </v-btn>
                      </div>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col cols="12" class="pt-2 pb-2">
                  <v-divider />
                </v-col>
                <v-col cols="12" class="mt-2 px-1">
                  <v-row no-gutters class="flex-wrap song-details-text">
                    <v-col cols="12" class="mb-2">
                      <span class="d-inline-flex w-100">
                        <b>
                          Created at:
                        </b>
                        <span class="mr-auto">
                          {{ formatDate(song.meta.birthtimeMs) }}
                        </span>
                        <span>
                          {{ formatDateAgo(song.meta.mtimeMs) }}
                        </span>
                      </span>
                    </v-col>
                    <v-col cols="12" class="mb-2">
                      <span class="d-inline-flex w-100">
                        <b>
                          Modified at:
                        </b>
                        <span class="mr-auto">
                          {{ formatDate(song.meta.mtimeMs) }}
                        </span>
                        <span>
                          {{ formatDateAgo(song.meta.mtimeMs) }}
                        </span>
                      </span>
                    </v-col>
                    <v-col cols="12" class="mb-2">
                      <b>
                        Size :
                      </b>
                      <span>
                        {{ formatBytes(song.meta.size) }}
                      </span>
                    </v-col>
                    <v-col cols="12" class="mb-2">
                      <b>
                        Duration :
                      </b>
                      <span> {{ song.tags.length }} min </span>
                    </v-col>
                    <v-col
                      cols="12"
                      class="mb-2 text-truncate"
                      :title="song.path"
                    >
                      <b>
                        Path :
                      </b>
                      <span>
                        {{ song.path }}
                      </span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" class="pt-3">
              <v-divider />
            </v-col>
            <v-col cols="9">
              <v-text-field
                outlined
                label="Title"
                v-model="info.title"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="3">
              <v-dialog max-width="80%">
                <template #activator="{on, attrs}">
                  <v-btn
                    v-on="on"
                    v-bind="attrs"
                    block
                    large
                    outlined
                    color="orange darken-2"
                  >
                    Lyrics
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    <span class="mr-auto">
                      Lyrics
                    </span>
                  </v-card-title>
                  <v-divider />
                  <v-card-text class="py-6">
                    <v-textarea
                      outlined
                      height="360"
                      class="lyrics-area"
                      no-resize
                      hide-details="auto"
                      v-model="lyrics"
                    />
                  </v-card-text>
                </v-card>
              </v-dialog>
            </v-col>
            <v-col cols="6">
              <v-text-field
                outlined
                label="Artist"
                v-model="info.artist"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                outlined
                label="Album"
                v-model="info.album"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="6">
              <GenreSelector v-model="info.genre" />
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
                class="bpm-field"
                v-model="info.bpm"
                hide-details="auto"
              >
                <template #append>
                  <BpmFinderDialog @bpm="setBpm" />
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                prepend-inner-icon="fas fa-globe"
                outlined
                class="text-field-prepend-spacing"
                v-model="youtubeUrl.url"
                label="URL"
                hide-details="auto"
              >
                <template #append>
                  <v-btn
                    @click="openLink(youtubeUrl.url)"
                    outlined
                    min-height="32"
                    height="32"
                    width="32"
                    :disabled="!youtubeUrl.url"
                    min-width="32"
                    color="grey darken-1"
                  >
                    <v-icon small>
                      fas fa-external-link-square-alt
                    </v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="3">
              <v-combobox
                outlined
                label="Language"
                :items="languages"
                v-model="info.language"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="3" class="d-flex align-center justify-center">
              <v-rating
                dense
                @input="setRatingVal"
                :value="popularimeter"
                color="yellow darken-3"
                background-color="grey darken-1"
                empty-icon="far fa-fw fa-star "
                half-icon="fas fa-fw fa-star-half-alt "
                full-icon="fas fa-fw fa-star"
                half-increments
                hover
                large
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                outlined
                v-model="comments"
                rows="4"
                auto-grow
                label="Comments"
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
import BpmFinderDialog from "@/components/Dialogs/BpmFinderDialog.vue";
import { AudioTag, GENRE_COLORS_ARRAY } from "@/main/SongTags";
import GenreSelector from "@/components/Utils/GenreSelector.vue";
import moment from "moment";

@Component({
  components: {
    GenreSelector,
    BpmFinderDialog
  },
  model: {
    prop: "dialog",
    event: "input"
  }
})
export default class SongInfoDialog extends Vue {
  @Prop()
  dialog!: boolean;

  showingImage = false;
  containImage = false;
  editing = false;

  formatDate(ms: number) {
    return moment(ms).format("dddd, DD/MM/yyyy - HH:mm");
  }
  formatDateAgo(ms: number) {
    return moment(ms).fromNow();
  }
  formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  languages = ["English", "Spanish", "Japanese"];

  get youtubeUrl() {
    return (
      this.song.tags.userDefinedUrl?.find(
        el => el.description === "Youtube URL"
      ) || {
        url: "--ERROR--",
        description: ""
      }
    );
  }

  get comments() {
    return this.info.comment?.text;
  }
  set comments(val: string | undefined) {
    this.info.comment = {
      language: "eng",
      text: val || ""
    };
  }

  get lyrics() {
    return this.info.unsynchronisedLyrics?.text;
  }
  set lyrics(val: string | undefined) {
    this.info.unsynchronisedLyrics = {
      language: "eng",
      text: val || ""
    };
  }

  openLink(url: string) {
    if (!url) {
      return;
    }
    ipcRenderer.invoke("open-link", url);
  }

  findInYoutube(term: string) {
    const url = `https://www.youtube.com/results?search_query=${term}`;
    ipcRenderer.invoke("open-link", url);
    this.$emit("input", false);
  }

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
    this.$store.dispatch(
      "folder/fetchSongFiles",
      this.$store.state.folder.folderName
    );
    this.$emit("close");
  }

  loading = false;

  imageBase64: string | null = null;

  info: AudioTag = {};

  setBpm(val: number) {
    this.$set(this.info, "bpm", val);
  }

  popularimeterMap = {
    "0": 0,
    "1": 26,
    "2": 51,
    "3": 77,
    "4": 102,
    "5": 128,
    "6": 153,
    "7": 179,
    "8": 204,
    "9": 230,
    "10": 255
  };

  setRatingVal(val: number) {
    this.$set(this.info, "popularimeter", {
      email: "Windows Media Player 9 Series",
      // @ts-ignore
      rating: this.popularimeterMap[`${val * 2}`]
    });
  }

  get popularimeter() {
    if (!this.info.popularimeter) {
      return 0;
    }
    return (
      Object.values(this.popularimeterMap).findIndex(
        el => el === this.info.popularimeter?.rating
      ) / 2
    );
  }

  async addOrSelectGenre(input: string) {
    if (!input) {
      return;
    }
    console.log({ input });
    const randomize = (arr: Array<any>) =>
      arr[Math.floor(Math.random() * arr.length)];

    const found = (this.$store.state.folder.genreArray as Array<{
      text: string;
      color: string;
    }>).find(el => el.text === input);

    if (!found && typeof input === "string") {
      ipcRenderer.invoke("set-store-config", "genres", "list", [
        ...this.$store.state.folder.genreArray,
        {
          text: input,
          color: randomize(GENRE_COLORS_ARRAY)
        }
      ]);
      await this.$store.dispatch("folder/fetchGenreArray");
      this.info.genre = this.$store.state.folder.genreArray.find(
        // @ts-ignore
        el => el.text === input
      );
      console.log("Add to the list");
    }
  }

  resetState() {
    this.showingImage = false;
    this.containImage = false;
    this.editing = false;
  }

  async mounted() {
    await this.$store.dispatch("folder/fetchGenreArray");
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
.bpm-field {
  .v-input__append-inner {
    margin: auto !important;
  }
  .v-input__slot {
    padding-right: 0px !important;
  }
}
.filename-input {
  .v-input__append-outer {
    margin: auto !important;
  }
}
.song-details-text {
  b {
    display: inline-block;
    min-width: 85px;
  }
}
.text-field-prepend-spacing {
  .v-label {
    &:not(.v-label--active) {
      padding-left: 8px;
    }
  }
  .v-input__append-inner {
    margin: auto !important;
  }
  input {
    padding-left: 8px;
  }
}
.v-card--reveal {
  align-items: center;
  bottom: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  letter-spacing: 0.8px;
  line-height: 2rem;
  background-color: transparentize(#ffa000, 0.05) !important;
  > div {
    white-space: pre-line;
    font-family: Roboto;
    letter-spacing: 2px;
    font-size: 17px;
    word-break: break-word;
  }
}
.lyrics-area {
  .v-text-field__slot {
    textarea {
      margin-top: 3px !important;
      margin-bottom: 3px !important;
      padding-top: 6px !important;
      padding-bottom: 6px !important;
    }
  }
}
</style>
