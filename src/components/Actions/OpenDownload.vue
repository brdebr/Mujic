<template>
  <v-btn depressed class="mr-4" @click="openDownload" :dark="dark">
    <v-icon class="mr-2" size="20">
      fab fa-youtube
    </v-icon>
    <span style="padding-top: 1px">
      Download
    </span>
  </v-btn>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ipcRenderer } from "electron";
import { Prop } from "vue-property-decorator";

@Component({
  components: {}
})
export default class OpenDownload extends Vue {
  async openDownload() {
    this.$store.commit("download/setDialog", true);
    // this.$store.state.download.dialog
  }
  @Prop()
  dark!: boolean;
}
</script>
