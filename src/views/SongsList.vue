<template>
  <v-row no-gutters style="padding-bottom: 100px;">
    <v-col>
      <v-card width="100%">
        <v-card-title class="text-h5 py-3 px-4">
          <span class="font-weight-bold">
            Songs
          </span>
          <v-spacer />
          <span class="subtitle-1" v-if="$store.state.folder.folderName">
            <span class="mr-5"> [ {{ $store.state.folder.folderName }} ] </span>
            <span> [ {{ $store.state.folder.songFiles.length }} ] </span>
          </span>
        </v-card-title>
        <v-divider />
        <v-list-item-group
          :value="$store.state.folder.selected"
          color="amber"
          v-if="$store.state.folder.folderName && !$store.state.folder.loading"
        >
          <template v-for="(song, i) in $store.state.folder.songFiles">
            <v-list-item
              :key="song.name"
              @click="selectSong(song, i)"
              :ripple="{ center: true }"
            >
              <v-list-item-avatar>
                <v-icon large>
                  fas fa-compact-disc
                  {{
                    i === $store.state.folder.selected &&
                    $store.state.audio.state === "playing"
                      ? "fa-spin"
                      : null
                  }}
                </v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="black--text">
                  {{ song.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  Lorem ipsum
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider inset :key="`${song.name}-divid`" />
          </template>
        </v-list-item-group>
        <v-card-text
          v-if="!$store.state.folder.folderName && !$store.state.folder.loading"
        >
          <v-row no-gutters class="flex-wrap">
            <v-col cols="12" class="text-center pb-2 pt-1 subtitle-1">
              Open a folder to list it's songs here
            </v-col>
            <v-col cols="12" class="text-center py-3">
              <OpenFolder dark />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text
          v-if="$store.state.folder.loading"
          class="text-center subtitle-1 pb-2 pt-1"
        >
          LOADING
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import OpenFolder from "../components/Actions/OpenFolder.vue";

@Component({
  components: {
    OpenFolder
  }
})
export default class SongsList extends Vue {
  async selectSong(song: Record<string, any>, i: number) {
    await this.$store.dispatch("folder/selectSongByIndex", i);
  }
}
</script>
