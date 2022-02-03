<template>
  <div class="header">
    <div class="header-content">
      <h5>Oyun PIN'i</h5>
      <h2>{{modifyRoomString}}</h2>
    </div>
  </div>
</template>

<script>
export default {
  name: "Header",
  props: {
    room: String
  },
  computed: {
    modifyRoomString () {
      return `${this.room.substring(0, 3)}-${this.room.substring(3, 6)}`
    }
  }
}
</script>

<style lang="scss">
.header{
    background: var(--header-color);
    height: 130px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .header-content{
      background: var(--guess-white);
      max-width: 500px;
      height: 100px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      flex-direction: column;
      h5{
      font-size: 18px;
      line-height: 32px;
      font-weight: 500;
      }
      h2{
        font-size: 42px;
        font-weight: 700;
        line-height: 54px;
      }
    }
}
</style>
