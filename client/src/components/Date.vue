<template>
  <div @click="dateClick">{{ date() }}</div>
</template>

<script>
export default {
  props: ['timestamp'],

  data() {
    return {

    }
  },

  methods: {
    dateClick() {
      if (this.isNow()) {
        this.$router.push(`/points`);
      } else {
        let momentTimestamp = moment(this.timestamp).utc();
        let date  = momentTimestamp.format('DD');
        let month = momentTimestamp.format('MM');
        let year  = momentTimestamp.format('YYYY');
        this.$router.push(`/points?day=${date}&month=${month}&year=${year}`);
      }
    },

    date() {
      if (this.isNow()) { return 'NOW'; }
      return moment(this.timestamp).utc().format('LL')
    },

    isNow() {
      return moment(this.timestamp).utc().format('LL') == 'Invalid date'
    }
  }
}
</script>

<style scoped>
  div {
    padding: 0 1rem;
    margin: 0 auto;
    display: table;
    background-color: #99F;
    border-radius: 10rem;
    font-size: 1.5rem;
    color: #9FF;
    text-align: center;
    text-decoration: underline;
    cursor: pointer;
  }
</style>
