<template>
  <v-navigation-drawer
    :mini-variant="$store.state.layout.drawerMini"
    mini-variant-width="80"
    :value="$store.state.layout.drawer"
    clipped
    stateless
    :mobile-breakpoint="950"
    class="drawer-border"
    fixed
    app
    @input="val => $store.commit('layout/setDrawer', val)"
  >
    <v-layout column justify-space-between fill-height>
      <v-list :shaped="!$store.state.layout.drawerMini">
        <v-list-item
          class="amber darken-2 drawer-header"
          :style="{
            transition: 'margin .18s linear',
            marginRight: $store.state.layout.drawerMini ? null : '8px'
          }"
          dark
        >
          <span
            v-if="!$store.state.layout.drawerMini"
            class="font-weight-bold d-inline-block text-truncate text-center"
          >
            Folders
          </span>
          <v-icon class="ml-3 mr-auto" v-else>
            fas fa-folder
          </v-icon>
        </v-list-item>
      </v-list>
      <v-spacer />
      <div
        :class="`${$store.state.layout.drawerMini ? 'mx-auto' : 'mx-3'} mb-3`"
      >
        <SettingsDialog />
      </div>
    </v-layout>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from "vue";
import SettingsDialog from "@/components/Dialogs/SettingsDialog.vue";

export default Vue.extend({
  components: {
    SettingsDialog
  }
});
</script>
<style lang="scss" scoped>
div.v-list-item.drawer-header {
  border-bottom-right-radius: 0 !important;
  border-top-right-radius: 0 !important;
  margin-right: -8px;
  margin-bottom: 8px;
}
.drawer-border {
  border-right: 3px solid #e65100;
}
</style>
