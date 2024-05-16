let _Common_ = require('../../common/Common.js')

let routers = {
  '/api/client/getPoints':      require('../../api/client/points/GetPoints.js'),
  '/api/client/removePoints':   require('../../api/client/points/RemovePoints.js'),
  '/api/client/createPoint':    require('../../api/client/points/CreatePoint.js'),
  '/api/client/changePoint':    require('../../api/client/points/ChangePoint.js'),
  '/api/client/removePoint':    require('../../api/client/points/RemovePoint.js'),

  '/api/client/getTags':        require('../../api/client/tags/GetTags.js'),
  '/api/client/renameTag':      require('../../api/client/tags/RenameTag.js'),
  '/api/client/removeTag':      require('../../api/client/tags/RemoveTag.js'),
  '/api/client/mergeTag':       require('../../api/client/tags/MergeTag.js'),

  '/api/client/identification': require('../../api/client/Identification'),
  '/api/client/registration':   require('../../api/client/Registration'),
  '/api/client/authentication': require('../../api/client/Authentication'),

  '/api/client/logout':         require('../../api/client/Logout'),
  '/api/client/changeProfile':  require('../../api/client/ChangeProfile'),
}

class RouterManager extends _Common_ {
  constructor() {
    super();

    this.setRouters();
  }

  call(RTI, next) {
    return this.route(RTI, next);
  }

  route(RTI, next) {
    if (!_.isExist(this.Routers[RTI.url])) {
      let error = InformManager.errorRTI(RTI, `${this.constructor.name}.route`, undefined, new Error(`No path: '${RTI.url}'.`), 404);
      ResponseManager.error(RTI, error);
      return next(RTI);
    }
    return this.Routers[RTI.url].call(RTI, (RTI) => {
      return next(RTI);
    });
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  setRouters() {
    this.Routers = {}

    _.each(routers, (Script, url) => {
      this.Routers[url] = new Script();
    })
  }
}

module.exports = new RouterManager;
