<template>
  <div id="app">
    <!-- 每个组件实例下都会挂载一个$store属性, 其中存放的是store文件中定义好的属性 -->
    {{$store.state.number}}
    {{$store.getters.doubleNmuber}}
    <button @click="addNumber">Number + 10</button>
    <button @click="addNumberInAction">Number + 1</button>
    {{$store.state}}
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted () {
    // setInterval(() => {
    //   this.$store.state.number ++
    // }, 1000)
    // console.log(this.$store._modules)
  },
  methods: {
    addNumber () {
      this.$store.commit('addNumber', 10)
    },
    addNumberInAction () {
      this.$store.dispatch('addOneToNumber', 1)
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
