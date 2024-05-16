let _Common_ = require('../common/Common.js')

class DateModule extends _Common_ {
  time(time, format) {
    let moment = this.moment(time, format);
    return Number(moment.format('x'));
  }

  timestamp(time, format) {
    let moment = this.moment(time, format);
    return moment.format('YYYY-MM-DD HH:mm:ss.SSSSZ');
  }

  moment(time, format) {
    if (_.isNil(time))     { return moment().utc(); }
    if (_.isExist(format)) { return moment(time, format).utc(); }
    if (_.isExist(time))   {
      switch (time.constructor.name) {
        case 'Number': { return moment(time).utc(); }
        case 'String': { return moment(time).utc(); }
        case 'Moment': { return time;               }
        default:       { return moment().utc();     }
      }
    }

    return moment().utc();
  }
}

module.exports = new DateModule;
