let _Common_ = require('../common/Common.js')

class InformManager extends _Common_ {
  error(title, description, error, statusCode = 500) { // ошибки кода
    let data = {}

    if (_.isExist(title))       { data.title       = title;       }
    if (_.isExist(description)) { data.description = description; }
    if (_.isExist(error))       { data.error       = error;       }
    if (_.isExist(statusCode))  { data.statusCode  = statusCode;  }

    data.date = DateModule.timestamp();

    console.error('Error:', data)

    /*****/

    let text = ''

    if (_.isExist(data.title))       { text += `Title: ${data.title}; `                                         }
    if (_.isExist(data.description)) { text += `Description: ${data.description}; `                             }
    if (_.isExist(data.error))       { text += `Error: ${JSON.stringify(data.error)}; `                         }
    if (_.isExist(data.error))       { text += `Message: ${data.error.message}; `                               }
    if (_.isExist(data.error))       { text += `Stack: ${JSON.stringify(ErrorStackParser.parse(data.error))}; ` }
    if (_.isExist(data.statusCode))  { text += `Code: ${data.statusCode}; `                                     }
    if (_.isExist(data.date))        { text += `Date: ${data.date};`                                            }

    fs.appendFile('./Errors.log', text + '\n\n', (error) => {
      if (error) { console.error('Error was not recorded!'); }
    });

    /*****/

    let result = {}

    if (_.isExist(data.title))       { result.title       = data.title;         }
    if (_.isExist(data.description)) { result.description = data.description;   }
    if (_.isExist(data.error))       { result.message     = data.error.message; }

    this.propertyAll(result, 'statusCode', {value: data.statusCode})
    this.propertyAll(result, 'isError',    {value: true})

    return result;
  }

  errorRTI(RTI, title, description, error, statusCode = 500) { // ошибки кода с данными юзера
    let data = {}

    if (_.isExist(title))       { data.title       = title;       }
    if (_.isExist(description)) { data.description = description; }
    if (_.isExist(error))       { data.error       = error;       }
    if (_.isExist(statusCode))  { data.statusCode  = statusCode;  }

    if (_.isExist(RTI) && _.isExist(RTI.url))  { data.url  = RTI.url;  }
    if (_.isExist(RTI) && _.isExist(RTI.body)) { data.body = RTI.body; }

    if (_.isExist(RTI) && _.isExist(RTI.User) && _.isExist(RTI.User.id)) { data.id = RTI.User.id; }

    if (_.isExist(RTI.req) && _.isExist(RTI.req.headers) && _.isExist(RTI.req.headers['x-real-ip'])) { data.ip = RTI.req.headers['x-real-ip']; }

    data.date = DateModule.timestamp();

    console.error('Error:', data)

    /*****/

    let text = ''

    if (_.isExist(data.title))       { text += `Title: ${data.title}; `                                         }
    if (_.isExist(data.description)) { text += `Description: ${data.description}; `                             }
    if (_.isExist(data.error))       { text += `Error: ${JSON.stringify(data.error)}; `                         }
    if (_.isExist(data.error))       { text += `Message: ${data.error.message}; `                               }
    if (_.isExist(data.error))       { text += `Stack: ${JSON.stringify(ErrorStackParser.parse(data.error))}; ` }
    if (_.isExist(data.statusCode))  { text += `Code: ${data.statusCode}; `                                     }
    if (_.isExist(data.url))         { text += `URL: ${data.url}; `                                             }
    if (_.isExist(data.body))        { text += `Body: ${JSON.stringify(data.body)}; `                           }
    if (_.isExist(data.id))          { text += `ID: ${data.id}; `                                               }
    if (_.isExist(data.ip))          { text += `IP: ${data.ip}; `                                               }
    if (_.isExist(data.date))        { text += `Date: ${data.date};`                                            }

    fs.appendFile('./Errors.log', text + '\n\n', (error) => {
      if (error) { console.error('Error was not recorded!'); }
    });

    /*****/

    let result = {};

    if (_.isExist(data.title))       { result.title       = data.title;         }
    if (_.isExist(data.description)) { result.description = data.description;   }
    if (_.isExist(data.error))       { result.message     = data.error.message; }

    this.propertyAll(result, 'statusCode', {value: data.statusCode})
    this.propertyAll(result, 'isError',    {value: true})

    return result;
  }

  information(title, description, information) { // информация сервера
    let data = {}

    if (_.isExist(title))       { data.title       = title;       }
    if (_.isExist(description)) { data.description = description; }
    if (_.isExist(information)) { data.information = information; }

    data.date = DateModule.timestamp();

    console.info('Information:', data);

    /*****/

    let text = '';

    if (_.isExist(data.title))       { text += `Title: ${data.title}; `                             }
    if (_.isExist(data.description)) { text += `Description: ${data.description}; `                 }
    if (_.isExist(data.information)) { text += `Information: ${JSON.stringify(data.information)}; ` }
    if (_.isExist(data.date))        { text += `Date: ${data.date};`                                }

    fs.appendFile('./Informations.log', text + '\n\n', (error) => {
      if (error) { console.error('Information was not recorded!'); }
    });

    /*****/

    let result = {};

    if (_.isExist(data.title))       { result.title       = data.title;       }
    if (_.isExist(data.description)) { result.description = data.description; }
    if (_.isExist(data.information)) { result.information = data.information; }

    this.propertyAll(result.__proto__, 'isInformation', {value: true})

    return result;
  }

  notification(RTI, code, text_data) { // Уведомления и возможные взломы
    let data = {}

    if (_.isExist(code)) { data.code = code; }

    if (_.isExist(RTI) && _.isExist(RTI.url))  { data.url  = RTI.url;  }
    if (_.isExist(RTI) && _.isExist(RTI.body)) { data.body = RTI.body; }

    if (_.isExist(RTI) && _.isExist(RTI.User) && _.isExist(RTI.User.id)) { data.id = RTI.User.id; }

    if (_.isExist(RTI.req) && _.isExist(RTI.req.headers) && _.isExist(RTI.req.headers['x-real-ip'])) { data.ip = RTI.req.headers['x-real-ip']; }

    data.date = DateModule.timestamp();

    if (_.isExist(text_data) && !_.isArray(text_data)) { text_data = [text_data]; }
    data.data = text_data

    if (_.isExist(data.code)) {
      data.notification = I18NManager.get('ru', ['Notifications', data.code], text_data);
    }

    /*****/

    let text = ''

    if (_.isExist(data.code))         { text += `Code: ${data.code}; `                 }
    if (_.isExist(data.notification)) { text += `Notification: ${data.notification}; ` }
    if (_.isExist(data.data))         { text += `Data: ${data.data}; `                 }
    if (_.isExist(data.url))          { text += `URL: ${data.url}; `                   }
    if (_.isExist(data.body))         { text += `Body: ${JSON.stringify(data.body)}; ` }
    if (_.isExist(data.id))           { text += `ID: ${data.id}; `                     }
    if (_.isExist(data.ip))           { text += `IP: ${data.ip}; `                     }
    if (_.isExist(data.date))         { text += `Date: ${data.date};`                  }

    fs.appendFile('./Notifications.log', text + '\n\n', (error) => {
      if (error) { console.error('Notification was not recorded!'); }
    });

    /*****/

    let result = {};

    if (_.isExist(data.code)) { result.code = data.code; }
    if (_.isExist(data.data)) { result.data = data.data; }

    this.propertyAll(result.__proto__, 'isNotification', {value: true})

    return result;
  }
}

module.exports = new InformManager;
