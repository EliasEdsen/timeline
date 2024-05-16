<template>
  <div>
    <form @submit.prevent="onSubmit">
      <p>
        <input type="text" name="name" :placeholder="this.$translate('Login.Name')" :value="$store.state.User.name" required>
      </p>
      <p>
        <input type="email" name="email" :placeholder="this.$translate('Login.Email')" :value="$store.state.User.email" required>
      </p>
      <p>
        <input type="password" name="password" :placeholder="this.$translate('Login.Password_come_up')" :value="$store.state.User.password" required>
      </p>

      <p>
        {{ this.$translate('Profile.MyLanguages') }}:
        <button v-for="(language, index) in $store.state.User.languages" :key="index" :value=language @click.prevent=clickDeleteLanguage(language)>{{language}}</button>
        <br>
        {{ this.$translate('Profile.OtherLanguages') }}:
        <button v-for="(language, index) in this.allLanguages()" :key="index" :value=language @click.prevent=clickAddLanguage(language)>{{language}}</button>
      </p>

      <input type="submit" :value="this.$translate('Common.Change')">
    </form>
  </div>
</template>

<script>
  export default {
    data() {
      return {

      }
    },

    methods: {
      allLanguages() {
        return _.difference(this.$store.state.Informations.languages, this.$store.state.User.languages);
      },
      onSubmit(event) {
        let data = {};
        if (event.target.name)     { data.name      = event.target.name.value;     }
        if (event.target.email)    { data.email     = event.target.email.value;    }
        if (event.target.password) { data.password  = event.target.password.value; }
                                     data.languages = this.$store.state.User.languages;

        this.$server('/changeProfile', data)
          .then((response) => { return                        })
          .catch((Error)   => { return console.error(Error);  })
      },

      clickAddLanguage(language) {
        this.$store.commit('User/addLanguage', {language})
      },

      clickDeleteLanguage(language) {
        this.$store.commit('User/deleteLanguage', {language})
      },
    }
  }
</script>

<style scoped>

</style>
