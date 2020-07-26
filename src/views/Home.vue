<template>
  <v-row no-gutters style="padding-bottom: 100px;">
    <v-col>
      <v-card width="100%">
        <v-card-title class="text-h5 py-3 px-4">
          <span class="font-weight-bold">
            Songs
          </span>
          <v-spacer />
          <span class="subtitle-1">
            <span class="mr-5"> [ {{ $store.state.folder.folderName }} ] </span>
            <span> [ {{ $store.state.folder.songFiles.length }} ] </span>
          </span>
        </v-card-title>
        <v-divider />
        <v-list-item-group :value="$store.state.folder.selected" color="amber">
          <template v-for="(song, i) in $store.state.folder.songFiles">
            <v-list-item
              :key="song.name"
              @click="selectSong(song, i)"
              :ripple="{ center: true }"
            >
              <v-list-item-avatar>
                <v-icon large>
                  fas fa-compact-disc
                  {{ i === $store.state.folder.selected ? "fa-spin" : null }}
                </v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="black--text">
                  {{ song.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  <!-- {{ song.tags.join(" -- ") }} -->
                </v-list-item-subtitle>
              </v-list-item-content>
              <!-- <v-list-item-action>
                <v-btn icon outlined>
                  <v-icon
                    color="grey lighten-1"
                    size="14"
                    style="padding-left: 2px;"
                  >
                    fas fa-play
                  </v-icon>
                </v-btn>
              </v-list-item-action> -->
            </v-list-item>
            <v-divider inset :key="`${song.name}-divid`" />
          </template>
        </v-list-item-group>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

// interface AudioItem {
//   name: string;
//   subtitle: string;
//   active?: boolean;
// }

@Component({
  components: {}
})
export default class extends Vue {
  selectSong(song: Record<string, any>, i: number) {
    this.$store.commit("folder/selectSong", i);
  }

  // items: Array<AudioItem> = [
  //   {
  //     name: "It's My life - Bon Jovi",
  //     subtitle: "10/11/1990"
  //   },
  //   {
  //     name: "The Walker - Fitz & The Trantrums",
  //     subtitle: "10/11/1990",
  //     active: true
  //   },
  //   {
  //     name: "Felling Still - Portugal The Man",
  //     subtitle: "10/11/1990"
  //   }
  // ];
  // songsPath = "D:\\Downloads";
}
</script>
