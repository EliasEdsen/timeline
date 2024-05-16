let _Common_ = require('../common/Common.js')

class I18NManager extends _Common_ {
  constructor() {
    super()

    this.setI18N()
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  parsePath(path) {
    path = _.flattenDeep(path);

    let res = [];

    for (let i = 0; i < path.length; i++) {
      let _path = path[i];
      res = res.concat(_path.toString().split('.'))
    }

    return res.join('.');
  }

  vsprintf(text = '', data = []) {
    return vsprintf(text, data);
  }

  sprintf(text = '', object = {}) {
    return sprintf(text, object);
  }

  toLowerFirstLatter(text) { return text.slice(0, 1).toLowerCase() + text.slice(1); }

  /*****/     /*****/     /*****/     /*****/     /*****/

  setI18N() {
    this.i18n = {};

    let pathI18N = './src/resources/i18n/'

    let paths = fs.readdirSync(pathI18N, 'utf8');

    _.each(paths, (path) => {
      if (path.search('.json') == -1) { return; }
      let name = path.replace('.json', '')
      let rawdata = fs.readFileSync(`${pathI18N}${path}`);
      this.i18n[name] = JSON.parse(rawdata);
    })
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  get(lang = 'en', path, data) {
    // exs.:
    // (['locations', 1, 'name']) -> Город
    // (['locations.1.name'])     -> Город
    // ('locations.1.name')       -> Город

    if (_.isNil(data) && _.isString(path)) { path = [path]; }

    path = this.parsePath(path);

    let text = _.at(this.i18n, [`${lang}.${path}`])[0];

    if (!_.isExist(text)) { return path; }

    if (_.isExist(data)) {
      if (_.isString(data) || _.isNumber(data)) { data = [data]; }

      if (_.isArray(data))       { text = this.vsprintf(text, data); }
      if (_.isPlainObject(data)) { text = this.sprintf(text,  data); }
    }

    return text;
  }

  getState(lang = 'en') { return this.i18n[lang]; }

  /*****/     /*****/     /*****/     /*****/     /*****/
}

module.exports = new I18NManager;
