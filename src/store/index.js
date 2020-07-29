import Vue from 'vue'
// import Vuex from 'vuex'
import Vuex from '../vuex' // 使用自己写的simple vuex

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    number: 10
  },
  getters: {
    doubleNmuber (state) {
      return state.number * 2
    }
  },
  mutations: {
    addNumber (state, payload) {
      state.number += payload
    },
    addOneToNumber (state, payload) {
      state.number += payload
    }
  },
  actions: {
    addOneToNumber ({commit}, payload) {
      setTimeout(() => {
        commit('addOneToNumber', 1)
      }, 1000)
    }
  },
  modules: {
  }
})
