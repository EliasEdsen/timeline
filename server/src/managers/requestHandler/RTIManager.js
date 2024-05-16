let _Common_ = require('../../common/Common.js')

class RTIManager extends _Common_ {
  constructor() {
    super();
  }

  regular(req, res, next) {
    let RTI = this.getRTI();

    RTI.req = req;
    RTI.res = res;

    RTI.url = RTI.req.url.split('?')[0];

    return this.parseBody(RTI, (error, RTI) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.parseBody`, undefined, error);
          ResponseManager.error(RTI, error);
        }
        return next(RTI);
      }

      return this.parseCookie(RTI, (error, RTI) => {
        if (error) {
          if (_.isError(error)) {
            error = InformManager.errorRTI(RTI, `${this.constructor.name}.parseCookie`, undefined, error);
            ResponseManager.error(RTI, error);
          }
          return next(RTI);
        }

        return next(RTI);
      });
    });
  }

  parseBody(RTI, callback) {
    if (RTI.req.method == 'POST') {
      RTI.body = '';
      RTI.req.on('data', (body) => {
        RTI.body += body;

        if (RTI.body.length > 1e6) {
          InformManager.errorRTI(RTI, `${this.constructor.name}.parseBody.length`, undefined, new Error('Body is very long.'));
          RTI.req.connection.destroy();
          RTI = null
          return;
        }
      });

      RTI.req.on('end', () => {
        try {
          RTI.body = JSON.parse(RTI.body);
        } catch (error) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.parseBody.parse`, undefined, error);
          ResponseManager.error(RTI, error);
          return callback(error, RTI);
        }

        return callback(undefined, RTI)
      });
    }

    if (RTI.req.method == 'GET') {
      if (RTI.req.url.search('\\?') >= 0) {
        RTI.body = _.chain(RTI.req.url).split('?').drop().split('&').map((val) => val.split('=')).fromPairs().value()
      } else {
        RTI.body = {}
      }

      return callback(undefined, RTI)
    }
  }

  parseCookie(RTI, callback) {
    let cookie = RTI.req.headers.cookie;

    if (!_.isExist(cookie)) {
      RTI.cookies = {};
      return callback(undefined, RTI);
    }

    let cookies_spl = cookie.split('; ');
    let cookies     = {};

    for (let i = 0; i < cookies_spl.length; i++) {
      cookie = cookies_spl[i];
      let cookie_spl = cookie.split('=');
      cookies[cookie_spl[0]] = cookie_spl[1]
    }

    RTI.cookies = cookies

    return callback(undefined, RTI);
  }

  getRTI() {
    return {req: null, res: null, url: null, contents: null, User: null, body: null, cookies: null, statusCode: null, error: null, result: null};
  }
}

module.exports = new RTIManager;
