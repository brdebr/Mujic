import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

const MY_ICONS = {
  image: "far fa-image",
  folder: "fas fa-folder",
  search: "fas fa-search"
};

export default new Vuetify({
  theme: {
    options: {
      customProperties: true
    },
    themes: {
      light: {
        primary: "#FF9800",
        secondary: "#424242",
        accent: "#82B1FF",
        error: "#FF5252",
        info: "#2196F3",
        success: "#4CAF50",
        warning: "#FFC107"
      }
    }
  },
  icons: {
    iconfont: "fa",
    values: MY_ICONS
  }
});
