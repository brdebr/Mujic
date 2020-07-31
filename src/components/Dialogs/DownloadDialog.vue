<template>
  <v-dialog :value="value">
    <v-card>
      <v-card-title>
        Download from Youtube as MP3
        <v-btn @click="inputShaped = !inputShaped">
          aa
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-card-text class="pt-5">
        <v-row no-gutters class="flex-wrap">
          <v-col cols="12">
            <v-text-field
              v-model="videoUrl"
              label="Video URL"
              messages="lorem impsum"
              class="field-fix-prepend-inner"
              :hide-details="inputShaped"
              outlined
              :rounded="!inputShaped"
              :shaped="inputShaped"
              prepend-inner-icon="fas fa-external-link-alt"
              append-icon="fas fa-download"
            />
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

@Component({})
export default class DownloadDialog extends Vue {
  @Prop()
  value!: boolean;

  @Watch("videoUrl")
  test() {
    const videoo = "https://www.youtube.com/watch?v=NpkDLCo8O8k";
    const uu = new URL("https://www.youtube.com/watch?v=NpkDLCo8O8k");
    console.log(uu.searchParams.get("v"));
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
