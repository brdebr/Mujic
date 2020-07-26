<template>
  <v-card tile style="position: fixed; bottom: 0; width: calc(100% - 80px);">
    <v-progress-linear
      color="indigo darken-4"
      :value="50"
      striped
      class="my-0"
      height="10"
    />
    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>The Walker</v-list-item-title>
          <v-list-item-subtitle>Fitz & The Trantrums</v-list-item-subtitle>
        </v-list-item-content>
        <v-spacer />
        <v-list-item-icon>
          <v-btn outlined icon>
            <v-icon small>fas fa-fast-backward</v-icon>
          </v-btn>
        </v-list-item-icon>
        <v-list-item-icon :class="{ 'mx-5': $vuetify.breakpoint.mdAndUp }">
          <v-btn outlined icon>
            <v-icon small>fas fa-pause</v-icon>
          </v-btn>
        </v-list-item-icon>
        <v-list-item-icon class="ml-0">
          <v-btn outlined icon>
            <v-icon small>fas fa-fast-forward</v-icon>
          </v-btn>
        </v-list-item-icon>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({})
export default class extends Vue {}
</script>

<style></style>
