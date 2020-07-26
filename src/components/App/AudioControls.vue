<template>
  <v-card
    tile
    style="position: fixed; bottom: 0; width: calc(100% - 80px);"
    v-if="selectedSong"
  >
    <v-progress-linear
      color="indigo darken-4"
      :value="progress"
      striped
      class="my-0"
      height="10"
    />
    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>
            {{ selectedSong.name }}
          </v-list-item-title>
          <v-list-item-subtitle>
            Lorem ipsum dolor
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-spacer />
        <v-list-item-icon>
          <v-btn outlined icon>
            <v-icon small>fas fa-fast-backward</v-icon>
          </v-btn>
        </v-list-item-icon>
        <v-list-item-icon :class="{ 'mx-5': $vuetify.breakpoint.mdAndUp }">
          <v-btn
            outlined
            icon
            @click="v => (audio.paused ? audio.play() : audio.pause())"
          >
            <v-icon small>
              {{ audio && audio.paused ? "fas fa-play" : "fas fa-pause" }}
            </v-icon>
          </v-btn>
        </v-list-item-icon>
        <v-list-item-icon class="ml-0">
          <v-btn outlined icon>
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

@Component({
  computed: {
    ...mapGetters("folder", {
      selectedSong: "selectedSong"
    })
  }
})
export default class AudioControls extends Vue {
  selectedSong: any;

  progress = 0;

  @Prop()
  audio: any;

  @Watch("audio")
  audioListeners(newVal: HTMLAudioElement, oldVal: HTMLAudioElement) {
    newVal.addEventListener("timeupdate", ev => {
      this.progress =
        (this.audio.currentTime.toFixed() * 100) /
        this.audio.duration.toFixed();
    });
  }

  // get progress() {
  //   return (this.audio.currentTime * 100) / this.audio.duration;
  // }

  // async setAudio() {
  //   // const fetchAudio64 = await this.$store.dispatch(
  //   //   "folder/fetchAudio64",
  //   //   // @ts-ignore
  //   //   this.selectedSong.path
  //   // );
  //   // this.audio = new Audio(`data:audio/x-wav;base64, ${fetchAudio64}`);
  //   // console.log({ audio: this.audio });
  //   // audio.play();
  //   // myaudio.play(); - This will play the music.
  //   // myaudio.pause(); - This will stop the music.
  //   // myaudio.duration; - Returns the length of the music track.
  //   // myaudio.currentTime = 0; - This will rewind the audio to the beginning.
  //   // myaudio.loop = true; - This will make the audio track loop.
  //   // myaudio.muted = true; - This will mute the track
  //   // let audio = new Audio("data:audio/wav;base64," + base64string);
  // }
}
</script>

<style></style>
