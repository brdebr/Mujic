<template>
  <v-app-bar
    clipped-left
    app
    flat
    :color="isDev() ? 'yellow' : 'orange accent-4'"
    class="the-toolbar"
  >
    <v-btn outlined fab class="white--text ml-3 mr-4 custom-side-button">
      <v-icon small>
        fas fa-bars
      </v-icon>
    </v-btn>
    <v-toolbar-title to="/" class="ml-3 headline font-weight-bold">
      <router-link to="/" tag="div" style="cursor:pointer" class="logo-link">
        <v-btn
          depressed
          class="px-6"
          color="blue-grey darken-4"
          :ripple="{ center: true, class: 'lime--text text--lighten-3' }"
        >
          <img src="@/assets/img/logo.png" class="logo-img" />
        </v-btn>
      </router-link>
    </v-toolbar-title>
    <v-spacer />
    <OpenFolder />
    <OpenDownload />
  </v-app-bar>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ipcRenderer } from "electron";
import OpenFolder from "@/components/Actions/OpenFolder.vue";
import OpenDownload from "@/components/Actions/OpenDownload.vue";

@Component({
  components: {
    OpenFolder,
    OpenDownload
  }
})
export default class extends Vue {
  isDev() {
    return window.process.env.NODE_ENV === "development";
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
