let Vue

class ModuleCollection {
  constructor (options) {
    this.register([], options)
  }
  register (path, rootModule) {
    // console.log(path)
    let module = {
      _rawModule: rootModule,
      _children: {},
      _state: rootModule.state
    }

    if (path.length === 0) {
      this.root = module
    } else {
      let parent = path.slice(0, -1).reduce((root, current) => {
        return root._children[current ]
      }, this.root)
      parent._children[path[path.length - 1]] = module
    }

    if (rootModule.modules) {
      Object.keys(rootModule.modules).forEach(moduleName => {
        // console.log(path.concat(moduleName))
        this.register(path.concat(moduleName), rootModule.modules[moduleName])
      })
    }
  }
}

const installModule = (store, rootState, path, rootModule) => {
  if (path.length > 0) {
    let parent = path.slice(0, -1).reduce((root, current) => {
      return root[current]
    }, rootState)
    Vue.set(parent, path[path.length - 1], rootModule._state)
  }

  let rawGetters = rootModule._rawModule.getters
  console.log(rootModule)
  if (rawGetters) {
    Object.keys(rawGetters).forEach(getterName => {
      Object.defineProperty(store.getters, getterName, {
        get () {
          return rawGetters[getterName](rootModule._state)
        }
      })
    })
  }

  let rawMutations = rootModule._rawModule.mutations
  if (rawMutations) {
    Object.keys(rawMutations).forEach(mutationName => {
      let mutations = store.mutations[mutationName] || []
      mutations.push((payload) => {
        rawMutations[mutationName](rootModule._state, payload)
        store.subscribes.forEach(fn => {
          fn({type: mutationName, payload}, rootState)
        })
      })
      store.mutations[mutationName] = mutations
    })
  }

  let rawActions = rootModule._rawModule.actions
  if (rawActions) {
    Object.keys(rawActions).forEach(actionName => {
      let actions = store.actions[actionName] || []
      actions.push((payload) => {
        return rawActions[actionName](store, payload)
      })
      store.actions[actionName] = actions
    })
  }

  Object.keys(rootModule._children).forEach(moduleName => {
    installModule(store, rootState, path.concat(moduleName), rootModule._children[moduleName])
  })
}
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

    this.getters = {}
    this.mutations = {}
    this.actions = {}
    this.subscribes = []
    this._modules = new ModuleCollection(options)

    // 递归将结果分类
    // this是当前Store实例, this.state是当前实例的state信息, []用来递归使用, this._modules.root是根模块
    installModule(this, this.state, [], this._modules.root)
    console.log(this)

    options.plugins.forEach(plugin => {
      plugin(this)
    })
  }

  subscribe (fn) {
    this.subscribes.push(fn)
  }

  // 为Store 实例定义一个state属性访问器, 当访问到store.state时, 实际访问的是_s.state, 也就是拿到了_s属性对应的Vue实例里data的state
  get state () {
    return this._s.state
  }

  commit = (mutationName, payload) => {
    this.mutations[mutationName].forEach(fn => {
      return fn(payload)
    })
  }

  dispatch = (actionName, payload) => {
    this.actions[actionName].forEach(fn => {
      return fn(payload)
    })
  }
}

// 当使用Vue.use方法时会调用此方法，Vue会将Vue实例赋给install的参数，也就是下面的_Vue
const install = (_Vue) => {
  Vue = _Vue

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
    }
  })
}

// 默认导出一个对象，此对象拥有一个install方法，用来在Vue.use方法中调用
export default {
  install,
  Store
}