<template>
  <v-app-bar
    clipped-left
    app
    dark
    flat
    color="orange accent-4"
    class="the-toolbar"
  >
    <v-btn
      outlined
      fab
      class="white--text ml-3 mr-4 custom-side-button"
      @click="$store.commit('layout/toggleDrawer')"
    >
      <v-icon small>
        fas fa-bars
      </v-icon>
    </v-btn>
    <v-toolbar-title to="/" class="ml-3 headline font-weight-bold">
      <router-link to="/" tag="div" style="cursor:pointer" class="logo-link">
        <v-btn
          depressed
          class="px-6"
          :ripple="{ center: true, class: 'lime--text text--lighten-3' }"
        >
          <!-- <v-icon color="white" class="mr-4 ml-n1">
            fas fa-music
          </v-icon> -->
          <img src="@/assets/img/logo.png" class="logo-img" />
        </v-btn>
      </router-link>
    </v-toolbar-title>
    <v-spacer />
    <v-btn depressed class="mr-4" @click="openFolder">
      <v-icon class="mr-2" size="18">
        fas fa-folder
      </v-icon>
      <span style="padding-top: 1px">
        Open folder
      </span>
    </v-btn>
    <v-btn depressed>
      <v-icon class="mr-2" size="20">
        fab fa-youtube
      </v-icon>
      <span style="padding-top: 1px">
        Download
      </span>
    </v-btn>
  </v-app-bar>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ipcRenderer } from "electron";

@Component({
  components: {}
})
export default class extends Vue {
  async openFolder() {
    const folderPath = await ipcRenderer.invoke("dialogGetFolder");
    this.$store.dispatch("folder/fetchSongFiles", folderPath);
  }
}
</script>
<style lang="scss">
.logo-link {
  .v-btn:hover:before,
  .v-btn:focus:before {
    display: none;
    transition: none;
  }
  .logo-img {
    max-height: 36px;
  }
}
.the-toolbar {
  .v-toolbar__content {
    border-bottom: 3px solid #bf360c;
  }
}
.custom-side-button {
  border-width: 3px;
  $button-size: 48px;
  height: $button-size !important;
  width: $button-size !important;
}
</style>
