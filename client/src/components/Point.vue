<template>
  <div class="point">
    <div class="time">{{ date() }}</div>
    <div class="edit" @click="editClick()">{{ this.$translate('Points.Edit') }}</div>
    <div class="description">{{description}}</div>
    <div class="url"><a target="_blank" :href="url">{{ url }}</a></div>
    <div class="tags">
      <span class="tag" v-for="(tagData, index) in tags" :key="index" @click="tagClick(tagData)">{{ tagData.tag }}</span>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['id', 'description', 'tags', 'timestamp', 'url'],

    data() {
      return {

      }
    },

    methods: {
      tagClick(tagData) {
        this.$router.push(`/points?tags_id=${tagData.id}`)
      },

      editClick() {
        this.$router.push(`/changePoint?id=${this.id}`);
      },

      date() {
        return moment(this.timestamp).utc().format('LT')
      }
    },
  }
</script>

<style scoped>
  .point {
    width: 90%;
    margin: 0 auto;
    display: table;
    background-color: #F0F0FF;
    border-radius: 1rem;
  }

  .time {
    width: 50%;
    padding: 0.5rem 0 0 0.5rem;
    display: inline-block;
    text-align: left;
    color: #999;
  }

  .edit {
    width: 50%;
    padding: 0.5rem 0.5rem 0 0;
    display: inline-block;
    text-align: right;
    text-decoration: underline;
    color: #999;
    cursor: pointer;
  }

  .description {
    padding: 0.5rem;
    font-size: 1.5rem;
    text-align: center;
  }

  .url {
    width: 50%;
    padding: 0 0 0.5rem 0.5rem;
    display: inline-block;
    text-align: left;
    color: #999;
  }

  .tags {
    width: 50%;
    padding: 0 0.5rem 0.5rem 0;
    display: inline-block;
    text-align: right;
    color: #999;
  }

  .tags > span {
    text-decoration: underline;
    cursor: pointer;
  }

  .tags > span:not(:last-child) {
    padding: 0 0.5rem 0 0;
  }
</style>
