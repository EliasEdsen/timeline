let _Common_ = require('../common/Common.js')

class Managers extends _Common_ {
  constructor() {
    super()

    global.ContentsManager       = require('./ContentsManager.js')
    global.EventManager          = require('./EventManager.js')
    global.I18NManager           = require('./I18NManager.js')
    global.InformManager         = require('./InformManager.js')
    global.ManifestManager       = require('./ManifestManager.js')
    global.POSTGRESManager       = require('./POSTGRESManager.js')
    global.REDISManager          = require('./REDISManager.js')
    global.CookieManager         = require('./CookieManager.js')

    global.RequestHandlerManager = require('./requestHandler/RequestHandlerManager.js')
    global.ResponseManager       = require('./requestHandler/ResponseManager.js')
    global.RouterManager         = require('./requestHandler/RouterManager.js')
    global.RTIManager            = require('./requestHandler/RTIManager.js')
    global.SendManager           = require('./requestHandler/SendManager.js')
  }
}

module.exports = new Managers;
