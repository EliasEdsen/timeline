<template>
  <header>
    <RouterLink to="/">{{ this.$translate('App.Home') }}</RouterLink>
    <RouterLink to="/points">{{ this.$translate('Points.All') }}</RouterLink>
    <RouterLink to="/createPoint">{{ this.$translate('Points.Create') }}</RouterLink>
    <RouterLink to="/mergeTags">{{ this.$translate('Tags.Merge') }}</RouterLink>
    <button @click=createPoints>{{ this.$translate('Points.Create_10') }}</button>
    <button @click=removePoints>{{ this.$translate('Points.Remove_all') }}</button>
    <button @click=userState>{{ this.$translate('User.State') }}</button>
    <RouterLink to="/profile">{{ this.$translate('App.Profile') }}</RouterLink>
  </header>

  <RouterView />
</template>

<script>
  export default {
    methods: {
      createPoints() {
        let _async = [];
        let language = this.$store.state.User.languages[0];

        for (let i = 0; i < 10; i++) {
          let date        = `${_.random(2022, 2024)}-${_.random(1, 12)}-${_.random(1, 20)}`
          let time        = `${_.random(0, 23)}:${_.random(0, 59)}`
          let description = {[language]: `${language}_${lorem.generateSentences(3)}`}
          let url         = {[language]: "https://www.google.com/"}
          let tags        = _.uniq(new Array(_.random(1, 10)).fill().map(() => `Тег№${_.random(1, 10)}`))

          _async.push((callback) => {
            this.$server('/createPoint', {date: date, time: time, description: description, url: url, tags: tags})
              .then((response) => { return callback();      })
              .catch((Error)   => { return callback(Error); })
          });
        }

        async.series(_async);
      },

      removePoints() {
        this.$server('/removePoints')
          .then((response) => { return this.$router.push(`/points`); })
          .catch((Error)   => { return callback(Error);              })
      },

      userState() {
        console.log(this.$store.state);
      },
    }
  }
</script>

<style>
  @import '@/assets/base.css';

  #app {
    margin: 0 auto;
  }

  header > a:not(:last-child) {
    padding: 0 0.5rem 0 0;
  }
</style>
