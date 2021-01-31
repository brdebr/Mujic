<template>
  <v-card tile style="position: fixed; bottom: 0; width: calc(100% - 80px);">
    <!-- <v-progress-linear
      color="indigo darken-4"
      :value="progress"
      striped
      class="my-0"
      height="10"
    /> -->
    <div
      v-show="selectedSong"
      id="waveshape-container"
      class="waveshape-container"
    >
      <div id="wave-shape" />
    </div>
    <v-list v-if="selectedSong">
      <v-list-item>
        <div class="px-3 mr-3">
          <div>
            {{ currentTimeVal }}
          </div>
          <div>
            {{ totalTimeVal }}
          </div>
        </div>
        <v-list-item-content>
          <v-list-item-title>
            {{ selectedSong.name }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ selectedSong.tags.artist }}
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-spacer />
        <div style="width:250px" class="px-5">
          <v-slider
            min="0"
            max="100"
            hide-details
            value="50"
            track-color="#EF6C00"
            thumb-label
            @change="changeVolume"
            color="#EF6C00"
            prepend-icon="fas fa-volume-up"
          />
        </div>
        <v-list-item-icon class="mr-10">
          <v-btn
            outlined
            icon
            :class="{ 'amber lighten-3': playingNext }"
            title="Play next song after"
            @click="playingNext = !playingNext"
            :style="playingNext ? 'border: 2px solid !important;' : null"
          >
            <v-icon small>far fa-list-alt</v-icon>
          </v-btn>
        </v-list-item-icon>
        <!-- <<  |>  >> -->
        <v-list-item-icon>
          <v-btn outlined icon @click="playBefore">
            <v-icon small>fas fa-fast-backward</v-icon>
          </v-btn>
        </v-list-item-icon>
        <v-list-item-icon :class="{ 'mx-5': $vuetify.breakpoint.mdAndUp }">
          <v-btn outlined icon @click="handlePlay">
            <v-icon small>
              {{ audioState === "playing" ? "fas fa-pause" : "fas fa-play" }}
            </v-icon>
          </v-btn>
        </v-list-item-icon>
        <v-list-item-icon class="ml-0">
          <v-btn outlined icon @click="playNext">
            <v-icon small>fas fa-fast-forward</v-icon>
          </v-btn>
        </v-list-item-icon>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { mapGetters } from "vuex";
import { Prop, Watch } from "vue-property-decorator";

import moment from "moment";
import { SongFileI } from "@/store/folder";
function parseSecondsToHuman(seconds: number) {
  return moment
    .utc()
    .startOf("day")
    .add({ seconds: seconds })
    .format("mm:ss");
}

@Component({
  computed: {
    ...mapGetters("folder", {
      selectedSong: "selectedSong"
    })
  }
})
export default class AudioControls extends Vue {
  selectedSong!: SongFileI;

  playingNext = true;

  async playBefore() {
    await this.$store.dispatch("folder/selectSongByDiff", -1);
    this.$nextTick(() => {
      this.waveshape.play();
    });
  }

  async playNext() {
    await this.$store.dispatch("folder/selectSongByDiff", 1);
    this.$nextTick(() => {
      this.waveshape.play();
    });
  }

  audioState: "playing" | "paused" | "stoped" = "stoped";
  progress = 0;
  duration = 0;
  volume = 50;
  currentTimeVal = "00:00";
  totalTimeVal = "00:00";

  @Prop()
  waveshape!: WaveSurfer;

  mounted() {
    this.$store.commit("audio/initWaveShape");
    this.$nextTick(() => {
      this.waveshape.on("audioprocess", this.refreshProgress);
      this.waveshape.on("finish", this.handleEnded);
      this.waveshape.on("play", () => {
        this.audioState = "playing";
        this.$store.commit("audio/setAudioState", this.audioState);
      });
      this.waveshape.on("pause", () => {
        this.audioState = "paused";
        this.$store.commit("audio/setAudioState", this.audioState);
      });
      this.waveshape.on("ready", this.refreshDuration);
      this.volume = this.waveshape.getVolume();
    });
  }

  changeVolume(val: number) {
    this.volume = val;
    this.waveshape.setVolume(this.volume / 100);
  }

  destroyed() {
    this.waveshape?.unAll();
    this.waveshape?.destroy();
  }

  handlePlay() {
    if (this.waveshape.isPlaying()) {
      this.waveshape.pause();
    } else {
      this.waveshape.play();
    }
  }

  refreshProgress() {
    const currentTime = this.waveshape.getCurrentTime();
    this.currentTimeVal = parseSecondsToHuman(currentTime);
  }

  refreshDuration() {
    this.duration = this.waveshape.getDuration();
    this.totalTimeVal = parseSecondsToHuman(this.duration);
  }

  handleEnded() {
    if (this.playingNext) {
      this.playNext();
    }
  }

  // refreshAudioInfo() {
  //   this.audioState = this.waveshape.isPlaying() ? "playing" : "paused";
  //   this.$store.commit("audio/setAudioState", this.audioState);
  // }

  // @Watch("audio")
  // audioListeners(newVal: HTMLAudioElement, oldVal: HTMLAudioElement) {
  //   // console.log({ oldVal });
  //   const eventsAudioState = ["play", "pause", "ended"];

  //   if (oldVal) {
  //     oldVal.pause();
  //     oldVal.removeEventListener("loadedmetadata", this.refreshDuration);
  //     oldVal.removeEventListener("timeupdate", this.refreshProgress);
  //     oldVal.removeEventListener("ended", this.handleEnded);
  //     eventsAudioState.forEach(ev => {
  //       oldVal.removeEventListener(ev, this.refreshAudioInfo);
  //     });
  //   }
  //   if (newVal) {
  //     newVal.addEventListener("loadedmetadata", this.refreshDuration);
  //     newVal.addEventListener("timeupdate", this.refreshProgress);
  //     newVal.addEventListener("ended", this.handleEnded);
  //     eventsAudioState.forEach(ev => {
  //       newVal.addEventListener(ev, this.refreshAudioInfo);
  //     });
  //   }
  //   this.refreshProgress();
  //   this.refreshAudioInfo();
  // }
}
</script>

<style lang="scss">
.waveshape-container {
  border-bottom: 1px solid silver;
  border-top: 1px solid silver;
  background-color: rgba(235, 189, 51, 0.1);
}
</style>
