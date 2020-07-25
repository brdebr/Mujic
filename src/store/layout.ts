import { VuexModule, Module, Mutation } from "vuex-module-decorators";

@Module({ namespaced: true, name: "layout" })
export default class LayoutStoreModule extends VuexModule {
  drawer = true;
  drawerMini = true;

  @Mutation
  toggleDrawer() {
    this.drawer = !this.drawer;
  }
  @Mutation
  toggleDrawerMini() {
    this.drawerMini = !this.drawerMini;
  }

  @Mutation
  setDrawer(val: boolean) {
    this.drawer = val;
  }
}
