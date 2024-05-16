const { compact } = require('lodash');
const { SchemaTextFieldPhonetics } = require('redis');
let _Common_ = require('./Common.js')

class CommonModel extends _Common_ {
  constructor(RTI = {}, state = {}, parameters = {}) {
    super()

    this.setRTI(RTI);
    // this.setState({});

    this.setData(parameters);
    this.setTemp(parameters);
    this.setContent(parameters);
    this.setCallbacks(parameters);
    // this.setAnotherModels(parameters);
    this.setModels(parameters);

    this.createProperties(state);

    this.set_stage_links();

    this.resetState(state);
  }

  createProperties(state) { }

  initialization() { }

  /*****/     /*****/     /*****/

  setRTI(RTI) { this.RTI = RTI; }
  // setState(state) { this.state  = state;  }

  setData(parameters) { if (parameters.hasOwnProperty('data')) { this.data = parameters.data; } else { this.data = {}; } }
  setTemp(parameters) { if (parameters.hasOwnProperty('temp')) { this.temp = parameters.temp; } else { this.temp = {}; } }
  setContent(parameters) { if (parameters.hasOwnProperty('content')) { this.content = parameters.content; } else { this.content = {}; } }
  setCallbacks(parameters) { if (parameters.hasOwnProperty('callbacks')) { this.callbacks = parameters.callbacks; } else { this.callbacks = {}; } }
  // setAnotherModels(parameters) { if (parameters.hasOwnProperty('Models'))    { this.Models    = parameters.Models;    } else { this.Models    = {}; } }
  setModels(parameters) {
    if (parameters.hasOwnProperty('Models')) {
      for (let keyOfModel = 0; keyOfModel < Models.length; keyOfModel++) {
        let Model = Models[keyOfModel];
        this[Model.constructor.name] = Model;
      }
    }
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  // pre_stage(stage = {}) { }

  // default_stage(stage = {}) { }

  // set_stage(stage = {}) {
  //   let stage_keys = Object.keys(stage);

  //   for (let indexOfKeys = 0; indexOfKeys < stage_keys.length; indexOfKeys++) {
  //     let key  = stage_keys[indexOfKeys];
  //     let val  = stage[key];
  //     let name = this.stageLinks[key];

  //     if (!_.isExist(name)) { continue; }

  //     this.set_state({[name]: val})
  //   }
  // }

  // override_stage(stage = {}) { }

  // get_stage() {
  //   let stage = {};

  //   let links = Object.keys(this.stageLinks);

  //   for (let indexOfLinks = 0; indexOfLinks < links.length; indexOfLinks++) {
  //     let link  = links[indexOfLinks];
  //     let name  = this.stageLinks[link];

  //     stage[link] = this[name];
  //   }

  //   return stage;
  // }

  set_stage_links(stageLinks = {}) { this.stageLinks = stageLinks; }

  get_stage() { // отдать стейт
    let lookingFor = (val) => {
      if (_.isExist(val) && _.isExist(val.get_stage)) { return val.get_stage(); }

      if (_.isArray(val)) { return _.map(val, (v) => { return lookingFor(v); }); }
      if (_.isPlainObject(val)) { return _.mapValues(val, (v) => { return lookingFor(v); }); }

      return val;
    }

    let stage = {};

    let keys = Object.keys(this.state);

    for (let keyOfKeys = 0; keyOfKeys < keys.length; keyOfKeys++) {
      let key = keys[keyOfKeys];
      let val = this.state[key];

      key = I18NManager.toLowerFirstLatter(key);
      let keyLink = _.findKey(this.stageLinks, ((val) => { return val == key; }))
      if (!_.isExist(keyLink)) { continue; }
      stage[keyLink] = lookingFor(val);
      // val = lookingFor(val)
      // if (val) { stage[keyLink] = val; }
    }

    /***/

    // let recursion = (_stage) => {
    //   let keys = Object.keys(_stage)

    //   for (let keyOfKeys = 0; keyOfKeys < keys.length; keyOfKeys++) {
    //     let key = keys[keyOfKeys];
    //     let val = _stage[key];
    //     if (_.isObject(val)) { val = recursion(val); }
    //     if ((_.isObject(val) && _.isEmpty(val)) || _.isNil(val) || !val ) { delete _stage[key]; }
    //   }

    //   return _stage;
    // }

    // stage = recursion(stage);

    return _.cloneDeep(stage);
  }

  // remove_stage() { this.setStage({}); }

  /*****/     /*****/     /*****/

  resetState(state) {
    this.remove_state(state);
    this.pre_state(state);
    this.default_state(state);
    this.set_state(state);
    this.override_state(state);
  }

  // remove_state() { this.setState({}); } // удалить стейт
  remove_state(state) { this.state = {}; } // удалить стейт

  pre_state(state = {}) { }

  default_state(state = {}) { } // значения по умолчанию

  set_state(state = {}) { // перезапись стейта с изменениями View
    let keys = Object.keys(state);

    for (let keyOfKeys = 0; keyOfKeys < keys.length; keyOfKeys++) {
      let key = keys[keyOfKeys];
      let val = state[key];

      if (_.isExist(this.stageLinks[key])) {
        key = this.stageLinks[key];
      }

      this[key] = val;
    }
  }

  override_state(state = {}) { } // перезапись значений по умолчанию

  get_state() { // отдать стейт
    let lookingFor = (val) => {
      if (_.isExist(val) && _.isExist(val.get_state)) { return val.get_state(); }

      if (_.isArray(val)) { return _.map(val, (v) => { return lookingFor(v); }); }
      if (_.isPlainObject(val)) { return _.mapValues(val, (v) => { return lookingFor(v); }); }

      return val;
    }

    let state = {};

    let keys = Object.keys(this.state);

    for (let keyOfKeys = 0; keyOfKeys < keys.length; keyOfKeys++) {
      let key = keys[keyOfKeys];
      let val = this.state[key];

      key = I18NManager.toLowerFirstLatter(key);
      state[key] = lookingFor(val);
    }

    return _.cloneDeep(state);
  }

  /*****/     /*****/     /*****/
}

module.exports = CommonModel;
