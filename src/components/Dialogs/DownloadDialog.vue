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
.field-fix-prepend-inner {
  &.v-input--is-label-active,
  &.v-input--is-focused {
    &.v-text-field--rounded {
      .v-input__slot {
        .v-input__prepend-inner {
          margin-right: 12px;
          margin-top: 14px;
        }
        fieldset {
          legend {
            width: 85px !important;
          }
        }
      }
      &.v-input--is-focused {
        .v-input__slot {
          fieldset {
            legend {
              width: 105px !important;
            }
          }
        }
        .v-text-field__slot {
          label {
            padding-left: 10px;
          }
        }
      }
    }
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
            width: 95px !important;
          }
        }
      }
      .v-text-field__slot {
        label {
          padding-left: 13px;
        }
      }
      &.v-input--is-focused {
        .v-input__slot {
          fieldset {
            legend {
              width: 110px !important;
            }
          }
        }
        .v-text-field__slot {
          label {
            padding-left: 13px;
          }
        }
      }
    }
  }
}
</style>
