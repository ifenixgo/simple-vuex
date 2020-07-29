let Vue

// 创建一个Store类
class Store {
  constructor (options = {}) {
    // 在构造函数中将构建Store时参数里的state属性赋给Store实例的state属性
    // this.state = options.state

    // 为Store定义一个内部属性_s, 将构建Store时参数里的state属性赋给Store实例的_s属性
    // 将其放置在一个新的Vue实例中, 是为了将state中的数据响应式化
    this._s = new Vue({
      data () {
        return {
          state: options.state
        }
      }
    })

    // 在构造函数中将构建Store时参数里的getters属性赋值给Store实例的getters属性
    let getters = options.getters
    this.getters = {}

    // 迭代构建Store时参数里的getters属性, 将每个属性通过Object.defineProperty的方式挂载到Store实例的getters属性上
    Object.keys(getters).forEach((getterName) => {
      Object.defineProperty(this.getters, getterName, {
        // 当取Store实例的getters属性中的各个属性的值的时候, 返回的是属性对应的方法的运行结果
        get: () => {
          return getters[getterName](this.state)
        }
      })
    })

    // 为Store定义一个属性mutations, 将构建Store时参数里的mutations属性赋给Store实例的mutations属性
    let mutations = options.mutations
    this.mutations = {}

    // 迭代构建Store时参数里的mutations属性, 将对应的方法挂载在Store实例mutations属性上
    Object.keys(mutations).forEach((mutationName) => {
      this.mutations[mutationName] = (payload) => {
        mutations[mutationName](this.state, payload)
      }
    })

    // 为Store定义一个属性actions, 将构建Store时参数里的actions属性赋给Store实例的actions属性
    let actions = options.actions
    this.actions = {}

    // 迭代构建Store时参数里的actions属性, 将对应的方法挂载在Store实例actions属性上
    Object.keys(actions).forEach((actionName) => {
      this.actions[actionName] = (payload) => {
        actions[actionName](this, payload)
      }
    })
  }

  // 为Store 实例定义一个state属性访问器, 当访问到store.state时, 实际访问的是_s.state, 也就是拿到了_s属性对应的Vue实例里data的state
  get state () {
    return this._s.state
  }

  commit = (mutationName, payload) => {
    this.mutations[mutationName](payload)
  }

  dispatch = (actionName, payload) => {
    this.actions[actionName](payload)
  }
}

// 当使用Vue.use方法时会调用此方法，Vue会将Vue实例赋给install的参数，也就是下面的_Vue
const install = (_Vue) => {
  Vue = _Vue
  console.log('Calling install')

  // 调用mixin方法，使得给Vue中的每个组件都添加$store属性
  Vue.mixin({
    // 每个组件实例创建前执行, 包括根组件
    beforeCreate () {
      // 当Vue实例中有配置属性时, 并且配置了store属性时, 将其挂在在实例的$store属性下
      if (this.$options && this.$options.store) {
        // 此时必为根组件
        this.$store = this.$options.store

        //否则是根组件下的各个子组件,则将父组件下的$store属性值挂载到子组件自己实例下的$store属性
      } else {
        this.$store = this.$parent && this.$parent.$store
      }
      console.log(this)
    }
  })
}

// 默认导出一个对象，此对象拥有一个install方法，用来在Vue.use方法中调用
export default {
  install,
  Store
}