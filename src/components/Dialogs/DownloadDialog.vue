<template>
  <v-dialog :value="value" max-width="1150px">
    <v-card>
      <v-card-title>
        Download from Youtube as MP3
        <v-btn @click="inputShaped = !inputShaped">
          aa
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-progress-linear
        v-if="!!videoObj.title"
        :value="progress"
        color="red darken-2"
        height="8"
      />
      <v-card-text class="pt-5">
        <v-row no-gutters class="flex-wrap">
          <v-col cols="12">
            <v-text-field
              v-model="videoUrl"
              label="Video URL"
              messages="lorem impsum"
              class="field-fix-prepend-inner"
              :hide-details="true"
              outlined
              :rounded="!inputShaped"
              :shaped="!!videoObj.title"
              prepend-inner-icon="fas fa-external-link-alt"
              append-icon="fas fa-download"
              @click:append="test"
            />
          </v-col>
          <v-col cols="12" v-if="videoObj.title">
            <v-card class="video-prev">
              <v-img
                class="white--text align-end"
                height="240px"
                :src="videoObj.imageUrl"
              >
                <v-card-title class="bg-above-img-1 py-3 px-5">
                  <div>
                    {{ videoObj.title }}
                  </div>
                  <div class="ml-auto">
                    <v-icon color="red accent-4">
                      fab fa-youtube
                    </v-icon>
                  </div>
                </v-card-title>
                <v-card-text class="bg-above-img-2 pt-3">
                  {{ videoObj.description }}
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

import axios from "axios";

interface VideoObj {
  title: string;
  imageUrl: string;
  description: string;
}

@Component({})
export default class DownloadDialog extends Vue {
  @Prop()
  value!: boolean;

  videoObj: VideoObj = {
    title: "",
    imageUrl: "",
    description: ""
  };

  progress = 0;

  async test() {
    await this.fetchPreview();
    ipcRenderer.send(IpcEventNames.downloadYT, this.videoUrl);
  }

  mounted() {
    ipcRenderer.on("download-progress", (event, arg) => {
      this.progress = arg;
      console.log(arg);
    });
  }

  destroyed() {
    ipcRenderer.removeAllListeners("download-progress");
  }

  async fetchPreview() {
    // const folderPath = await ipcRenderer.invoke(
    //   IpcEventNames.downloadYT,
    //   this.videoUrl
    // );

    const resp = await axios.get(this.videoUrl);
    if (resp.status == 200) {
      const previewPageHTML = resp.data;

      const doc = new DOMParser().parseFromString(previewPageHTML, "text/html");

      this.videoObj.title =
        doc
          .querySelector('meta[property="og:title"]')
          ?.attributes?.getNamedItem("content")?.value || "";

      this.videoObj.imageUrl =
        doc
          .querySelector('meta[property="og:image"]')
          ?.attributes?.getNamedItem("content")?.value || "";

      this.videoObj.description =
        doc
          .querySelector('meta[property="og:description"]')
          ?.attributes?.getNamedItem("content")?.value || "";
    }
  }

  inputShaped = false;
  videoUrl = "";
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
