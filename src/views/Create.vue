<template>
  <div class="join">
    <div v-if="time<6 && time>0" class="time-section">
      <h1>{{time}}</h1>
    </div>
    <Header :room="room"/>
    <div class="content-wrapper">
      <div class="top-section">
      <div class="left-align">
        <div class="counter user-counter">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span id="userCount">{{getPlayers.length}}</span>
        </div>
          <div class="counter user-counter">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-clock"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span id="divTimer">{{time}}</span>
        </div>
      </div>
      <div class="center-align">
        <img src="@/assets/images/salla_mation.png" alt="logo" />
      </div>
      <div class="right-align">
        <button @click="newGame" v-if="status==='not-started'" class="button" id='btnCreate'>New Game</button>
        <button @click="startGame" v-if="status==='created'" class="button" id='btnStart'>Start Game</button>
        <button @click="nextQuestion" v-if="status==='started'" class="button" id='btnNext'>Next Question</button>
        <button @click="finishGame" v-if="status==='last'" class="button" id='btnFinish'>Finish</button>
      </div>
    </div>
      <div class="body">
        <div v-if="players.length===0 && status==='created'" class="content waiting-players">
          <h3>Oyuncular Bekleniyor</h3>
        </div>
        <div v-if="players.length > 0 && status==='created'"  class="players">
          <div v-for="player in getPlayers" :key="player.id" class="player">
            <span>{{player.username}}</span>
          </div>
        </div>
        <div v-if="(status==='started'||status==='last') && question" class="content questions">
          <div class="question">
            <h5>{{parseInt(question.id)+1}}. {{question.question}}</h5>
          </div>
          <div v-if="time===0" class="answer">
            <span clas>Doğru Cevap: {{question.answer}}</span>
          </div>
        </div>
        <div v-if="status==='started' && time===0 && podium.length>0" class="podium">
          <div v-for="(item,index) in podium" :key="index" class="podium-item">
            <div class="left">
              <span>{{parseInt(index)+1}}. {{item.username}}</span>
            </div>
            <div class="right">
              <h5>{{item.score}}</h5>
            </div>
          </div>
        </div>
        <div v-if="status==='finish'" class="finish">
           <Fw :boxHeight="'100%'" :boxWidth="'100%'"/>
          <div class="second">
            <div class="user">
              <span>{{getUserForPodiumByIndex(1).username}}</span>
              <h5>{{getUserForPodiumByIndex(1).score}}</h5>
            </div>
          </div>
          <div class="first">
            <div class="user">
              <span>{{getUserForPodiumByIndex(0).username}}</span>
              <h5>{{getUserForPodiumByIndex(0).score}}</h5>
            </div>
          </div>
          <div class="third">
            <div class="user">
              <span>{{getUserForPodiumByIndex(2).username}}</span>
              <h5>{{getUserForPodiumByIndex(2).score}}</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Header from "@/components/Header"
import Fw from "@/components/Fw"
export default {
  name: "Create",
  components: {
    Header,
    Fw
  },
  data () {
    return {
      time: 0,
      status: "not-started",
      room: "XXXXXX",
      players: [],
      question: null,
      timeout: null,
      podium: []
    }
  },
  computed: {
    getPlayers () {
      return this.players.filter(x => x.role === "player")
    }
  },
  sockets: {
    create (data) {
      this.room = data.room
      this.status = "created"
      console.log("server answer", data)
    },
    users (data) {
      console.log("users", data)
      this.players = data
    },
    podium (data) {
      this.podium = data.podium
    },
    crash () {
      this.status = "not started"
    },
    start (data) {
      this.time = 20
      this.question = data
      // eslint-disable-next-line no-unused-vars
      this.timeout = setInterval(() => {
        this.time -= 1
      }, 1000)
    },
    nextQuestion (data) {
      if (data) {
        this.time = 20
        this.question = data.question
        // eslint-disable-next-line no-unused-vars
        this.timeout = setInterval(() => {
          this.time -= 1
        }, 1000)
        if (data.isLast) {
          this.status = "last"
        }
      }
    }
  },
  watch: {
    time: {
      handler (val) {
        console.log(val)
        if (val === 1) {
          this.$socket.emit("timeout", {
            roomId: this.room
          })
        }
        if (val === 0) {
          clearInterval(this.timeout)
        }
      }
    }
  },
  methods: {
    getUserForPodiumByIndex (index) {
      return this.podium[index] || { username: "empty", score: 0 }
    },
    newGame () {
      const payLoad = {
        method: "create",
        role: "admin"
      }
      this.$socket.emit("create", payLoad)
    },
    finishGame () {
      this.status = "finish"
      this.$socket.emit("finish", { roomId: this.room })
    },
    startGame () {
      this.status = "started"
      this.$socket.emit("start", { roomId: this.room })
    },
    nextQuestion () {
      if (this.time > 0) {
        this.$swal("Error", "Henüz süre bitmedi", "error")
      } else {
        this.$socket.emit("nextQuestion", { roomId: this.room })
      }
    }
  }
}
</script>

<style lang="scss">
.time-section{
  position: fixed;
  z-index: 10;
  width: 100%;
  height: 100%;
  background: rgba($color: #000000, $alpha: 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  h1{
    font-weight: 700;
    color:#fff;
    font-size: 72px;
  }
}
.content-wrapper{
   width: 100%;
   .top-section{
    display: flex;
    justify-content: space-between;
    width: 100%;
    flex-direction: row;
    .left-align{
      padding: 10px;
      flex: 0.5;
      display: flex;
      flex-direction: row;
      .counter{
        background: #1D0543;
        padding: 10px 15px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        max-width: 110px;
        max-height: 30px;
        margin-right: 10px;
        span{
          font-size: 20px;
          font-weight: bolder;
          color: #fff;
          padding-left: 5px;
        }
      }
    }
    .center-align{
      padding: 10px;
      flex: 1;
      align-items: center;
      display: flex;
      justify-content: center;
      img{
        width: 120px;
      }
    }
    .right-align{
      padding: 10px;
      flex: 0.5;
      display: flex;
      justify-content: flex-end;
    }
   }
   .body{
     .finish{
       display: flex;
       justify-content: space-between;
       width: 500px;
       height: 300px;
       align-items: flex-end;
       .first,.second,.third{
         background: red;
         flex:1;
         margin:5px;
         border-top-left-radius: 10px;
         border-top-right-radius: 10px;
         border:2px solid #fff;
         display: flex;
         align-items: center;
         justify-content: center;
         .user{
           font-size: 20px;
           display: flex;
           flex-direction: column;
           align-items: center;
           span{
             font-size: 300;
             color:#fff;
             letter-spacing: 0.15em;
           }
           h5{
             color:#fff;
             margin-top: 20px;
             font-weight: 700;
           }
         }
       }
       .first{
        height: 300px;
         background: #c0392b;
       }
       .second{
        height: 200px;
         background: #1D0543;
       }
       .third{
         background: #8e44ad;
         height: 100px;
       }
     }
     padding:10px;
     display: flex;
     align-items: center;
     justify-content: center;
     flex-direction: column;
     .podium{
       width: 100%;
       margin-top: 50px;
       display: flex;
       align-items: center;
       justify-content: center;
       flex-direction: column;
       max-height: 400px;
       overflow-y: scroll;
       .podium-item{
         margin-top: 10px;
         width: 100%;
         max-width: 500px;
         background: #fff;
         height: 40px;
         border-radius: 6px;
         display: flex;
         justify-content: space-between;
         align-items: center;
         padding:10px;
         color:#3F1481;
         span{
           font-weight: 500;
           font-size: 18px;
         }
         h5{
           font-weight: 700;
           font-size: 32px;
         }
       }
     }
     .content{
       background: #fff;
        opacity: 1;
        font-size: 32px;
        padding: 30px;
        border-radius: 4px;
        color: #3F1481;
        margin-top: 50px;
        font-weight: bolder;
        max-width: 610px;
        h3{
          font-size: 18px;
          font-weight: bold;
          line-height: 24px;
        }
        h5{
          line-height: 42px;
        }
        .answer{
          text-align: center;
          margin-top: 20px;
          color: #000;
        }
     }
     .players{
      padding: 10px;
      display: grid;
      grid-template-columns: auto auto auto;
      grid-template-columns: repeat(12, 1fr);
      grid-column-gap: 10px;
      grid-row-gap: 10px;
      .player{
        background: #1D0543;
        color: #fff;
        font-weight: bolder;
        padding: 15px;
        border-bottom: 2px solid #fff;
        border-radius: 4px;
        text-align: center;
        font-size: 24px;
      }
        }
     }
   }
</style>
