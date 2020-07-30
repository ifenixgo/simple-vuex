import Vue from 'vue'
// import Vuex from 'vuex'
import Vuex from '../vuex-modules' // 使用自己写的simple vuex

Vue.use(Vuex)
const persits = (store) => {
  store.subscribe((mutation, state) => {
    localStorage.setItem('vuex-persits-state', JSON.stringify(state))
  })
}
export default new Vuex.Store({
  plugins:[
    persits
  ],
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
    a: {
      state: {
        a: 1
      },
      modules: {
        c: {
          state: {
            c: 1
          },
          mutations: {
            addOneToNumber (state, payload) {
              console.log('mutation is calling in C')
            }
          }
        }
      }
    },
    b: {
      state: {
        b: 2
      }
    }
  }
})
