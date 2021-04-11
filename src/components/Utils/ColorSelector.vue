<template>
  <v-menu :close-on-content-click="false">
    <template #activator="{on, props}">
      <div class="d-inline-flex">
        <v-sheet
          width="20"
          height="20"
          :color="genre.color"
          v-on="on"
          v-bind="props"
          class="mr-2"
        />
        <span>
          {{ genre.dark ? "Dark" : "Light" }}
        </span>
      </div>
    </template>
    <v-card>
      <div class="d-flex justify-center py-2">
        <v-btn color="green darken-1" outlined @click="saveGenre(newColor)">
          Save
        </v-btn>
      </div>
      <div>
        <v-divider />
      </div>
      <div class="d-flex justify-center pt-1 caption">
        Preview
      </div>

      <div class="d-flex align-center justify-center py-2">
        <v-btn
          :color="newColor.color"
          depressed
          small
          :dark="newColor.dark"
          class="mr-5"
        >
          {{ genre.text }}
        </v-btn>
        <label class="d-inline-flex align-center">
          <input type="checkbox" v-model="newColor.dark" />
          <span class="caption pt-1 pl-2">
            Dark?
          </span>
        </label>
      </div>
      <v-color-picker
        :value="genre.color"
        mode="hexa"
        show-swatches
        @input="changeColor"
      />
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { GenreObject } from "@/store/folder";
import { Component, Vue } from "vue-property-decorator";
import { Prop } from "vue-property-decorator";

import { distinctUntilChanged, debounceTime, tap } from "rxjs/operators";

@Component({
  subscriptions() {
    return {
      color$: this.$createObservableMethod("changeColor").pipe(
        distinctUntilChanged(),
        debounceTime(50),
        tap(el => {
          // @ts-ignore
          this.newColor.color = el;
        })
      )
    };
  },
  model: {
    prop: "value",
    event: "input"
  }
})
export default class ColorSelector extends Vue {
  @Prop()
  value!: string;

  @Prop()
  saveGenre!: Function;

  @Prop()
  genre!: GenreObject;

  newColor: GenreObject = { ...this.genre };
}
</script>

<style lang="scss"></style>
