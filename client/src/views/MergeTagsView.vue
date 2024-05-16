<template>
  <div>
    <div class="error" v-if="Error">
      {{ Error }}
    </div>

    <div class="margin" v-else v-for="(tag, index) in tags" :key=index>
      <span>{{tag[this.$store.state.User.languages[0]]}}</span>
      <form @submit.prevent="renameTag">
        <input type="search" name="rename" :placeholder="this.$translate('Tags.New_name')" :tag_id=tag.id>
      </form>
      <button :tag_id=tag.id @click=removeTagClick>{{ this.$translate('Common.Delete') }}</button>
      <form @submit.prevent="mergeTag">
        <input type="text" autocomplete name="merge" list="listOfTags" :placeholder="this.$translate('Tags.Merge_to')" :tag_id=tag.id>
        <datalist id="listOfTags">
          <option v-for="(tag, index) in getTagsExcept(tag)" :key="index" :value=tag[this.$store.state.User.languages[0]]></option>
        </datalist>
      </form>
    </div>

  </div>
</template>

<script>
  import server from '@/plugins/server'

  export default {
    components: {

    },

    data() {
      return {
        Error: null,

        tags: null
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
        this.tags = tags
      },

      renameTag(event) {
        let id    = Number(_.cloneDeep(event.target.rename.attributes.tag_id.value));
        let text  =        _.cloneDeep(event.target.rename.value);

        event.target.rename.value = '';

        let data = {id: id, text: text};

        this.$server('/renameTag', data)
          .then((response) => { this.setTags(response.tags); })
          .catch((Error)   => { this.setError(Error);        })
      },

      removeTagClick(event) {
        let id = Number(_.cloneDeep(event.target.attributes.tag_id.value));

        this.$server('/removeTag', {id: id})
          .then((response) => { this.setTags(response.tags); })
          .catch((Error)   => { this.setError(Error);        })
      },

      mergeTag(event) {
        let idFrom = Number(_.cloneDeep(event.target.merge.attributes.tag_id.value));
        let idTo = _.find(this.tags, (tag) => tag[this.$store.state.User.languages[0]] == event.target.merge.value);
        if (_.isExist(idTo)) { idTo = idTo.id; } else { return; }

        this.$server('/mergeTag', {idFrom: idFrom, idTo: idTo})
          .then((response) => { this.setTags(response.tags); })
          .catch((Error)   => { this.setError(Error);        })
      },

      getTagsExcept(tag) {
        return _.filter(this.tags, (_tag) => { return _tag.id != tag.id; });
      }
    },

    computed: {

    }
  }
</script>

<style scoped>
  .margin {
    margin-bottom: 1rem;
  }
</style>
