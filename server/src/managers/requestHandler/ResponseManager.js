let _Common_ = require('../../common/Common.js')

class ResponseManager extends _Common_ {
  constructor() {
    super();
  }

  error(RTI, error) {
    if (!_.isExist(RTI.error)) { RTI.error = {errors: []}; }

    RTI.error.errors.push(error)
  }

  notification(RTI, notification) {
    let code      = notification.code;
    let text_data = notification.data;

    if (!_.isExist(RTI.result))               { RTI.result               = {}; }
    if (!_.isExist(RTI.result.notifications)) { RTI.result.notifications = []; }

    RTI.result.notifications.push({code: code, data: text_data});
  }

  add(RTI, response) {
    if (!_.isExist(RTI.result)) { RTI.result = {}; }

    _.extend(RTI.result, response)
  }

  addTrigger(RTI, trigger) {
    if (!_.isExist(RTI.result))          { RTI.result          = {}; }
    if (!_.isExist(RTI.result.triggers)) { RTI.result.triggers = []; }
    RTI.result.triggers.push(trigger);
    RTI.result.triggers = _.uniq(RTI.result.triggers);
  }

  file(RTI, file) {
    if (!_.isExist(RTI.result))      { RTI.result      = {}; }
    if (!_.isExist(RTI.result.file)) { RTI.result.file = file; }
  }
}

module.exports = new ResponseManager;
