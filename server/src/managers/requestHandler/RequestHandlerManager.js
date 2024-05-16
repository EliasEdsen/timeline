let _Common_ = require('../../common/Common.js')

class RequestHandlerManager extends _Common_ {
  constructor() {
    super();
  }

  regular(req, res) {
    return RTIManager.regular(req, res, (RTI) => {
      if (_.isExist(RTI.error)) { return SendManager.call(RTI); }

      return RouterManager.call(RTI, (RTI) => {
        if (_.isExist(RTI.error)) { return SendManager.call(RTI); } // смешно, но пусть будет, типа ненужная проверка на ошибку

        return SendManager.call(RTI);
      });
    });
  }
}

module.exports = new RequestHandlerManager;
