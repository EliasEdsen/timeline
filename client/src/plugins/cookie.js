export default {
  install(app, options) {
    this.app     = app;
    this.options = options;

    app.config.globalProperties.$cookie     = {};
    app.config.globalProperties.$cookie.get = this.get.bind(this);
    app.config.globalProperties.$cookie.has = this.has.bind(this);
  },

  get(key) { return           _.chain(document.cookie).split('; ').map((val) => val.split('=')).fromPairs().value()[key];  },
  has(key) { return _.isExist(_.chain(document.cookie).split('; ').map((val) => val.split('=')).fromPairs().value()[key]); },
}
