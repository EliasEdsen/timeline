<template>
  <div>
    <div class="error" v-if="Error">
      {{ Error }}
    </div>

    <form v-else @submit.prevent="onSubmit">
      <p>
        <label for="dateID">{{ this.$translate('Points.Date') }}</label>
        <input type="date" name="date" required>
      </p>

      <p>
        <label for="timeID">{{ this.$translate('Points.Time_has') }}</label>
        <input type="range" min=0 max=1 v-model="isTime"> <!-- TODO to a Toggle -->
        <input v-if="isTime == 1" type="time" name="time" required>
      </p>

      <p v-for="(language, index) in $store.state.Informations.languages" :key="index">
        {{ language }}:
        <input type="text" name="description" :language=language :placeholder="this.$translate('Common.Description')" required>
      </p>

      <p v-for="(language, index) in $store.state.Informations.languages" :key="index">
        {{ language }}:
        <input type="url" name="url" :language=language :placeholder="this.$translate('Points.Link')" required>
      </p>

      <p>
        <label for="tagsID">{{ this.$translate('Tags.Tags') }}:</label>
        <button v-for="(tag, index) in tagsSelected" :key="index" :value="tag" @click.prevent=removeTagClick>{{tag}}</button>
        <input type="text" list="listOfTags" :placeholder="this.$translate('Tags.Add_tag')" @change.prevent="tagSelected" autocomplete>

        <datalist id="listOfTags">
          <option v-for="(tag, index) in tagsAll" :key="index" :value=tag></option>
        </datalist>
      </p>

      <!-- Длительное событие -->

      <input type="reset" :value="this.$translate('Common.Reset')">
      <input type="submit" :value="this.$translate('Common.Submit')">

    </form>
  </div>
</template>

<script>
  import server from '@/plugins/server'

  export default {
    data() {
      return {
        Error: null,

        isTime: 1,
        tagsAll: [],
        tagsSelected: []
      }
    },

    beforeRouteEnter(to, from, next) {
      let _async = [];

      _async.push((callback) => {
        server.call('/getTags')
              .then((response) => { return callback(null, response.tags); })
              .catch((Error)   => { return callback(Error);               })
      })

      async.parallel(_async, (Error, results) => {
        if (Error) {
          next((vm) => {
            vm.setError(Error);
            return;
          })
        }

        next((vm) => {
          vm.setTags(results[0]);
          return;
        })
      })
    },

    beforeRouteUpdate(to, from, next) {
      let _async = [];

      _async.push((callback) => {
        this.$server('/getTags')
             .then((response) => { return callback(null, response.tags); })
             .catch((Error)   => { return callback(Error);               })
      })

      async.parallel(_async, (Error, results) => {
        if (Error) {
          this.setError(Error);
          return next();
        }

        this.setTags(results[0]);
        return next();
      })
    },

    methods: {
      setError(Error) {
        console.error('Error', Error);
        this.Error = Error;
      },

      setTags(tags) {
        this.tagsAll = _.map(tags, this.$store.state.User.languages[0]);
      },

      onSubmit(event) {
        let data = {};
        data.date = event.target.date.value;

        if (_.isExist(event.target.time)) {
          data.time = event.target.time.value;
        }

        data.description = {};
        for (let indexOfDescriptions = 0; indexOfDescriptions < event.target.description.length; indexOfDescriptions++) {
          let language    = event.target.description[indexOfDescriptions].attributes.language.value;
          let description = event.target.description[indexOfDescriptions].value;
          data.description[language] = description;
        }

        data.url = {};
        for (let indexOfURL = 0; indexOfURL < event.target.url.length; indexOfURL++) {
          let language    = event.target.url[indexOfURL].attributes.language.value;
          let url = event.target.url[indexOfURL].value;
          data.url[language] = url;
        }

        data.tags = this.tagsSelected;

        this.$server('/createPoint', data)
          .then((response) => { return this.$router.push(`/point?id=${response.point.id}`); })
          .catch((Error)   => { return console.error(Error);                                })
      },

      tagSelected(event) {
        this.tagsSelected.push(event.target.value)
        this.tagsSelected = _.chain(this.tagsSelected).compact().map((str) => {return str.trim().replace(/\s\s+/g, ' ');}).uniq().value();
        event.target.value = null
      },

      removeTagClick(event) { this.removeTag(event.target.value); },
      removeTag(tag)        { this.tagsSelected = _.without(this.tagsSelected, tag); },
    }
  }
</script>

<style scoped>

</style>
