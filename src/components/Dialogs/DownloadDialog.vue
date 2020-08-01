<template>
  <v-dialog
    :value="value"
    max-width="1150px"
    @input="v => $store.commit('download/setDialog', v)"
  >
    <v-card :loading="loading">
      <v-card-title>
        Download from Youtube as MP3
      </v-card-title>
      <v-divider />
      <v-progress-linear
        v-if="progress > 0"
        :value="progress"
        color="red darken-2"
        striped
        height="8"
      />
      <v-card-text class="pt-5">
        <v-row no-gutters class="flex-wrap">
          <v-col cols="12">
            <v-text-field
              v-model="videoUrl"
              label="Video URL"
              color="red darken-2"
              messages="lorem impsum"
              class="field-fix-prepend-inner"
              hide-details
              outlined
              :rounded="locked"
              :shaped="!locked"
              prepend-inner-icon="fas fa-external-link-alt"
              :disabled="progress > 0"
            >
              <template #append>
                <v-btn v-if="locked" disabled outlined icon>
                  <v-icon size="18">
                    fas fa-download
                  </v-icon>
                </v-btn>
                <v-btn
                  v-if="!locked"
                  @click="download"
                  depressed
                  dark
                  :disabled="progress > 0"
                  color="red accent-4"
                >
                  <v-icon size="14" class="mr-3">
                    fas fa-download
                  </v-icon>
                  <span>
                    Download
                  </span>
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="12" v-if="!locked">
            <v-card class="video-prev">
              <v-img
                class="white--text align-end"
                height="240px"
                :src="videoObj$.imageUrl"
              >
                <v-card-title class="bg-above-img-1 py-3 px-5">
                  <div>
                    {{ videoObj$.title }}
                  </div>
                  <div class="ml-auto">
                    <v-icon color="red accent-4">
                      fab fa-youtube
                    </v-icon>
                  </div>
                </v-card-title>
                <v-card-text class="bg-above-img-2 pt-3">
                  {{ videoObj$.description }}
                </v-card-text>
              </v-img>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { ipcRenderer } from "electron";
import { IpcEventNames } from "@/main/IpcManager";

import {
  filter,
  distinctUntilChanged,
  debounceTime,
  switchMap,
  pluck,
  tap,
  map,
  catchError
} from "rxjs/operators";

import axios from "axios";
import { from, of } from "rxjs";

export interface VideoObj {
  siteName: string;
  title: string;
  imageUrl: string;
  description: string;
  videoUrl: string;
}

@Component<DownloadDialog>({
  subscriptions() {
    return {
      videoObj$: this.$watchAsObservable("videoUrl").pipe(
        pluck("newValue"),
        distinctUntilChanged(),
        tap(val => {
          if (!val) this.locked = true;
        }),
        filter(val => !!val),
        debounceTime(500),
        map(val => {
          return new URL(val).toString();
        }),
        catchError((err, caught) => {
          return caught;
        }),
        tap(() => {
          this.loading = true;
        }),
        switchMap(val => {
          return from(axios.get<string>(val)).pipe(
            catchError(() => {
              this.loading = false;
              this.locked = true;
              return of({
                status: -1
              });
            })
          );
        }),
        map(val => {
          if (val.status === 200) {
            return val;
          } else {
            this.locked = true;
            return {
              data: ""
            };
          }
        }),
        pluck("data"),
        filter(val => !!val),
        map(val => new DOMParser().parseFromString(val, "text/html")),
        map(doc => {
          const returnObj: VideoObj = {
            siteName: "",
            title: "",
            imageUrl: "",
            description: "",
            videoUrl: ""
          };

          returnObj.siteName =
            doc
              .querySelector('meta[property="og:site_name"]')
              ?.attributes?.getNamedItem("content")?.value || "";

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

          returnObj.videoUrl =
            doc
              .querySelector('meta[property="og:video:url"]')
              ?.attributes?.getNamedItem("content")?.value || "";
          if (this.isYoutube(returnObj)) this.locked = false;
          return returnObj;
        }),
        tap(() => {
          this.loading = false;
        })
      )
    };
  }
})
export default class DownloadDialog extends Vue {
  @Prop()
  value!: boolean;

  loading = false;

  progress = 0;

  videoUrl = "";

  locked = true;

  download() {
    ipcRenderer.send(IpcEventNames.downloadYT, this.videoUrl);
    this.progress = 1;
  }

  isYoutube(obj: VideoObj) {
    return obj?.siteName === "YouTube";
  }

  mounted() {
    ipcRenderer.on("download-progress", (event, arg) => {
      this.progress = arg;
    });
    ipcRenderer.on("download-finished", (event, arg) => {
      this.progress = 100;
    });
  }

  destroyed() {
    ipcRenderer.removeAllListeners("download-progress");
    ipcRenderer.removeAllListeners("download-finished");
  }
}
</script>

<style lang="scss">
.video-prev {
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}
.bg-above-img-1 {
  background-color: transparentize(#000, 0.28);
}
.bg-above-img-2 {
  background-color: transparentize(#000, 0.18);
}
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
    .v-input__append-inner {
      margin-top: auto;
      margin-bottom: auto;
      margin-right: -17px;
      margin-left: -4px;
      button.v-btn {
        height: 42px;
        width: 42px;
        .v-icon {
          padding-bottom: 2px;
          padding-left: 1px;
        }
      }
    }
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
      .v-input__append-inner {
        margin-right: -2px;
        margin-top: auto;
        margin-bottom: auto;
        button.v-btn {
          border-radius: 0px 10px 0px 0px;
        }
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
