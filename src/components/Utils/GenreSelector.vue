<template>
  <v-combobox
    outlined
    clearable
    multiple
    class="genre-selector"
    :items="$store.getters['folder/genreTextArray']"
    :delimiters="[',', ' ']"
    v-model="model"
    hide-selected
    :menu-props="{
      contentClass: 'genre-selector-menu'
    }"
    @change="createIfNotExists"
    :search-input.sync="search"
    :hide-no-data="!search"
    label="Genre"
  >
    <template #no-data>
      <v-list-item>
        <span class="subheading mr-3">Create</span>
        <v-chip label small>
          {{ search }}
        </v-chip>
      </v-list-item>
    </template>
    <template #selection="{item, parent, selected }">
      <v-chip
        :input-value="selected"
        label
        small
        :dark="genreDarkMap[item]"
        :color="genreColorMap[item]"
      >
        <span class="pr-2">
          {{ item }}
        </span>
        <v-icon small @click="parent.selectItem(item)">
          $close
        </v-icon>
      </v-chip>
    </template>
    <template #item="{ index, item }">
      <v-chip small :dark="genreDarkMap[item]" :color="genreColorMap[item]">
        {{ item }}
      </v-chip>
    </template>
  </v-combobox>
</template>

<script lang="ts">
import { AudioTag, GENRE_COLORS_ARRAY } from "@/main/SongTags";
import { Component, Vue, Watch } from "vue-property-decorator";
import { Prop } from "vue-property-decorator";
import { ipcRenderer } from "electron";

@Component({
  model: {
    prop: "value",
    event: "input"
  }
})
export default class GenreSelector extends Vue {
  model = this.value
    ? typeof this.value === "string"
      ? [this.value]
      : this.value
    : [];

  @Prop()
  value!: [] | string;

  get genreColorMap() {
    // @ts-ignore
    return this.$store.state?.folder?.genreArray.reduce((acc, el) => {
      acc[el.text] = el.color || "#102030";
      return acc;
    }, {});
  }

  get genreDarkMap() {
    // @ts-ignore
    return this.$store.state?.folder?.genreArray.reduce((acc, el) => {
      acc[el.text] = this.isDark(el.color);
      return acc;
    }, {});
  }

  async createIfNotExists(value: []) {
    const item = value[value.length - 1];
    const found = (this.$store.state.folder.genreArray as Array<{
      text: string;
      color: string;
    }>).findIndex(el => el.text === item);
    if (item && found === -1) {
      const randomColor = this.randomize(GENRE_COLORS_ARRAY);
      ipcRenderer.invoke("set-store-config", "genres", "list", [
        ...this.$store.state.folder.genreArray,
        {
          text: item,
          color: randomColor,
          dark: this.isDark(randomColor, 130)
        }
      ]);
      await this.fetchGenreList();
    }
  }

  @Watch("model")
  refreshValue(newVal: [string], oldVaL) {
    if (!newVal.length) {
      this.$emit("input", undefined);
    } else {
      this.$emit("input", newVal.join(","));
    }
  }

  randomize(arr: Array<any>) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  async fetchGenreList() {
    await this.$store.dispatch("folder/fetchGenreArray");
  }

  /**
   * From this article:
   *
   * https://awik.io/determine-color-bright-dark-using-javascript/
   */
  isDark(color: any, sensitivity = 127.5) {
    if (!color) {
      return true;
    }
    // Variables for red, green, blue values
    let r: number, g: number, b: number;

    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {
      // If RGB --> store the red, green, blue values in separate variables
      color = color.match(
        /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
      );

      r = color[1];
      g = color[2];
      b = color[3];
    } else {
      // If hex --> Convert it to RGB: http://gist.github.com/983661
      color = +(
        "0x" + color.slice(1).replace(color.length < 5 && /./g, "$&$&")
      );

      r = color >> 16;
      g = (color >> 8) & 255;
      b = color & 255;
    }

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

    // console.log(`color: ${color} hps:${hsp}`);

    // Using the HSP value, determine whether the color is light or dark
    if (hsp > sensitivity) {
      return false;
    } else {
      return true;
    }
  }

  search = "";
}
</script>

<style lang="scss">
.genre-selector-menu {
  .v-chip.v-size--small {
    border-radius: 4px;
    font-size: 14px;
    height: 28px;
    .v-chip__content {
      button {
        margin-left: 8px;
      }
    }
  }
}
.genre-selector {
  .v-select__selections {
    .v-chip.v-size--small {
      border-radius: 4px;
      font-size: 14px;
      height: 28px;
      .v-chip__content {
        button {
          margin-left: 8px;
        }
      }
    }
  }
  .v-input__append-inner {
    margin: auto !important;
  }
}
</style>
