let _Common_ = require('../common/Common.js')

class ContentsManager extends _Common_ {
  constructor() {
    super()

    this.setContents()
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  setContents() {
    this.contents = {};

    let pathContents = './src/resources/contents/'

    let paths = fs.readdirSync(pathContents, 'utf8');

    _.each(paths, (path) => {
      if (path.search('.json') == -1) { return; }
      let name = path.replace('.json', '')
      let rawdata = fs.readFileSync(`${pathContents}${path}`);
      this.contents[name] = JSON.parse(rawdata);
    })

    this.contents.informations.admins_id = global.config.admins_id;
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  getState(url = 'all') {
    let names = [];

    switch (url) {
      case 'all': names = ['informations']; break;
    }

    let contents = {};

    for (let i = 0; i < names.length; i++) {
      let name = names[i];
      contents[name] = this.contents[name];
    }

    return contents;
  }

  /*****/     /*****/     /*****/     /*****/     /*****/
}

module.exports = new ContentsManager;
