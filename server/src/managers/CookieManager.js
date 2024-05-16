let _Common_ = require('../common/Common.js')

class CookieManager extends _Common_ {
  constructor() {
    super();
  }

  initialization() {
    super.initialization();
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  save(RTI, name, value, options = {}) {
    if (_.isNil(options.expires)) {
      let moment = DateModule.moment();
      moment.add(10, 'years');
      let x = moment.format('x');
      let date = new Date(Number(x));

      options.expires = date;
    }

    RTI.res.cookie(name, value, options);
  }

  delete(RTI, name) {
    RTI.res.clearCookie(name);
  }
}

module.exports = new CookieManager;
