let _Common_ = require('../common/Common.js')

class ValuesHandlerModule extends _Common_ {
  constructor() {
    super();
  }

  initialization() {
    super.initialization();
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  handle(data, User, isParseRewardsScreen = true, type = 'regular') {
    // если isParseRewardsScreen - то добавится в Add, иначе изменится сразу счетчик

    if (!_.isArray(data)) {
      InformManager.error(`${this.constructor.name}.handle`, undefined, new Error('Only an Array.'));
      return false;
    }

    if (_.isEmpty(data)) { return true;  }
    if (_.isNil(User) )  { return false; }

    data = _.groupBy(data, (_data) => isParseRewardsScreen ? 'screen' : 'now');

    if (_.isExist(data.now))    { this._change(data.now,      User); }
    if (_.isExist(data.screen)) { User.addReward(data.screen, type); }
  }

  _change(data, User) {
    for (let keyOfData = 0; keyOfData < data.length; keyOfData++) {
      let _data = data[keyOfData];

      let [path, value] = this._getPathAndValue(_data.type, User);

      if (_.isNil(path) || _.isNil(value)) { continue; }

      if (_.isExist(_data.change)) { value += _data.change; }
      if (_.isExist(_data.set))    { value  = _data.set;    }

      User.set_state(_.setWith({}, path, value))
    }
  }

  /*****/

  check(data, User) {
    if (!_.isArray(data)) {
      InformManager.error(`${this.constructor.name}.check`, undefined, new Error('Only an Array.'));
      return false;
    }

    if (_.isEmpty(data)) { return true;  }
    if (_.isNil(User) )  { return false; }

    // [
    //   [
    //     {"type": "crystals", "moreEqual": 500},     &&
    //     {"type": "coins",    "moreEqual": 400}      &&
    //   ], [                                          ||
    //     {"type": "crystals", "moreEqual": 400},     &&
    //     {"type": "coins",    "moreEqual": 500}      &&
    //   ]
    // ]

    if (!_.isArray(data[0])) { data = [data]; }

    return _.some(data, (_or) => {
      return _.every(_or, (_and) => {
        return this._checkDemand(_and, User);
      });
    });
  }

  _checkDemand(demand, User) {
    let [path, value] = this._getPathAndValue(demand.type, User);

    // if (_.isNil(path) || _.isNil(value)) { return false; }
    if (_.isNil(value)) { return false; }

    // if (demand.type.search('quest:') == 0 && demand.type.search(':completed') > 0) { return (value == 'c') == demand.value; }

    if (_.isExist(demand.lessEqual)) { return value <= demand.lessEqual; }
    if (_.isExist(demand.less))      { return value <  demand.less;      }
    if (_.isExist(demand.equal))     { return value == demand.equal;     }
    if (_.isExist(demand.value))     { return value == demand.value;     }
    if (_.isExist(demand.more))      { return value >  demand.more;      }
    if (_.isExist(demand.moreEqual)) { return value >= demand.moreEqual; }

    return false;
  }

  /*****/

  getValue(type, User) {
    let [path, value] =  this._getPathAndValue(type, User);
    // if (_.isNil(path) || _.isNil(value)) { return null; }
    if (_.isNil(value)) { return null; }
    return value;
  }

  /*****/

  rename(object, name = 'value', multiply = 1) {
    return _.chain(object)
            .cloneDeep()
            .map((_object) => {
              if (_.isExist(_object.lessEqual) && name != 'lessEqual') { _object[name] = Math.abs(_object.lessEqual) * multiply; delete _object.lessEqual; return _object; }
              if (_.isExist(_object.less)      && name != 'less'     ) { _object[name] = Math.abs(_object.less)      * multiply; delete _object.less;      return _object; }
              if (_.isExist(_object.equal)     && name != 'equal'    ) { _object[name] = Math.abs(_object.equal)     * multiply; delete _object.equal;     return _object; }
              if (_.isExist(_object.value)     && name != 'value'    ) { _object[name] = Math.abs(_object.value)     * multiply; delete _object.value;     return _object; }
              if (_.isExist(_object.more)      && name != 'more'     ) { _object[name] = Math.abs(_object.more)      * multiply; delete _object.more;      return _object; }
              if (_.isExist(_object.moreEqual) && name != 'moreEqual') { _object[name] = Math.abs(_object.moreEqual) * multiply; delete _object.moreEqual; return _object; }
              if (_.isExist(_object.change)    && name != 'change'   ) { _object[name] = Math.abs(_object.change)    * multiply; delete _object.change;    return _object; }
              if (_.isExist(_object.set)       && name != 'set'      ) { _object[name] = Math.abs(_object.set)       * multiply; delete _object.set;       return _object; }
              return _object;
            }).value();
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  _getPathAndValue(type, User) {
    let value = null;

    // обычные
    if (_.isExist(User.Resources[type])) { return [`resources.${type}`, User.Resources[type]]; }
    if (_.isExist(User.Counters[type]))  { return [`counters.${type}`,  User.Counters[type]];  }

    // особые
    if (type.search('quest:') == 0) {
      if (type.search(':completed') > 0) {
        let questID = type.replace('quest:', '').replace(':completed', '');
        if (_.isExist(User.Quests[questID])) { return [`quests.${questID}.status`, User.Quests[questID].isCompleted]; }
      }
      if (type.search(':active') > 0) {
        let questID = type.replace('quest:', '').replace(':active', '');
        if (_.isExist(User.Quests[questID])) { return [`quests.${questID}.status`, User.Quests[questID].isActive]; }
      }
      if (type.search(':endLifeTime') > 0) {
        let questID = type.replace('quest:', '').replace(':endLifeTime', '');
        if (_.isExist(User.Quests[questID])) { return [`quests.${questID}.status`, User.Quests[questID].isEndLifeTime]; }
      }
      if (type.search(':actionsStartedNumber') > 0) {
        let questID = type.replace('quest:', '').replace(':actionsStartedNumber', '');
        if (_.isExist(User.Quests[questID])) { return [`quests.${questID}.actionsStartedNumber`, User.Quests[questID].actionsStartedNumber]; }
      }
      if (type.search(':isActiveInQuestPanel') > 0) {
        let questID = type.replace('quest:', '').replace(':isActiveInQuestPanel', '');
        if (_.isExist(User.Quests[questID])) { return [`quests.${questID}.isActiveInQuestPanel`, User.Quests[questID].isActiveInQuestPanel]; }
      }
    }

    if (type.search('character:') == 0) {
      if (type.search(':isHas') > 0) {
        let characterID = type.replace('character:', '').replace(':isHas', '')
        if (_.isExist(User.Characters[characterID])) { return [`characters.${characterID}.isHas`, User.Characters[characterID].isHas]; }
      }
      if (type.search(':duplicates') > 0) {
        let characterID = type.replace('character:', '').replace(':duplicates', '')
        if (_.isExist(User.Characters[characterID])) { return [`characters.${characterID}.duplicates`, User.Characters[characterID].duplicates]; }
      }
      if (type.search(':awakening') > 0) {
        let characterID = type.replace('character:', '').replace(':awakening', '')
        if (_.isExist(User.Characters[characterID])) { return [`characters.${characterID}.awakening`, User.Characters[characterID].awakening]; }
      }
      if (type.search(':level') > 0) {
        let characterID = type.replace('character:', '').replace(':level', '')
        if (_.isExist(User.Characters[characterID])) { return [`characters.${characterID}.level`, User.Characters[characterID].level]; }
      }
    }

    if (type.search('weapon:') == 0) {
      if (type.search(':isHas') > 0) {
        let weaponID = type.replace('weapon:', '').replace(':isHas', '')
        if (_.isExist(User.Weapons[weaponID])) { return [`weapons.${weaponID}.isHas`, User.Weapons[weaponID].isHas]; }
      }
      if (type.search(':duplicates') > 0) {
        let weaponID = type.replace('weapon:', '').replace(':duplicates', '')
        if (_.isExist(User.Weapons[weaponID])) { return [`weapons.${weaponID}.duplicates`, User.Weapons[weaponID].duplicates]; }
      }
      if (type.search(':awakening') > 0) {
        let weaponID = type.replace('weapon:', '').replace(':awakening', '')
        if (_.isExist(User.Weapons[weaponID])) { return [`weapons.${weaponID}.awakening`, User.Weapons[weaponID].awakening]; }
      }
      if (type.search(':level') > 0) {
        let weaponID = type.replace('weapon:', '').replace(':level', '')
        if (_.isExist(User.Weapons[weaponID])) { return [`weapons.${weaponID}.level`, User.Weapons[weaponID].level]; }
      }
    }

    if (type.search('ammunition:') == 0) {
      if (type.search(':isHas') > 0) {
        let ammunitionID = type.replace('ammunition:', '').replace(':isHas', '')
        if (_.isExist(User.Ammunitions[ammunitionID])) { return [`ammunitions.${ammunitionID}.isHas`, User.Ammunitions[ammunitionID].isHas]; }
      }
      if (type.search(':duplicates') > 0) {
        let ammunitionID = type.replace('ammunition:', '').replace(':duplicates', '')
        if (_.isExist(User.Ammunitions[ammunitionID])) { return [`ammunitions.${ammunitionID}.duplicates`, User.Ammunitions[ammunitionID].duplicates]; }
      }
      if (type.search(':awakening') > 0) {
        let ammunitionID = type.replace('ammunition:', '').replace(':awakening', '')
        if (_.isExist(User.Ammunitions[ammunitionID])) { return [`ammunitions.${ammunitionID}.awakening`, User.Ammunitions[ammunitionID].awakening]; }
      }
      if (type.search(':level') > 0) {
        let ammunitionID = type.replace('ammunition:', '').replace(':level', '')
        if (_.isExist(User.Ammunitions[ammunitionID])) { return [`ammunitions.${ammunitionID}.level`, User.Ammunitions[ammunitionID].level]; }
      }
    }

    if (type.search('chest:') == 0) {
      if (type.search(':open') > 0) {
        let chestID = type.replace('chest:', '').replace(':open', '')
        if (_.isExist(User.Chests[chestID])) { return [`chests.${chestID}.open`, User.Chests[chestID].open]; }
      }
    }

    if (type == 'locationLast:zone') { return [undefined, _.find(User.Locations, (Location) => Location.isLast).zone]; }

    if (type == 'characters_unique') { return [undefined, _.chain(User.team).compact().size().value()]; }

    InformManager.information(`Bad check!`, undefined, {type: type});

    // найти перебором
    let finding = (obj, path, type) => {
      let keys = Object.keys(obj);

      for (let keyOfKeys = 0; keyOfKeys < keys.length; keyOfKeys++) {
        let key = keys[keyOfKeys];
        let val = obj[key];

        if (key == type) {
          path.push(key);
          return [path, val];
        }

        if (_.isObject(val)) {
          let result = finding(val, _.chain(path).cloneDeep().concat([key]).value(), type);
          if (_.isExist(result)) { return result; }
        }
      }
    }

    value = finding(this._getState(User), [], type);
    if (_.isExist(value)) {
      value[0] = value[0].join('.');
      return value;
    }

    return [undefined, undefined];
  }

  _getState(User) {
    if (_.isNil(User) || _.isNil(User.get_state)) { return {}; }

    return User.get_state();
  }
}

module.exports = new ValuesHandlerModule;
