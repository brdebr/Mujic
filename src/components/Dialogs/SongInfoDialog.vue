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
        <v-row no-gutters class="flex-wrap">
          <v-col cols="12">
            <v-divider />
          </v-col>
          <v-col cols="12" class="px-12 py-5">
            <v-text-field
              outlined
              label="Filename"
              disabled
              v-model="song.name"
              hide-details="auto"
            />
          </v-col>
          <v-col cols="12">
            <v-divider />
          </v-col>
        </v-row>
        <v-card-text>
          <v-row class="flex-wrap pt-4">
            <v-col cols="12">
              <v-text-field
                outlined
                label="Title"
                v-model="info.title"
                hide-details="auto"
              />
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
                label="URL"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="3">
              <v-text-field
                outlined
                label="Language"
                v-model="info.language"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="3" class="d-flex align-center justify-center">
              <v-rating
                dense
                @input="setRatingVal"
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

@Component({
  components: {
    GenreSelector,
    BpmFinderDialog
  }
})
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

  setRatingVal(val) {
    console.log(val * 2);
    const map = {
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
    this.$set(this.info, "popularimeter", {
      email: "Windows Media Player 9 Series",
      // @ts-ignore
      rating: map[`${val * 2}`]
    });
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
      // @ts-ignore
      this.info.genre = this.$store.state.folder.genreArray.find(
        // @ts-ignore
        el => el.text === input
      );
      console.log("Add to the list");
    }
    // @ts-ignore
    console.log(this.$refs.genreField.blur());
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
</style>
