<template>
  <v-app>
    <TheDrawer />
    <TheToolbar />
    <v-main>
      <v-container class="align-start bg-gradient px-4" fill-height fluid>
        <transition name="page" mode="out-in">
          <router-view :key="$route.fullPath" />
        </transition>
      </v-container>
      <AudioControls :audio="$store.state.audio.audio" />
      <DownloadDialog :value="this.$store.state.download.dialog" />
    </v-main>
    <div class="notifications">
      <v-snackbar
        v-model="ffmpegSnack1"
        top
        right
        color="blue-grey lighten-1"
        :timeout="5000"
      >
        {{ ffmpegSnack1Text }}
        <template v-slot:action="{ attrs }">
          <v-btn dark text v-bind="attrs" @click="ffmpegSnack1 = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
      <v-snackbar
        v-model="ffmpegSnack2"
        top
        right
        color="green"
        :timeout="5000"
      >
        {{ ffmpegSnack2Text }}
        <template v-slot:action="{ attrs }">
          <v-btn dark text v-bind="attrs" @click="ffmpegSnack2 = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </v-app>
</template>

<script>
import TheDrawer from "@/components/Layout/TheDrawer.vue";
import TheToolbar from "@/components/Layout/TheToolbar.vue";
import AudioControls from "@/components/App/AudioControls.vue";
import DownloadDialog from "@/components/Dialogs/DownloadDialog.vue";
import { ipcRenderer } from "electron";

export default {
  name: "App",
  data: () => ({
    ffmpegSnack1: false,
    ffmpegSnack1Text: "Downloading ffmpeg.exe",
    ffmpegSnack2: false,
    ffmpegSnack2Text: "Download complete"
    //
  }),
  components: {
    TheToolbar,
    TheDrawer,
    AudioControls,
    DownloadDialog
  },
  mounted() {
    const ffpegState = ipcRenderer.invoke("check-ffmpeg");
    if (ffpegState) {
      this.$store.commit("download/setLoadedFfmpeg", true);
    } else {
      ipcRenderer.on("ffmpeg-download-start", () => {
        this.ffmpegSnack1 = true;
      });
      ipcRenderer.on("ffmpeg-downloaded", () => {
        this.ffmpegSnack2 = true;
        this.$store.commit("download/setLoadedFfmpeg", true);
      });
      ipcRenderer.on("ffmpeg-set", () => {
        this.$store.commit("download/setLoadedFfmpeg", true);
      });
    }
  }
};
</script>

<style lang="scss">
@import "@/assets/css/transitions.scss";
@import "@/assets/css/custom.scss";
</style>
