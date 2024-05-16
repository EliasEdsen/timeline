let _Common_ = require('../../../common/Common.js');

class GetPoints extends _Common_ {
  constructor() {
    super();
  }

  call(RTI, next) {
    return this.start(RTI, next);
  }

  start(RTI, next) {
    let callback = (error, points) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.start`, undefined, error);
          ResponseManager.error(RTI, error);
        }
        return next(RTI);
      }

      ResponseManager.add(RTI, {points: points})

      return next(RTI);
    }

    return UserController.find(RTI, (error, RTI) => {
      if (error) {
        if (_.isError(error)) {
          error = InformManager.errorRTI(RTI, `${this.constructor.name}.start.find`, undefined, error);
          ResponseManager.error(RTI, error);
        }
        return next(RTI);
      }

      let text   = 'SELECT * FROM points'
      let values = [];

      let isWhere = false;

      if (_.isExist(RTI.body.id)) {
        if (!isWhere) { text += ' WHERE'; isWhere = true; } else { text += ' AND' }
        text += ` (id = $${values.length + 1})`
        values.push(RTI.body.id);
      }

      // tags name
      // if (_.isExist(RTI.body.tags)) {
      //   let tags = RTI.body.tags.split(',')
      //   if (tags.length > 0) {
      //     if (!isWhere) { text += ' WHERE'; isWhere = true; } else { text += ' AND' }
      //     text += ' ('
      //     for (let keyOfTags = 0; keyOfTags < tags.length; keyOfTags++) {
      //       let tag = tags[keyOfTags];
      //       if (keyOfTags > 0) { text += ' '; }
      //       text += `(SELECT id FROM tags WHERE ${RTI.User.languages[0]} = $${values.length + 1} LIMIT 1) = ANY (tags_id)`
      //       values.push(`${tag}`);
      //       if (keyOfTags < tags.length - 1) { text += ' OR'; }
      //     }
      //     text += ')'
      //   }
      // }

      // tags id
      if (_.isExist(RTI.body.tags_id)) {
        let tagsID = RTI.body.tags_id.split(',')
        if (tagsID.length > 0) {
          if (!isWhere) { text += ' WHERE'; isWhere = true; } else { text += ' AND' }
          text += ' ('
          for (let keyOfTagsID = 0; keyOfTagsID < tagsID.length; keyOfTagsID++) {
            let tagID = tagsID[keyOfTagsID];
            if (keyOfTagsID > 0) { text += ' '; }
            text += `$${values.length + 1} = ANY (tags_id)`
            values.push(`${tagID}`);
            if (keyOfTagsID < tagsID.length - 1) { text += ' OR'; }
          }
          text += ')'
        }
      }

      if (_.isExist(RTI.body.year) || _.isExist(RTI.body.month) || _.isExist(RTI.body.day)) {
        let YMD1 = '';
        let YMD2 = '';
        if (_.isExist(RTI.body.year))  { YMD1 += 'YYYY'; YMD2 += RTI.body.year;  }
        if (_.isExist(RTI.body.month)) { YMD1 += 'MM';   YMD2 += RTI.body.month; }
        if (_.isExist(RTI.body.day))   { YMD1 += 'DD';   YMD2 += RTI.body.day;   }
        if (!isWhere) { text += ' WHERE'; isWhere = true; } else { text += ' AND' }
        text += ` (to_char(timestamp, $${values.length + 1}) = $${values.length + 2})`
        values.push(YMD1);
        values.push(YMD2);
      }

      text += ' ORDER BY "timestamp" desc';

      if (_.isExist(RTI.body.limit)) { text += ` LIMIT ${RTI.body.limit}`; }

      text += ';'
      return POSTGRESManager.self_stage(RTI, text, values, (error, rows) => {
        if (error) { return callback(error); }

        if (_.isEmpty(rows)) { return callback(null, rows); }

        let descriptionsID = _.map(rows, 'description_id');
        let urlsID         = _.map(rows, 'url_id');
        let tagsID         = _.chain(rows).map('tags_id').flatten().value();

        let select = (type, IDS, _callback) => {
          if (_.isNil(IDS) || _.isEmpty(IDS)) { return _callback(); }

          let text   = '';
          let atrs   = 1;
          let values = [];
          text      += `SELECT * FROM ${type} WHERE id IN (`

          for (let i = 0; i < IDS.length; i++) {
            let ID = IDS[i];
            text += `$${atrs}`;
            if (i < IDS.length - 1) { text += `, `; }
            atrs += 1
            values.push(ID);
          }

          text += ');'

          return POSTGRESManager.self_stage(RTI, text, values, _callback);
        }

        return async.parallel([
          (_callback) => { return select('descriptions', descriptionsID, _callback); },
          (_callback) => { return select('urls',         urlsID,         _callback); },
          (_callback) => { return select('tags',         tagsID,         _callback); }
        ], (error, results) => {
          if (error) { return callback(error); }

          let descriptions = _.keyBy(results[0], 'id');
          let urls         = _.keyBy(results[1], 'id');
          let tags         = _.keyBy(results[2], 'id');

          let languagesMy  = RTI.User.languages;
          let languagesAll = _.chain([]).concat(RTI.User.languages).concat(RTI.contents.informations.languages).uniq().value();

          for (let keyOfRows = 0; keyOfRows < rows.length; keyOfRows++) {
            let row = rows[keyOfRows];

            if (RTI.body.withTranslates) {
              row.description = descriptions[row.description_id];
              delete row.description_id;

              row.url = urls[row.url_id];
              delete row.url_id;

              row.tags = _.map(row.tags_id, (tag_id) => { return tags[tag_id]; });
              delete row.tags_id;
            } else {
              for (let indexOfLanguages = 0; indexOfLanguages < languagesMy.length; indexOfLanguages++) {
                const language = languagesMy[indexOfLanguages];
                let description = descriptions[row.description_id][language];
                if (_.isExist(description) && !_.isEmpty(description)) { row.description = description; break; }
              }
              if (_.isNil(row.description) || _.isEmpty(row.description)) { row.delete = true; continue; }
              delete row.description_id;

              for (let indexOfLanguages = 0; indexOfLanguages < languagesAll.length; indexOfLanguages++) {
                const language = languagesAll[indexOfLanguages];
                let url = urls[row.url_id][language];
                if (_.isExist(url) && !_.isEmpty(url)) { row.url = url; break; }
              }
              delete row.url_id;

              row.tags = _.map(row.tags_id, (tag_id) => {
                for (let indexOfLanguages = 0; indexOfLanguages < languagesAll.length; indexOfLanguages++) {
                  const language = languagesAll[indexOfLanguages];
                  let tag = tags[tag_id][language];
                  if (_.isExist(tag) && !_.isEmpty(tag)) { return {id: tag_id, tag: tag}; }
                }
                return {id: tag_id, tag: ''};
              });
              delete row.tags_id;
            }
          }

          rows = _.filter(rows, (row) => { return !row.delete; });
          let points = rows;

          return callback(null, points);
        })
      });
    });
  }
}

module.exports = GetPoints;
