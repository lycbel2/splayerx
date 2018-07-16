<template>
    <div class="content">
        {{content}}
    </div>
</template>

<script>
  export default {
    name: 'UpdaterProgressIndicator',
    components: {
      //
    },
    data() {
      return {
        content: 'hello',
      };
    },
    mounted() {
      this.doSome();
      this.$electron.ipcRenderer.send('update-back', 'hello');
      this.$electron.ipcRenderer.on('update-message', (event, text) => {
        this.content += text;
      });
    },
    methods: {
      doSome() {
        this.content = 'dddd';
      },
    },
  };
</script>

<style lang="scss">
.content {
    position: absolute;
    width: 100px;
    height: 100px;
    z-index: 5;
    top: 0px;
    left: 0px;

}
</style>