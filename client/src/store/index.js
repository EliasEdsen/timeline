import { createStore } from 'vuex/dist/vuex.esm-bundler'
import User         from './User'
import Informations from './Informations'

export default (app, data) => {
 return createStore({
    strict: process.env.NODE_ENV !== 'production',

    modules: {
      User:         User(app,         data.user),
      Informations: Informations(app, data.contents.informations)
    }
  })
}

// export default (app) => createStore({
//   strict: process.env.NODE_ENV !== 'production',

//   modules: {
//     User: User(app)
//   },

  // EXAMPLES:
  // install(app, options) {
  //   console.log('store');
  //   console.log('app', app);
  //   console.log('options', options);
  // },

  // state() {
  //   return {
  //     test: 0, // store.state.test
  //     isAuthenticated: false
  //   }
  // },

  // mutations: {
  //   test_increment1(state, payload) { this.state.test += 1;              }, // store.commit('test_increment1')
  //   test_increment2(state, payload) { this.state.test += payload.number; }  // store.commit('test_increment2', {number: 50})
  // },

  // getters: {
  //   test_get1 (state, getters) { return state.test + 100; }, // store.getters.test_get1 // store.getters['User/test_get1']
  //   test_get2: (state, getters) => (number) => { return getters.test_get1 + number; } // store.getters.test_get2(1000) // store.getters['User/test_get2'](1000)
  // },

  // actions: {
    // store.dispatch('User/method');
  // },
// })
