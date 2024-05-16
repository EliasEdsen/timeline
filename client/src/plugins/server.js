export default {
  host: null,
  port: null,

  install(app, options) {
    this.app     = app;
    this.options = options;
    this.host    = options.host;
    this.port    = options.port;

    app.config.globalProperties.$server = this.call.bind(this);
  },

  call(path = '/', data = {}, type = 'POST') {
    return new Promise((resolve, reject) => {
      return this.serverCall(path, data, type)
                 .then((response)=> {
                  this.parseNotificaton(response.notifications)
                  this.parseUser(response.user)
                  this.parseRedirect(response.redirect)
                  return resolve(response);
                })
                 .catch((Error)  => { return reject(Error);     })
    });
  },

  serverCall(path, data, type) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();

      if (_.isNil(path))          { return reject(new Error('No path.'));                }
      if (!_.isPlainObject(data)) { return reject(new Error('The Data is not object.')); }

      xhr.open(type, `//${this.host}:${this.port}/api/client${path}`, true)
      xhr.withCredentials = true;
      xhr.onload = () => { return resolve(JSON.parse(xhr.response)); }
      xhr.send(JSON.stringify(data));
    });
  },

  parseNotificaton(notifications) {
    if (_.isNil(notifications)) { return; }

    for (let indexOfNotifications = 0; indexOfNotifications < notifications.length; indexOfNotifications++) {
      let notification = notifications[indexOfNotifications];

      let key1  = `Notifications.Notification`;
      let key2  = `Notifications.${notification.code}`;
      let text = `${this.app.config.globalProperties.$translate(key1)}!\n\n${this.app.config.globalProperties.$translate(key2)}.`;
      alert(text);
    }
  },

  parseUser(user) {
    if (_.isNil(user)) { return; }

    this.app.config.globalProperties.$store.commit('User/UPDATE_STATE', user);
  },

  parseRedirect(redirect) {
    if (_.isNil(redirect)) { return; }

    this.app.config.globalProperties.$router.push(redirect)
  },
}
