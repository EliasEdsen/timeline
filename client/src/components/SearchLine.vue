<template>
  <form @submit.prevent="onSubmit">
    <input type="search" id="search">
  </form>
</template>

<script>
  export default {
    data() {
      return {
        searchOfTimeLine: ''
      }
    },

    methods: {
      onSubmit(event) {
        // TODO
        // let value = event.target.search.value;
        // this.$router.push(`/points?${value}`)
      }
    }
  }
</script>

<style scoped>
  input {
    width: 90%;
    margin: 2rem auto 0 auto;
    display: block;
  }
</style>
