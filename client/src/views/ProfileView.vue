<template>
  <div>
    <h1>Profile</h1>

    <div id="left">
      <p>
        <RouterLink to="/profile/change">{{ this.$translate('Profile.Change') }}</RouterLink>
      </p>
      <p>
        <button @click=logout>{{ this.$translate('Login.Logout') }}</button>
      </p>
    </div>

    <div id="rigth">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
  export default {
    methods: {
      logout() {
        this.$server('/logout')
          .then((response) => { return this.$router.replace('/'); })
          .catch((Error)   => { return console.error(Error);      })
      },
    },
  }
</script>

<style scoped>
  #left {
    width: 20%;
  }

  #rigth {
    width: 80%;
    margin-left: 20%;
  }
</style>
