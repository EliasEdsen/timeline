let _Common_ = require('../common/Common.js')

class POSTGRESManager extends _Common_ {
  constructor() {
    super();
  }

  initialization() {
    super.initialization();
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  insert_stage(RTI, _stage = {}, _base = 'auto', _parameters = [], callback = () => {}) {
    if (_base == 'auto') { throw new Error('Auto-parse of bases by insert is not working.'); }

    let [keys, atrs, vals] = this.parse_stage(_stage);
    keys = keys.join(', ');
    atrs = atrs.join(', ');

    let base = _base;

    let parameters = _parameters.join(' ');

    let text = `INSERT INTO ${base} (${keys}) VALUES (${atrs})`;
    if (!_.isEmpty(parameters)) { text += ` ${parameters};` }
    text += `;`;

    let query = { text: text, values: vals };

    return POSTGRES
      .query(query)
      .then((result) => {                                      return callback(undefined, result.rows); })
      .catch((error) => { error.query = JSON.stringify(query); return callback(error);                  });
  }

  update_stage(RTI, _stage = {}, _base = 'auto', _where = {}, _parameters = [], callback = () => {}) {
    if (_base == 'auto') { throw new Error('Auto-parse of bases by update is not working.'); }

    let [keys_stage, atrs_stage, vals_stage] = this.parse_stage(_stage);
    let set   = _.chain().zip(keys_stage, atrs_stage).map((val) => _.join(val, ' = ')).join(', ').value();

    let [keys_where, atrs_where, vals_where] = this.parse_stage(_where, atrs_stage.length);
    let where = _.chain().zip(keys_where, atrs_where).map((val) => _.join(val, ' = ')).join(' AND ').value();

    let vals = _.concat(vals_stage, vals_where);

    let base = _base;

    let parameters = _parameters.join(' ');

    let text = `UPDATE ${base} SET ${set}`;
    if (!_.isEmpty(where))      { text += ` WHERE ${where}`; }
    if (!_.isEmpty(parameters)) { text += ` ${parameters}`;  }
    text += `;`;

    let query = { text: text, values: vals };

    return POSTGRES
      .query(query)
      .then((result) => {                                      return callback(undefined, result.rows); })
      .catch((error) => { error.query = JSON.stringify(query); return callback(error);                  });
  }

  select_stage(RTI, _select = ['*'], _base = 'auto', _where = {}, _parameters = [], callback = () => {}) {
    if (_base == 'auto') { throw new Error('Auto-parse of bases by select is not working.'); }

    let select = _select.join(', ');
    let base   = _base;

    let [keys, atrs, vals] = this.parse_stage(_where);
    let where = _.toPairs(_.zipObject(keys, atrs)).map((val) => { return val.join(' = '); }).join(' AND ');

    let parameters = _parameters.join(' ');

    let text = `SELECT ${select} FROM ${base}`;
    if (!_.isEmpty(where))      { text += ` WHERE ${where}`; }
    if (!_.isEmpty(parameters)) { text += ` ${parameters}`;  }
    text += `;`;

    let query = { text: text, values: vals };

    return POSTGRES
      .query(query)
      .then((result) => {                                      return callback(undefined, result.rows); })
      .catch((error) => { error.query = JSON.stringify(query); return callback(error);                  });
  }

  delete_stage(RTI, _base = 'auto', _where = {}, _parameters = [], callback = () => {}) {
    if (_base == 'auto') { throw new Error('Auto-parse of bases by select is not working.'); }

    let base = _base;

    let [keys, atrs, vals] = this.parse_stage(_where);
    let where = _.toPairs(_.zipObject(keys, atrs)).map((val) => { return val.join(' = '); }).join(' AND ');

    let parameters = _parameters.join(' ');

    let text = `DELETE FROM ${base}`;
    if (!_.isEmpty(where))      { text += ` WHERE ${where}`; }
    if (!_.isEmpty(parameters)) { text += ` ${parameters}`;  }
    text += `;`;

    let query = { text: text, values: vals };

    return POSTGRES
      .query(query)
      .then((result) => {                                      return callback(undefined, result.rows); })
      .catch((error) => { error.query = JSON.stringify(query); return callback(error);                  });
  }

  self_stage(RTI, text, values, callback = () => {}) {
    let query = { text: text, values: values };

    return POSTGRES
      .query(query)
      .then((result) => {                                      return callback(undefined, result.rows); })
      .catch((error) => { error.query = JSON.stringify(query); return callback(error);                  });
  }

  /*****/     /*****/     /*****/     /*****/     /*****/

  parse_stage(stage, offset = 0) {
    let stage_keys = Object.keys(stage);

    let keys = []; // ['id', 'hash', 'dreg', 'land' ... ]
    let atrs = []; // ['$1', '$2', '$3', '$4' ... ]
    let vals = []; // [1, {aaa,bbb,ccc}, timestamp, 'ru' ... ]

    for (let indexOfKeys = 0; indexOfKeys < stage_keys.length; indexOfKeys++) {
      let key   = stage_keys[indexOfKeys];
      let val   = stage[key];

      keys.push(key);
      atrs.push(`$${offset + indexOfKeys + 1}`);

      if (_.isPlainObject(val)) {
        vals.push(val); // TODO
      } else if (_.isArray(val)) {
        vals.push(`{${val.join(', ')}}`);
      } else {
        vals.push(val);
      }
    }

    return [keys, atrs, vals];
  }
}

module.exports = new POSTGRESManager;
