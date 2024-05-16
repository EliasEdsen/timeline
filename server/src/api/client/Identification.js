let _Common_ = require('../../common/Common.js');

class Identification extends _Common_ {
  constructor() {
    super();
  }

  call(RTI, next) {
    return this.start(RTI, next);
  }

  start(RTI, next) {
    let version = RTI.body.version;

    if (_.isNil(version)) {
      // InformManager.notification(RTI, 1012); // Недостаточно данных
      return next(RTI);
    }

    return UserController.findAndCreate(RTI, (error, RTI) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.start`, undefined, error);
          ResponseManager.error(RTI, error);
        }
        return next(RTI);
      }

      return UserController.save(RTI, (error, RTI, rows) => {
        if (error) {
          if (_.isError(error)) {
            error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.save`, undefined, error);
            ResponseManager.error(RTI, error);
          }
        }

        this.add(RTI);
        return next(RTI);
      });
    });
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  add(RTI) {
    this.addUser(RTI);
    this.addManifest(RTI);
    this.addI18N(RTI);
    this.addContents(RTI);
  }

  addUser(RTI) {
    ResponseManager.add(RTI, {user: RTI.User.getIdentificationStage()});
  }

  addManifest(RTI) {
    let manifest = ManifestManager.get(RTI, RTI.User, RTI.body.version);
    ResponseManager.add(RTI, {manifest: {state: {manifest: manifest}}});
  }

  addI18N(RTI) {
    let language = 'en';
    if (RTI.hasOwnProperty('User')) { language = RTI.User.languages[0]; }
    ResponseManager.add(RTI, {i18n: I18NManager.getState(language)});
  }

  addContents(RTI) {
    ResponseManager.add(RTI, {contents: RTI.contents});
  }

  /*****/     /*****/     /*****/     /*****/     /*****/
}

module.exports = Identification;
