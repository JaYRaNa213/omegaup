import Vue from 'vue';
import Vuex from 'vuex';

/**
 * Centralized Vuex installation for OmegaUp.
 * This ensures that Vue.use(Vuex) is called exactly once across the entire
 * application bundle, avoiding the "[vuex] already installed" warning
 * in Vue 3 compat mode.
 */
Vue.use(Vuex);

export default Vuex;
export * from 'vuex';
