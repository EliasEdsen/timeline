let crypto = require('crypto');

let _CommonModel_ = require('../common/CommonModel.js');

class User extends _CommonModel_ {
  constructor(RTI, state, parameters) {
    super(RTI, state, parameters);

    this.setFirstStage();
  }

  createProperties(state) {
    super.createProperties(state);

    this.property('id',        { set: ((val) => this.set('id',        val, this.state)), get: (() => this.state.id)        });
    this.property('hashes',    { set: ((val) => this.set('hashes',    val, this.state)), get: (() => this.state.hashes)    });
    this.property('secure',    { set: ((val) => this.set('secure',    val, this.state)), get: (() => this.state.secure)    });
    this.property('name',      { set: ((val) => this.set('name',      val, this.state)), get: (() => this.state.name)      });
    this.property('email',     { set: ((val) => this.set('email',     val, this.state)), get: (() => this.state.email)     });
    this.property('password',  { set: ((val) => this.set('password',  val, this.state)), get: (() => this.state.password)  });
    this.property('languages', {
      get: (() => { return this.state.languages; }),

      set: ((languages) => {
        languages = _.intersection(languages, this.RTI.contents.informations.languages);
        if (_.isEmpty(languages)) { languages = [this.RTI.contents.informations.languages[0]]; }
        this.set('languages', languages, this.state)
      })
    });

    /*** Методы администратора ***/

    this.property('isAdmin', { get: (() => !_.chain([this.state.id, '*']).intersection(this.RTI.contents.informations.admins_id).isEmpty().value()) })
  }

  initialization() {
    super.initialization();
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  resetHash() {
    let hash = crypto.randomBytes(32).toString('hex');
    this.hashes = [hash];
  }

  resetSecure() {
    let secure = crypto.randomBytes(32).toString('hex');
    this.secure = secure;
  }

  resetLanguages() {
    let language = 'en';

    if (_.isExist(this.RTI.req) && _.isExist(this.RTI.req.headers) && _.isExist(this.RTI.req.headers['accept-language']) && _.isString(this.RTI.req.headers['accept-language'])) {
      language = this.RTI.req.headers['accept-language'];
      language = language.split(',')[0];
      language = language.split('-')[0];
    }

    if (!_.includes(this.RTI.contents.informations.languages, language)) { language = 'en'; }

    this.languages = [language];
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  set_stage_links(stageLinks = {}) {
    super.set_stage_links(_.extend(stageLinks, {id: 'id', hashes: 'hashes', secure: 'secure', name: 'name', email: 'email', password: 'password', languages: 'languages'}));
  }

  setFirstStage() { this.first_stage = this.get_stage(); }

  getIdentificationStage() {
    let stage = this.get_stage();
    delete stage.hashes;
    delete stage.secure;
    delete stage.password;
    return stage;
  }

  /*****/     /*****/     /*****/

  pre_state(state) {
    super.pre_state(state);
  }

  default_state(state) {
    super.default_state(state);

    this.state.id        = null;
    this.state.hashes    = null;
    this.state.secure    = null;
    this.state.name      = null;
    this.state.email     = null;
    this.state.password  = null;
    this.state.languages = null;
  }

  override_state(state) {
    super.override_state(state);

    if (_.isNil(this.state.hashes))    { this.resetHash();      }
    if (_.isNil(this.state.secure))    { this.resetSecure();    }
    if (_.isNil(this.state.languages)) { this.resetLanguages(); }
  }

  /*****/     /*****/     /*****/     /*****/     /*****/
}

module.exports = User;
