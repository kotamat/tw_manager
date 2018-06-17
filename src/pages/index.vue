<template>
  <section class="container">
    <a href="/api/auth/twitter">Twitter認証</a>
    <a href="/api/follow/followers">フォロワー確認</a>
    {{tokens}}
    <div>
      <div v-for="(follower, key) in followers">
        <a :href="`https://twitter.com/${follower.screen_name}`">{{follower.name}} ({{follower.followers_count}})</a>
      </div>
    </div>
    <no-ssr>
      <infinite-loading @infinite="loadFollower" v-if="tokens.access_token"></infinite-loading>
    </no-ssr>
  </section>
</template>

<script>
import { mapGetters } from "vuex";
import InfiniteLoading from "vue-infinite-loading";

export default {
  components: { InfiniteLoading },
  computed: {
    ...mapGetters(["tokens"])
  },
  async created() {
    try {
      let i = 0;
      while (i < 2) {
        await this.loadFollower();
        i++;
      }
    } catch (err) {
      console.log(err);
    }
  },
  methods: {
    async loadFollower($state) {
      try {
        const screen_name = "kotamats",
          cursor = this.followerCursor;
        const res = await this.$axios.$get("/api/follow/followers", {
          params: {
            screen_name,
            cursor
          }
        });
        this.followers = [...this.followers, ...res.users];
        this.followerCursor = res.next_cursor;
        if (!res.next_cursor) {
          throw new Error("load ended");
        }
      } catch (err) {
        console.error(err);
      } finally {
        if ($state) {
          $state.loaded();
        }
      }
    }
  },
  data() {
    return {
      followers: [],
      followerCursor: null
    };
  }
};
</script>

<style>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
