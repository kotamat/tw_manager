<template>
  <section class="container">
    <a href="/api/auth/twitter">Twitter認証</a>
    <a href="/api/follow/followers">フォロワー確認</a>
    {{tokens}}
    <div class="lists">
      <div>
        <h2>unfollowed</h2>
        <div v-for="(user, key) in unFollowBack">
          <a :href="`https://twitter.com/${user.screen_name}`" target="_blank">link</a>
          <a @click="unfollow(user)">{{user.name}} ({{user.followers_count}})</a>
        </div>
      </div>
      <div>
        <h2>ff</h2>
        <div v-for="(user, key) in ff">
          <a :href="`https://twitter.com/${user.screen_name}`" target="_blank">link</a>
          <a @click="unfollow(user)">{{user.name}} ({{user.followers_count}})</a>
        </div>
      </div>
    </div>
    <no-ssr>
      <!-- <infinite-loading @infinite="loadFollower" v-if="tokens.access_token"></infinite-loading> -->
    </no-ssr>
  </section>
</template>

<script>
import { mapGetters } from "vuex";
import InfiniteLoading from "vue-infinite-loading";

export default {
  components: { InfiniteLoading },
  computed: {
    ...mapGetters(["tokens"]),
    unFollowBack() {
      const followerIds = this.followers.map(i => i.id);
      return this.follows.filter(
        i => !followerIds.includes(i.id) && !this.unfollowed.includes(i.id)
      );
    },
    ff() {
      const followerIds = this.followers.map(i => i.id);
      return this.follows.filter(
        i => followerIds.includes(i.id) && !this.unfollowed.includes(i.id)
      );
    }
  },
  async created() {
    try {
      let i = 0;
      while (i < 100) {
        await this.loadFollower();
        if (!this.followerCursor) {
          break;
        }
        i++;
      }
    } catch (err) {
      console.log(err);
    }
    try {
      let i = 0;
      while (i < 100) {
        await this.loadFollow();
        if (!this.followCursor) {
          break;
        }
        i++;
      }
    } catch (err) {
      console.log(err);
    }
  },
  methods: {
    sortFollowers(a, b) {
      return a.followers_count - b.followers_count;
    },
    async unfollow(user) {
      try {
        this.unfollowed.push(user.id);
        await this.$axios.$post("/api/follow/unfollow", {
          screen_name: user.screen_name
        });
      } catch (err) {
        console.log(err);
        this.unfollowed = this.unfollowed.filter(i => i != user.id);
      }
    },
    async loadFollow($state) {
      try {
        const sortArch = this.sortFollowers;
        const screen_name = "kotamats",
          cursor = this.followCursor;
        const res = await this.$axios.$get("/api/follow/follows", {
          params: {
            screen_name,
            cursor
          }
        });
        this.follows = [...this.follows, ...res.users].sort(sortArch);
        this.followCursor = res.next_cursor;
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
    },
    async loadFollower($state) {
      try {
        const sortArch = this.sortFollowers;
        const screen_name = "kotamats",
          cursor = this.followerCursor;
        const res = await this.$axios.$get("/api/follow/followers", {
          params: {
            screen_name,
            cursor
          }
        });
        this.followers = [...this.followers, ...res.users].sort(sortArch);
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
      followerCursor: null,
      follows: [],
      followCursor: null,
      unfollowed: []
    };
  }
};
</script>

<style>
.lists {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}
</style>
