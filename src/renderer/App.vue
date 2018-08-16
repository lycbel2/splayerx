<template>
  <div id="app" class="application"
       @mousedown.left.prevent="leftMouseDown"
       @mouseup.left.prevent="leftMouseUp"
       @mouseleave="mouseleaveHandler">
    <router-view></router-view>
    <!--lyctest-->
    <UpdaterProgressIndicator> </UpdaterProgressIndicator>
    <!--lyctest-->
      <UpdaterNotification></UpdaterNotification>
  </div>
</template>

<script>
  import UpdaterProgressIndicator from './components/UpdaterView/UpdaterProgressIndicator.vue';
  import UpdaterNotification from './components/UpdaterView/UpdaterNotification.vue';
  import DragHelperGetter from './helpers/DragHelper.js';
  export default {
    name: 'splayer',
    components: {
      UpdaterProgressIndicator,
      UpdaterNotification,
    },
    data() {
      return {
        mainWindow: null,
        dragHelper: null,
      };
    },
    methods: {
      mainCommitProxy(commitType, commitPayload) {
        this.$store.commit(commitType, commitPayload);
      },
      mainDispatchProxy(actionType, actionPayload) {
        this.$store.dispatch(actionType, actionPayload);
      },
      leftMouseDown() {
        this.dragHelper.down();
      },
      leftMouseUp() {
        this.dragHelper.up();
      },
      mouseleaveHandler() {
        this.dragHelper.leave();
      },
    },
    created() {
      this.mainWindow = this.$electron.remote.getCurrentWindow();
      this.dragHelper = new (DragHelperGetter())(this.mainWindow, this);
    },
    mounted() {
      /* eslint-disable no-unused-vars */
      this.$electron.ipcRenderer.on('mainCommit', (event, commitType, commitPayload) => {
        this.mainCommitProxy(commitType, commitPayload);
      });
      this.$electron.ipcRenderer.on('mainDispatch', (event, actionType, actionPayload) => {
        this.mainDispatchProxy(actionType, actionPayload);
      });
    },
  };
</script>

<style lang="scss">
// global scss
@import url('~@/css/style.scss');

</style>
