<template>
    <v-text-field
        v-model="videoUrl"
        label="Video URL"
        messages="lorem impsum"
        class="field-fix-prepend-inner"
        :hide-details="true"
        outlined
        :rounded="!inputShaped"
        :shaped="videoObj$ && !!videoObj$.title"
        prepend-inner-icon="fas fa-external-link-alt"
        append-icon="fas fa-download"
        @click:append="download"
    />
</template>

<script lang="ts">
import Vue from 'vue'
import axios from "axios";
// import VueRx from "vue-rx";
import { VideoObj } from '@/components/Dialogs/DownloadDialog.vue';

import {
  filter,
  distinctUntilChanged,
  debounceTime,
  switchMap,
  pluck,
  tap,
  map
} from "rxjs/operators";

export default Vue.extend({
    data() {
        return {
            videoUrl: ''
        }
    },
    props: {
        inputShaped: {
            type: Boolean,
            default: false
        },
    },
    methods: {
        download() {
            console.log('Never gonna give you up...');
        }
    },
    subscriptions() {
    return {
      videoObj$: this.$watchAsObservable("videoUrl").pipe(
        filter(val => !!val),
        distinctUntilChanged(),
        debounceTime(500),
        tap(val => {
          this.$data.loading = true;
        }),
        switchMap(val => {
          return axios.get(val.newValue);
        }),
        filter(val => val.status === 200),
        pluck("data"),
        map(val => new DOMParser().parseFromString(val, "text/html")),
        map(doc => {
          const returnObj: VideoObj = {
            title: "",
            imageUrl: "",
            description: ""
          };
          returnObj.title =
            doc
              .querySelector('meta[property="og:title"]')
              ?.attributes?.getNamedItem("content")?.value || "";

          returnObj.imageUrl =
            doc
              .querySelector('meta[property="og:image"]')
              ?.attributes?.getNamedItem("content")?.value || "";

          returnObj.description =
            doc
              .querySelector('meta[property="og:description"]')
              ?.attributes?.getNamedItem("content")?.value || "";

          return returnObj;
        }),
        tap(val => {
          this.$data.loading = false;
        })
      )
    };
  }
})
</script>

<style lang="scss">
.field-fix-prepend-inner {
  &.v-input--is-label-active {
    // ROUND A
    &.v-text-field--rounded {
      .v-input__slot {
        .v-input__prepend-inner {
          margin-right: 12px;
          margin-top: 14px;
        }
        fieldset {
          legend {
            width: 105px !important;
          }
        }
      }
      .v-text-field__slot {
        label {
          display: inline-block;
          padding-left: 10px !important;
          margin-left: 0px !important;
        }
      }
    }
    // SHAPED A
    &.v-text-field--shaped {
      .v-input__slot {
        padding-top: 1px;
        .v-input__prepend-inner {
          margin-right: 12px;
          margin-top: 14px;
          margin-left: 5px;
        }
        fieldset {
          legend {
            width: 90px !important;
          }
        }
      }
      .v-text-field__slot {
        label {
          display: inline-block;
          padding-left: 13px !important;
          margin-left: -12px !important;
        }
      }
    }
  }
  // ROUND
  &.v-text-field--rounded {
    .v-input__slot {
      .v-input__prepend-inner {
        margin-right: 12px;
        margin-top: 14px;
      }
    }
    .v-text-field__slot {
      label {
        display: inline-block;
        padding-left: 0px !important;
        margin-left: -5px !important;
      }
    }
  }
  // SHAPED
  &.v-text-field--shaped {
    .v-input__slot {
      padding-top: 1px;
      .v-input__prepend-inner {
        margin-right: 12px;
        margin-top: 14px;
        margin-left: 5px;
      }
    }
    .v-text-field__slot {
      label {
        display: inline-block;
        padding-left: -10px !important;
        margin-left: -5px !important;
      }
    }
  }
  // FOCUS

  &.v-input--is-focused {
    // ROUND F
    &.v-text-field--rounded {
      .v-input__slot {
        fieldset {
          legend {
            width: 120px !important;
          }
        }
      }
      .v-text-field__slot {
        label {
          display: inline-block;
          padding-left: 10px !important;
          margin-left: 10px !important;
        }
      }
    }
    // SHAPED F
    &.v-text-field--shaped {
      .v-input__slot {
        fieldset {
          legend {
            width: 130px !important;
          }
        }
      }
      .v-text-field__slot {
        label {
          display: inline-block;
          padding-left: 13px !important;
          margin-left: 10px !important;
        }
      }
    }
  }
}
</style>

