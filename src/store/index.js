export const state = () => ({
  access_token: null,
  access_token_secret: null
});
export const mutations = {
  setAccessToken(state, { access_token, access_token_secret }) {
    state.access_token = access_token;
    state.access_token_secret = access_token_secret;
  }
};

export const getters = {
  tokens: state => state
};
export const actions = {
  nuxtServerInit({ commit }, { req }) {
    if (req.session.oauth && req.session.oauth.access_token) {
      commit("setAccessToken", req.session.oauth);
    }
  }
};
