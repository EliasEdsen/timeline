<template>
  <div>
    <div class="error" v-if="Error">
      {{ Error }}
    </div>

    <Point v-else-if="point" :key="point.key" :id="point.id" :description="point.description" :tags="point.tags" :timestamp="point.timestamp" :url="point.url"></Point>
  </div>
</template>

<script>
  import Point  from '@/components/Point.vue';
  import server from '@/plugins/server'

  export default {
    components: {
      Point: Point
    },

    data() {
      return {
        Error: null,

        point: null
      }
    },

    beforeRouteEnter(to, from, next) {
      let _async = [];

      _async.push((callback) => {
        server.call('/getPoints', _.extend(to.query, {limit: 1, withTranslates: false}))
              .then((response) => { return callback(null, response.points); })
              .catch((Error)   => { return callback(Error);                 })
      })

      async.parallel(_async, (Error, results) => {
        if (Error) {
          next((vm) => {
            vm.setError(Error);
            return;
          })
        }

        next((vm) => {
          vm.setPoint(results[0][0]);
          return;
        })
      })
    },

    beforeRouteUpdate(to, from, next) {
      let _async = [];

      _async.push((callback) => {
        this.$server('/getPoints', _.extend(to.query, {limit: 1, withTranslates: false}))
             .then((response) => { return callback(null, response.points); })
             .catch((Error)   => { return callback(Error);                 })
      })

      async.parallel(_async, (Error, results) => {
        if (Error) {
          this.setError(Error);
          return next();
        }

        this.setPoint(results[0][0]);
        return next();
      })
    },

    methods: {
      setError(Error) {
        console.error('Error', Error);
        this.Error = Error;
      },

      setPoint(point) {
        this.point = point
      }
    },

    computed: {

    }
  }
</script>

<style scoped>

</style>
