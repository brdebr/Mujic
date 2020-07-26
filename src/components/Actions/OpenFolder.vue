<template>
  <v-btn depressed class="mr-4" @click="openFolder" :dark="dark">
    <v-icon class="mr-2" size="18">
      fas fa-folder
    </v-icon>
    <span style="padding-top: 1px">
      Open folder
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
export default class OpenFolder extends Vue {
  async openFolder() {
    const folderPath = await ipcRenderer.invoke("dialogGetFolder");
    this.$store.dispatch("folder/fetchSongFiles", folderPath);
  }
  @Prop()
  dark!: boolean;
}
</script>
