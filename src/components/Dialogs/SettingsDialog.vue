<template>
  <v-dialog transition="slide-y-transition">
    <template #activator="{ on, props }">
      <v-btn
        :icon="$store.state.layout.drawerMini"
        v-on="on"
        v-bind="props"
        :style="{
          paddingLeft: $store.state.layout.drawerMini ? '1px' : null
        }"
        :block="!$store.state.layout.drawerMini"
        outlined
        style="color: rgba(0, 0, 0, 0.54);"
      >
        <v-icon small>
          fas fa-cogs
        </v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        Settings
      </v-card-title>
      <v-divider />
      <v-card-text class="pt-4">
        <v-row no-gutters>
          <v-col cols="5">
            <div class="text-h6">
              List columns
            </div>
            <div class="mb-3">
              <v-divider />
            </div>
            <div>
              <v-select
                outlined
                dense
                class="mt-6"
                label="Display mainly"
                @input="
                  v => $store.commit('folder/setShowFilename', v === 'Filename')
                "
                :items="['Title', 'Filename']"
                :value="'Title'"
              />
            </div>
          </v-col>
          <v-col cols="6" offset="1">
            <div class="text-h6">
              Genres
            </div>
            <div class="mb-3">
              <v-divider />
            </div>
            <div>
              <v-row
                no-gutters
                v-for="genre in $store.state.folder.genreArray"
                :key="genre.text"
                align="center"
              >
                <v-col cols="4">
                  <div class="pb-3">
                    <v-btn
                      :color="genre.color"
                      depressed
                      small
                      :dark="genre.dark"
                    >
                      {{ genre.text }}
                    </v-btn>
                  </div>
                </v-col>
                <v-col cols="2">
                  <ColorSelector
                    :value="genre.color"
                    :genre="genre"
                    :saveGenre="saveGenre"
                  />
                </v-col>
              </v-row>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import { GenreObject } from "@/store/folder";
import ColorSelector from "../Utils/ColorSelector.vue";

@Component({
  components: {
    ColorSelector
  }
})
export default class SettingsDialog extends Vue {
  saveGenre(newGenre: GenreObject) {
    this.$store.dispatch("folder/saveGenreArray", newGenre);
  }
}
</script>
