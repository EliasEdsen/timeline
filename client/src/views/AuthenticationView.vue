<template>
  <div>
    <div v-if="isRegistrationView" class="form_auth_block">
      <div class="form_auth_block_content">
        <p class="form_auth_block_head_text">{{ this.$translate('Login.Registration') }}</p>
        <form class="form_auth_style" @submit.prevent="registration">
          <label>{{ this.$translate('Login.Email') }}</label>
          <input type="email" name="email" :placeholder="this.$translate('Login.Email')" required>
          <label>{{ this.$translate('Login.Password_come_up') }}</label>
          <input type="password" name="password" :placeholder="this.$translate('Login.Password_come_up')" required>
          <button class="form_auth_button" type="submit" name="form_auth_submit">{{ this.$translate('Login.Register') }}</button>
        </form>
      </div>
      <button class="form_auth_button" type="submit" name="form_auth_submit" @click.prevent="switchIsRegistrationView">{{ this.$translate('Login.Registered') }}</button>
    </div>
    <div v-else class="form_auth_block">
      <div class="form_auth_block_content">
        <p class="form_auth_block_head_text">{{ this.$translate('Login.Authorization') }}</p>
        <form class="form_auth_style" @submit.prevent="authentication">
          <label>{{ this.$translate('Login.Email') }}</label>
          <input type="email" name="email" :placeholder="this.$translate('Login.Email')" required>
          <label>{{ this.$translate('Login.Password_enter') }}</label>
          <input type="password" name="password" :placeholder="this.$translate('Login.Password_enter')" required>
          <button class="form_auth_button" type="submit" name="form_auth_submit">{{ this.$translate('Login.Enter') }}</button>
        </form>
      </div>
      <button class="form_auth_button" type="submit" name="form_auth_submit" @click.prevent="switchIsRegistrationView">{{ this.$translate('Login.Register') }}</button>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        isRegistrationView: true,
      }
    },

    methods: {
      switchIsRegistrationView() { this.isRegistrationView = !this.isRegistrationView; },

      registration(event) {
        let email    = event.target.email.value;
        let password = event.target.password.value;

        this.$server('/registration', {email, password})
            .then((response) => { return this.$router.push(this.$route.query.redirect); })
            .catch((Error)   => { return console.error(Error);                          })
      },

      authentication(event) {
        let email    = event.target.email.value;
        let password = event.target.password.value;

        this.$server('/authentication', {email, password})
            .then((response) => { return this.$router.push(this.$route.query.redirect); })
            .catch((Error)   => { return console.error(Error);                          })
      }
    }
  }
</script>

<style scoped>

  .form_auth_block{
    width: 500px;
    height: 500px;
    margin: 0 auto;
    background: url(http://www.dailycompass.org/wp-content/uploads/2013/01/Bubbles.jpg);
    background-size: cover;
    border-radius: 4px;
  }

  .form_auth_block_content{
    padding-top: 15%;
  }

  .form_auth_block_head_text{
      display: block;
      text-align: center;
      padding: 10px;
      font-size: 20px;
      font-weight: 600;
      background: #ffffff;
      opacity: 0.7;
  }

  .form_auth_block label{
      display: block;
      text-align: center;
      padding: 10px;
      background: #ffffff;
      opacity: 0.7;
      font-weight: 600;
      margin-bottom: 10px;
      margin-top: 10px;
  }

  .form_auth_block input{
    display: block;
    margin: 0 auto;
    width: 80%;
    height: 45px;
    border-radius: 10px;
    border:none;
    outline: none;
  }
  input:focus {
    color: #000000;
    border-radius: 10px;
    border: 2px solid #436fea;
  }

  .form_auth_button{
    display: block;
    width: 80%;
    margin: 0 auto;
    margin-top: 10px;
    border-radius: 10px;
    height: 35px;
    border: none;
    cursor: pointer;
  }

  ::-webkit-input-placeholder {color:#3f3f44; padding-left: 10px;} /* Это стили для placeholder */
  ::-moz-placeholder          {color:#3f3f44; padding-left: 10px;} /* Это стили для placeholder */
  :-moz-placeholder           {color:#3f3f44; padding-left: 10px;} /* Это стили для placeholder */
  :-ms-input-placeholder      {color:#3f3f44; padding-left: 10px;} /* Это стили для placeholder */
</style>
