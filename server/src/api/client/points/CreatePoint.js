let _Common_ = require('../../../common/Common.js');

class CreatePoint extends _Common_ {
  constructor() {
    super();
  }

  call(RTI, next) {
    return this.start(RTI, next);
  }

  start(RTI, next) {
    let date        = RTI.body.date;
    let time        = RTI.body.time;
    let description = RTI.body.description;
    let url         = RTI.body.url;
    let tags        = RTI.body.tags;

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
      let timestamp = DateModule.timestamp(`${date} ${time}+00:00`, 'YYYY-MM-DD HH:mmZ');

      return async.parallel([
        (callback) => { return this.description(RTI, description, callback); },
        (callback) => { return this.url        (RTI, url,         callback); },
        (callback) => { return this.tags       (RTI, tags,        callback); }
      ], (error, results) => {
        if (error) {
          if (_.isError(error)) {
            error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.info`, undefined, error);
            ResponseManager.error(RTI, error);
          }
          return next(RTI);
        }

        let descriptionID = results[0][0].id;
        let urlID         = results[1][0].id;
        let tagsID        = _.chain(tags).map((tag) => { return _.find(results[2], (tagWithID) => tagWithID[RTI.User.languages[0]] == tag).id; }).value()

        let stage = {
          description_id: descriptionID,
          tags_id:        tagsID,
          timestamp:      timestamp,
          url_id:         urlID
        }

        return POSTGRESManager.insert_stage(RTI, stage, 'points', ['RETURNING id'], (error, rows) => {
          if (error) {
            if (_.isError(error)) {
              error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.point`, undefined, error);
              ResponseManager.error(RTI, error);
            }
            return next(RTI);
          }

          ResponseManager.add(RTI, {point: rows[0]})

          return next(RTI);
        });
      });
    });
  }

  description(RTI, description, callback) {
    return POSTGRESManager.insert_stage(RTI, description, 'descriptions', ['RETURNING id'], callback);
  }

  url(RTI, url, callback) {
    return POSTGRESManager.insert_stage(RTI, url, 'urls', ['RETURNING id'], callback);
  }

  tags(RTI, tags, callback) {
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

    let tagsInsert = (rows, callback2) => {
      let oldTagsWithID = rows;
      let newTags = _.difference(tags, _.map(oldTagsWithID, RTI.User.languages[0]));

      if (_.isEmpty(newTags)) { return callback2(null, oldTagsWithID); }

      let text   = '';
      let atrs   = 1;
      let values = [];

      text += `INSERT INTO tags (${RTI.User.languages[0]}) VALUES `;

      for (let i = 0; i < newTags.length; i++) {
        let newTag = newTags[i];
        text += `($${atrs})`;
        if (i < newTags.length - 1) { text += `, `; }
        atrs += 1;
        values.push(newTag);
      }

      text += ' RETURNING *;'

      return POSTGRESManager.self_stage(RTI, text, values, (error, rows) => {
        if (error) { return callback2(error); }

        let newTagsWithID = rows;

        let tagsWithID = _.concat(oldTagsWithID, newTagsWithID);
        return callback2(null, tagsWithID);
      })
    }

    return tagsSelect((error, rows) => {
      if (error) { return callback(error); }

      return tagsInsert(rows, callback);
    });
  }
}

module.exports = CreatePoint;
