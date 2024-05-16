let _Common_ = require('../../../common/Common.js');

class ChangePoint extends _Common_ {
  constructor() {
    super();
  }

  call(RTI, next) {
    return this.start(RTI, next);
  }

  start(RTI, next) {
    let id          = RTI.body.id;
    let date        = RTI.body.date;
    let time        = RTI.body.time;
    let description = RTI.body.description;
    let url         = RTI.body.url;
    let tags        = RTI.body.tags;

    if (_.isNil(id))          { /* InformManager.notification(RTI, 1012); */ return next(RTI); }
    if (_.isNil(date))        { /* InformManager.notification(RTI, 1012); */ return next(RTI); }
    if (_.isNil(description)) { /* InformManager.notification(RTI, 1012); */ return next(RTI); }
    if (_.isNil(url))         { /* InformManager.notification(RTI, 1012); */ return next(RTI); }
    if (_.isNil(tags))        { /* InformManager.notification(RTI, 1012); */ return next(RTI); }

    return UserController.find(RTI, (error, RTI) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.find`, undefined, error);
          ResponseManager.error(RTI, error);
        }
        return next(RTI);
      }

      if (_.isNil(time)) { time = '00:00' }

      return POSTGRESManager.select_stage(RTI, ['*'], 'points', {id: id}, ['LIMIT 1'], (error, rows) => {
        if (error) {
          if (_.isError(error)) {
            error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.point`, undefined, error);
            ResponseManager.error(RTI, error);
          }
          return next(RTI);
        }

        let point = rows[0];

        return async.parallel([
          (callback) => { return this.description(RTI, point.description_id, description, callback); },
          (callback) => { return this.url        (RTI, point.url_id,         url,         callback); },
          (callback) => { return this.timestamp  (RTI, point.id, date,       time,        callback); },
          (callback) => { return this.tags       (RTI, point.id,             tags,        callback); }
        ], (error, results) => {
          if (error) {
            if (_.isError(error)) {
              error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.info`, undefined, error);
              ResponseManager.error(RTI, error);
            }
            return next(RTI);
          }

          ResponseManager.add(RTI, {point: {id: point.id}})

          return next(RTI);
        });
      });
    });
  }

  description(RTI, id, description, callback) {
    return POSTGRESManager.update_stage(RTI, description, 'descriptions', {id: id}, undefined, callback);
  }

  url(RTI, id, url, callback) {
    return POSTGRESManager.update_stage(RTI, url, 'urls', {id: id}, undefined, callback);
  }

  timestamp(RTI, id, date, time, callback) {
    let timestamp = DateModule.timestamp(`${date} ${time}+00:00`, 'YYYY-MM-DD HH:mmZ');
    return POSTGRESManager.update_stage(RTI, {timestamp: timestamp}, 'points', {id: id}, undefined, callback);
  }

  tags(RTI, point_id, tags, callback) {
    let tagsSelect = (callback1) => {
      if (_.isNil(tags) || _.isEmpty(tags)) { return callback1(); }

      let text   = '';
      let atrs   = 1;
      let values = [];
      text      += `SELECT * FROM tags WHERE ${RTI.User.languages[0]} IN (`

      for (let i = 0; i < tags.length; i++) {
        let tag = tags[i];
        text += `$${atrs}`;
        if (i < tags.length - 1) { text += `, `; }
        atrs += 1
        values.push(tag);
      }

      text += ');'

      return POSTGRESManager.self_stage(RTI, text, values, callback1);
    }

    let tagsUpdate = (rows, callback2) => {
      let tagsOldWithID = rows
      let tagsOldKeyBy  = _.keyBy(tagsOldWithID, RTI.User.languages[0])
      let tagsOld       = _.map(tagsOldWithID, RTI.User.languages[0])
      let tagsNew       = _.difference(tags, tagsOld);

      let updateTags = (tagsWithID) => {
        let tagsID = _.map(tags, (tag) => { return tagsWithID[tag].id; });
        return POSTGRESManager.update_stage(RTI, {tags_id: tagsID}, 'points', {id: point_id}, undefined, callback2);
      }

      if (!_.isEmpty(tagsNew)) {
        let text   = '';
        let atrs   = 1;
        let values = [];

        text += `INSERT INTO tags (${RTI.User.languages[0]}) VALUES `;

        for (let i = 0; i < tagsNew.length; i++) {
          let tagNew = tagsNew[i];
          text += `($${atrs})`;
          if (i < tagsNew.length - 1) { text += `, `; }
          atrs += 1;
          values.push(tagNew);
        }

        text += ' RETURNING *;'

        return POSTGRESManager.self_stage(RTI, text, values, (error, rows) => {
          if (error) { return callback2(error); }

          let tagsNewWithID = rows
          let tagsNewKeyBy  = _.keyBy(tagsNewWithID, RTI.User.languages[0])
          let tagsNew       = _.map(tagsNewWithID, RTI.User.languages[0])

          return updateTags(_.extend({}, tagsOldKeyBy, tagsNewKeyBy));
        });
      } else {
        return updateTags(_.extend({}, tagsOldKeyBy));
      }
    }

    return tagsSelect((error, rows) => {
      if (error) { return callback(error); }

      return tagsUpdate(rows, callback);
    });
  }
}

module.exports = ChangePoint;
