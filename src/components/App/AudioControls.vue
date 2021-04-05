<template>
  <v-card tile style="position: fixed; bottom: 0; width: calc(100% - 80px);">
    <div
      v-show="selectedSong"
      id="waveshape-container"
      class="waveshape-container"
    >
      <div id="wave-shape" />
    </div>
    <v-list v-if="selectedSong">
      <v-list-item>
        <v-list-item-avatar
          style="border-radius: 4px;"
          class="my-0 pa-0 mr-2"
          size="112"
          height="62"
        >
          <v-img
            class="black"
            v-if="selectedSong.meta.imageSrc"
            :src="selectedSong.meta.imageSrc"
          />
          <v-sheet v-else height="100%" width="100%" color="grey lighten-3">
            <v-icon x-large color="blue-grey lighten-2">
              fas fa-music
            </v-icon>
          </v-sheet>
        </v-list-item-avatar>
        <div class="px-3 mr-3">
          <div style="border-bottom: 1px solid #c0c0c059;">
            {{ currentTimeVal }}
          </div>
          <div style="border-top: 1px solid transparent;">
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
        <div style="width:250px" class="px-5 mr-2">
          <v-slider
            min="0"
            max="100"
            hide-details
            value="50"
            track-color="yellow darken-1"
            thumb-label
            @change="changeVolume"
            color="#EF6C00"
            prepend-icon="fas fa-volume-up"
          />
        </div>
        <v-list-item-icon class="mr-3">
          <v-btn
            outlined
            icon
            :class="{ 'amber lighten-3': randomMode }"
            title="Random mode"
            :disabled="
              !playingNext ||
                this.$store.state.folder.songFiles.length <= rememberAmount
            "
            @click="randomMode = !randomMode"
            :style="randomMode ? 'border: 2px solid !important;' : null"
          >
            <v-icon small>fas fa-random</v-icon>
          </v-btn>
        </v-list-item-icon>
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
        <v-list-item-icon>
          <v-btn outlined icon @click="playBefore">
            <v-icon small>fas fa-fast-backward</v-icon>
          </v-btn>
        </v-list-item-icon>
        <v-list-item-icon :class="{ 'mx-5': $vuetify.breakpoint.mdAndUp }">
          <v-btn outlined icon @click="handlePlay">
            <v-icon
              small
              :style="
                'transition: none; ' +
                  (audioState !== 'playing'
                    ? 'margin-left: 3px;'
                    : 'margin-left: 1px;')
              "
            >
              {{
                audioState === "playing"
                  ? "fas fa-pause fa-fw"
                  : "fas fa-play fa-fw"
              }}
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
import BpmFinderDialog from "@/components/Dialogs/BpmFinderDialog.vue";

import moment from "moment";
import { SongFileI } from "@/store/folder";
function parseSecondsToHuman(seconds: number) {
  return moment
    .utc()
    .startOf("day")
    .add({ seconds: seconds })
    .format("mm:ss");
}

function throttle(fn: Function, miliseconds: number) {
  let isCalled = false;
  // @ts-ignore
  return function(...args) {
    if (!isCalled) {
      fn(...args);
      isCalled = true;
      setTimeout(function() {
        isCalled = false;
      }, miliseconds);
    }
  };
}

@Component({
  computed: {
    ...mapGetters("folder", {
      selectedSong: "selectedSong"
    })
  },
  components: {
    BpmFinderDialog
  }
})
export default class AudioControls extends Vue {
  selectedSong!: SongFileI;

  playingNext = true;

  async playBefore() {
    if (this.randomMode && this.playedRandomly.length) {
      this.playedRandomly.pop();
      const aux = this.playedRandomly.pop();
      if (!aux) return;
      else {
        this.playedRandomly.push(aux);
        await this.$store.dispatch("folder/selectSongByIndex", aux);
        this.$nextTick(() => {
          this.waveshape.play();
        });
        return;
      }
    }
    await this.$store.dispatch("folder/selectSongByDiff", -1);
    this.$nextTick(() => {
      this.waveshape.play();
    });
  }

  async playNext() {
    if (this.randomMode) {
      this.playRandom();
      return;
    }
    await this.$store.dispatch("folder/selectSongByDiff", 1);
    this.$nextTick(() => {
      this.waveshape.play();
    });
  }

  audioState: "playing" | "paused" | "stoped" = "stoped";
  progress = 0;
  volume = 50;
  currentTimeVal = "00:00";
  totalTimeVal = "00:00";

  @Prop()
  waveshape!: WaveSurfer;

  mounted() {
    this.$store.commit("audio/initWaveShape");
    this.$nextTick(() => {
      this.waveshape.on("audioprocess", throttle(this.refreshProgress, 1000));
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
    // npm install --save-dev @types/wicg-mediasession <--- this will fix the types
    // @ts-ignore
    navigator.mediaSession.setActionHandler("previoustrack", this.playBefore);
    // @ts-ignore
    navigator.mediaSession.setActionHandler("nexttrack", this.playNext);
  }

  changeVolume(val: number) {
    this.volume = val;
    this.waveshape.setVolume(this.volume / 100);
  }

  destroyed() {
    this.waveshape?.unAll();
    this.waveshape?.destroy();
    // @ts-ignore
    navigator.mediaSession.setActionHandler("previoustrack", null);
    // @ts-ignore
    navigator.mediaSession.setActionHandler("nexttrack", null);
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
    if (this.$store.state.playlist.list.length) {
      this.$store.commit("playlist/addSecond");
    }
  }

  refreshDuration() {
    this.totalTimeVal = parseSecondsToHuman(this.waveshape.getDuration());
  }

  randomMode = false;

  rememberAmount = 5;

  playedRandomly: Array<number> = [];

  randomNum = () =>
    Math.floor(Math.random() * (this.$store.state.folder.songFiles.length + 1));

  getPseudoRandom(): number {
    const auxRandom = this.randomNum();
    if (
      this.$store.state.folder.selected === auxRandom ||
      this.playedRandomly.includes(auxRandom)
    ) {
      return this.getPseudoRandom();
    } else {
      this.playedRandomly.push(auxRandom);
      if (this.playedRandomly.length >= this.rememberAmount) {
        this.playedRandomly.splice(0, 1);
      }
      return auxRandom;
    }
  }

  async playRandom() {
    const random = this.getPseudoRandom();
    await this.$store.dispatch("folder/selectSongByIndex", random);
    this.$nextTick(() => {
      this.waveshape.play();
    });
  }

  async handleEnded() {
    if (this.$store.getters["playlist/playlistMode"]) {
      this.$store.commit("playlist/removeFromListByIndex", 0);
      if (!this.$store.state.playlist.list[0]) {
        await this.beep();
        await new Promise(resolve => setTimeout(resolve, 50));
        await this.beep(800);
        this.$store.commit("playlist/resetState");
      } else {
        await this.$store.dispatch(
          "folder/selectSongByPath",
          this.$store.state.playlist.list[0].path
        );
        this.$nextTick(() => {
          this.waveshape.play();
        });
      }
      return;
    }
    if (this.playingNext && this.randomMode) {
      this.playRandom();
      return;
    }
    if (this.playingNext) {
      this.playNext();
      return;
    }
  }

  context = new window.AudioContext();

  beep(freq = 850) {
    return new Promise<void>(res => {
      const oscillator = this.context.createOscillator();
      oscillator.frequency.value = freq;
      oscillator.type = "triangle";
      oscillator.connect(this.context.destination);
      oscillator.start(0);
      setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        res();
      }, 150);
    });
  }
}
</script>

<style lang="scss">
.waveshape-container {
  border-bottom: 1px solid silver;
  border-top: 1px solid silver;
  background-color: rgba(235, 189, 51, 0.1);
}
</style>
