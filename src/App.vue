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
  </v-app>
</template>

<script>
import TheDrawer from "@/components/Layout/TheDrawer.vue";
import TheToolbar from "@/components/Layout/TheToolbar.vue";
import AudioControls from "@/components/App/AudioControls.vue";
import DownloadDialog from "@/components/Dialogs/DownloadDialog.vue";

export default {
  name: "App",
  data: () => ({
    //
  }),
  components: {
    TheToolbar,
    TheDrawer,
    AudioControls,
    DownloadDialog
  },
  mounted() {
    // this.$store.commit('app/fetchInstances');
  }
};
</script>

<style lang="scss">
@import "@/assets/css/transitions.scss";
@import "@/assets/css/custom.scss";
</style>
