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
        <template v-for="item in $store.state.folder.songFiles">
          <v-list-item :key="item.name">
            <v-list-item-avatar>
              <v-icon large>
                fas fa-compact-disc {{ item.active ? "fa-spin" : null }}
              </v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ item.subtitle }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon outlined>
                <v-icon
                  color="grey lighten-1"
                  size="14"
                  style="padding-left: 2px;"
                >
                  fas fa-play
                </v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider inset :key="`${item.name}-div`" />
        </template>
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
