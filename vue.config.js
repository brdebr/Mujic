module.exports = {
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      mainProcessWatch: ['src/main.ts', 'src/main/'],
      builderOptions: {
        win: {
          target: "portable",
          icon: "build/icon.ico"
        }
      }
    }
  },
  chainWebpack: config => {
    config.module.rule('eslint').use('eslint-loader').options({
      fix: true
    })
  }
};
