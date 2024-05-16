export default {
  install(app, options) {
    this.app     = app;
    this.options = options;

    app.config.globalProperties.$translate = this.translate.bind(this);
  },

  translate(key) {
    return key.split('.').reduce((o, i) => {
      if (o) return o[i]
    }, this.options) || key
  },
}
