<template>
  <div id="app">
    <div ref="square" class="square"></div>
    <div ref="circle" class="circle"></div>
    <router-view/>
  </div>
</template>

<script>

export default {
  name: "App",
  data () {
    return {
      positionX: 0,
      positionY: 0
    }
  },
  mounted () {
    setInterval(() => {
      this.$refs.square.style.left = "50px"
      this.$refs.circle.style.bottom = "-200px"
    }, 500)
  }
}
</script>
