export default (app, data) => {
  return {
    namespaced: true,

    state() {
      return {
        id:            data.id,
        languages:     data.languages,
        name:          data.name,
        email:         data.email,
        isHasLoggedIn: () => app.config.globalProperties.$cookie.has('secure'),
      }
    },

    mutations: {
      addLanguage(state, data) { state.languages.push(data.language); },
      deleteLanguage(state, data) { state.languages = _.without(state.languages, data.language); },
      UPDATE_STATE(state, new_state) { _.extend(state, new_state); },
    },

    getters: {

    },

    actions: {

    },
  }
}
