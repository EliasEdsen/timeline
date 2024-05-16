import config from '../config.json'

import { createApp } from 'vue'
import App           from './App.vue'
import router        from './router'
import store         from './store'
import cookie        from './plugins/cookie'
import i18n          from './plugins/i18n'
import server        from './plugins/server'

import moment from 'moment';
window.moment = moment;

import _ from 'lodash';
window._ = _;
_.mixin({
  isExist:    (value)                                  => { return !_.isNil(value); },
  isInfinity: (value)                                  => { return value == Infinity || value == -Infinity; },
  constrain:  (value, min = -Infinity, max = Infinity) => { if (value < min) { return min; } else if (value > max) { return max; } else { return value; }; }
});

import async from 'async';
window.async = async;

import { LoremIpsum } from "lorem-ipsum";
window.lorem = new LoremIpsum();

// server
let xhr = new XMLHttpRequest();
xhr.open('POST', `//${config.host}:${config.port}/api/client/identification`, true)
xhr.withCredentials = true;
xhr.onload = () => {
  let response = JSON.parse(xhr.response);
  console.log('main response', response);


  const app = createApp(App);

  app.use(router(app));
  app.use(store(app, response))

  app.use(cookie)
  app.use(i18n, response.i18n)
  app.use(server, config)

  console.info('UserID:', response.user.id);

  app.mount('#app');
}
xhr.send(JSON.stringify({'version': config.version}));
