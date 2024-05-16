<template>
  <div>
    <div class="error" v-if="Error">
      {{ Error }}
    </div>

    <div v-else  v-for="(point, index) in points" :key="index">
      <Date      v-if="point.type == 'date'"      :key="index" :timestamp="point.value"></Date>
      <LineShort v-if="point.type == 'lineShort'" :key="index"></LineShort>
      <LineLong  v-if="point.type == 'lineLong'"  :key="index"></LineLong>
      <Point     v-if="point.type == 'point'"     :key="index" :id="point.value.id" :description="point.value.description" :tags="point.value.tags" :timestamp="point.value.timestamp" :url="point.value.url"></Point>
    </div>
  </div>
</template>

<script>
  import Date      from '@/components/Date.vue';
  import LineShort from '@/components/LineShort.vue';
  import LineLong  from '@/components/LineLong.vue';
  import Point     from '@/components/Point.vue';
  import server    from '@/plugins/server'

  export default {
    components: {
      Date:      Date,
      LineShort: LineShort,
      LineLong:  LineLong,
      Point:     Point
    },

    data() {
      return {
        Error: null,

        points: []
      }
    },

    beforeRouteEnter(to, from, next) {
      let _async = [];

      _async.push((callback) => {
        server.call('/getPoints', _.extend(to.query, {withTranslates: false}))
              .then((response) => { return callback(null, response.points); })
              .catch((Error)   => { return callback(Error);                 })
      });

      async.parallel(_async, (Error, results) => {
        if (Error) {
          next((vm) => {
            vm.setError(Error);
            return;
          })
        }

        next((vm) => {
          vm.setPoints(results[0]);
          return;
        })
      });
    },

    beforeRouteUpdate(to, from, next) {
      let _async = [];

      _async.push((callback) => {
        this.$server('/getPoints', _.extend(to.query, {withTranslates: false}))
             .then((response) => { return callback(null, response.points); })
             .catch((Error)   => { return callback(Error);                 })
      })

      async.parallel(_async, (Error, results) => {
        if (Error) {
          this.setError(Error);
          return next();
        }

        this.setPoints(results[0]);
        return next();
      })
    },

    methods: {
      setError(Error) {
        console.error('Error', Error);
        this.Error = Error;
      },

      setPoints(points) {
        points = _.sortBy(points, 'timestamp')

        let _points                  = [];
        let prevPointTimestampMoment = null;
        let isNewDate                = null;

        for (let keyOfPoints = 0; keyOfPoints < points.length; keyOfPoints++) {
          let point = points[keyOfPoints];
          let pointTimestampMoment = moment(point.timestamp).utc();
          isNewDate = false;

          if (_.isNil(prevPointTimestampMoment) || prevPointTimestampMoment.format('YYYY MM DD') != pointTimestampMoment.format('YYYY MM DD')) {
            if (keyOfPoints != 0) { _points.push({type: 'lineLong'}) }
            _points.push({type: 'date', value: point.timestamp})
            _points.push({type: 'lineLong'})
            isNewDate = true;
          }

          if (!isNewDate) { _points.push({type: 'lineShort'}); }
          _points.push({type: 'point', value: point})

          prevPointTimestampMoment = pointTimestampMoment
        }

        if (points.length > 0) { _points.push({type: 'lineLong'}); }
        if (prevPointTimestampMoment) {
          _points.push({type: 'date', value: prevPointTimestampMoment.add(1, 'd')});
        } else {
          _points.push({type: 'date', value: moment(Infinity).utc()});
        }

        _points = _points.reverse();

        this.points = _points
      }
    },

    computed: {

    }
  }
</script>

<style scoped>

</style>
