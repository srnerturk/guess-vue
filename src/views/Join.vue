<template>
  <div class="container">
    <div class="header">
      <img src="@/assets/images/salla_mation.png" alt="logo"/>
    </div>
    <div class="content-wrapper">
      <div class="help-bot">
        <img src="@/assets/images/help-bot.png" alt="help-bot"/>
        <div class="speak">
          <p ref="speakBot">{{ botText }}</p>
        </div>
      </div>
      <div class="body">
        <div v-if="status==='not-started'" class="start-game-form">
          <div class="input">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="feather feather-user">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <input v-model="pin" type='text' id='txtGameId' placeholder="Pin">
          </div>
          <div class="input">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="feather feather-unlock">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
            </svg>
            <input @keypress.enter="join" v-model="username" type='text' id='txtUsername' placeholder="Username">
          </div>
          <button @click="join" class="button" id='btnJoin'>Join Game</button>
        </div>
        <div v-if="status==='started'" class="content started-form">
          <h1>Girdin</h1>
          <h3>Takma Adını Ekranda Görüyor musun?</h3>
        </div>
        <div v-if="isBusy && status ==='answer'" class="content started-form">
          <h1>Bekle</h1>
          <h3>Yeni soru gelmek üzere!</h3>
          <h1>Şu anda {{ order }}. sıradasın.</h1>
        </div>
        <div v-if="status==='answer' && !isBusy" class="content answer-form">
          <div class="question">
            {{ question.question }}
          </div>
          <div class="input">
            <input @keypress.enter="sendAnswer" v-model="answerText" type="number" placeholder="cevabınızı girin.">
          </div>
          <button @click="sendAnswer" class="button">Gönder</button>
        </div>
        <div v-if="status==='finish'" class="finish">
          <Fw :boxHeight="'100%'" :boxWidth="'100%'"/>
          <div class="second">
            <div class="user">
              <span>{{ getUserForPodiumByIndex(1).username }}</span>
              <h5>{{ getUserForPodiumByIndex(1).score }}</h5>
            </div>
          </div>
          <div class="first">
            <div class="user">
              <span>{{ getUserForPodiumByIndex(0).username }}</span>
              <h5>{{ getUserForPodiumByIndex(0).score }}</h5>
            </div>
          </div>
          <div class="third">
            <div class="user">
              <span>{{ getUserForPodiumByIndex(2).username }}</span>
              <h5>{{ getUserForPodiumByIndex(2).score }}</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Fw from "@/components/Fw"

export default {
  name: "Join",
  components: { Fw },
  data () {
    return {
      pin: "",
      username: "",
      botText: "Oyuna Hoşgeldin",
      status: "not-started",
      question: null,
      answerText: "",
      user: null,
      isBusy: false,
      isAnswerSend: false,
      botIndex: 0,
      podium: [],
      order: 0,
      botMessages: [
        "Toplam 40 soru vardır.",
        " Her soru için tahminde bulunma süresi 20 sn’dir.",
        "Tüm cevaplar numeriktir. Negatif bir cevap yoktur.",
        "Cevaba en yakın tahminde bulunan, podyumda en üst sıralarda yer alır.",
        "Bu yüzden tüm puanların toplamı en az olan bu yarışma da üst sıralarda yer alacaktır.",
        "Soruların bazılarında kaç ton’dur, kaç bin’dir gibi soru cümlesi olabilir. Bu soru cümlelerine dikkat ederek tahminde bulununuz.",
        "Süre bitiminde bir tahminde bulunamadıysanız, cevabınız 0 olarak kabul edilir.",
        "Hadi Başlayalım"
      ]
    }
  },
  mounted () {
    setInterval(() => {
      if (this.botIndex <= this.botMessages.length - 1) {
        this.botText = this.botMessages[this.botIndex]
      }
      this.botIndex += 1
    }, 4000)
  },
  sockets: {
    join (data) {
      if (data.isError) {
        this.botText = "Ups :("
        this.$swal("Error", data.message, "error")
      } else {
        this.status = "started"
        this.user = data
      }
    },
    finish () {
      this.status = "finish"
      this.botText = "Game over :)"
    },
    crash () {
      this.pin = ""
      this.username = ""
      this.$swal("Error", "Oyun kurucu oyundan ayrıldı", "error")
      this.status = "not-started"
    },
    podium (data) {
      this.podium = data.podium
      this.order = this.podium.map(i => i.userId).indexOf(this.user.id) + 1
    },
    answer (data) {
      this.isAnswerSend = false
      this.isBusy = false
      this.botText = "yeni bir soru daha :) "
      this.status = "answer"
      this.question = data
      this.answerText = ""
    },
    timeout () {
      if (!this.isAnswerSend) {
        this.$swal("Error", "Süreniz doldu,cevabınız sıfır kabul edilecek", "error")
        this.$socket.emit("answer", {
          roomId: this.pin,
          questionIndex: this.question.index,
          answer: 0,
          userId: this.user.id,
          username: this.user.username
        })
        this.isBusy = true
        this.isAnswerSend = true
      }
    }
  },
  methods: {
    join () {
      this.$socket.emit("join", {
        room: this.pin,
        username: this.username
      })
    },
    getUserForPodiumByIndex (index) {
      return this.podium[index] || { username: "empty", score: 0 }
    },
    sendAnswer () {
      this.$socket.emit("answer", {
        roomId: this.pin,
        questionIndex: this.question.index,
        answer: this.answerText,
        userId: this.user.id,
        username: this.user.username
      })
      this.answerText = ""
      this.botText = "Cevap gönderildi bro."
      this.isBusy = true
      this.isAnswerSend = true
    }
  }
}
</script>

<style lang="scss">
.container {
  display: flex;
  position: fixed;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .header {
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      max-width: 130px;
      margin-bottom: 40px;
    }
  }

  .content-wrapper {
    .help-bot {
      position: absolute;
      font-weight: 300;
      z-index: 5;
      right: 10px;
      bottom: 10px;
      animation: shake 7s;
      animation-iteration-count: infinite;

      img {
        width: 170px;
      }

      .speak {
        position: absolute;
        top: -40px;
        right: 20px;
        background: #fff;
        border-radius: 6px;
        padding: 20px;

        p {
          height: 20px;
          overflow: hidden; /* Ensures the content is not revealed until the animation */
          white-space: nowrap; /* Keeps the content on a single line */
          margin: 0 auto; /* Gives that scrolling effect as the typing happens */
          letter-spacing: .15em;
          animation: typing 3.5s steps(40, end),
        }

      }
    }

    display: flex;
    align-items: center;
    justify-content: center;

    .start-game-form {
      max-width: 540px;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 4px;
      align-items: center;
      justify-content: center;
      padding: 20px;

      .input {
        margin-bottom: 15px;
      }
    }

    .body {
      .finish {
        display: flex;
        justify-content: space-between;
        width: 500px;
        height: 300px;
        align-items: flex-end;

        .first, .second, .third {
          background: red;
          flex: 1;
          margin: 5px;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
          border: 2px solid #fff;
          display: flex;
          align-items: center;
          justify-content: center;

          .user {
            font-size: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;

            span {
              font-size: 300;
              color: #fff;
              letter-spacing: 0.15em;
            }

            h5 {
              color: #fff;
              margin-top: 20px;
              font-weight: 700;
              line-height: 42px;
            }
          }
        }

        .first {
          height: 300px;
          background: #c0392b;
        }

        .second {
          height: 200px;
          background: #1D0543;
        }

        .third {
          background: #8e44ad;
          height: 100px;
        }
      }

      .answer-form {
        .question {
          margin-bottom: 40px;
        }

        .input {
          input {
            padding-left: 10px;
          }

          margin-bottom: 20px;
        }
      }

      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      .content {
        text-align: center;
        background: #fff;
        opacity: 1;
        font-size: 32px;
        padding: 30px;
        border-radius: 4px;
        color: #3F1481;
        margin-top: 50px;
        font-weight: bolder;
        max-width: 610px;

        h1 {
          font-size: 24px;
          font-weight: 700;
          line-height: 42px;
        }

        h3 {
          font-size: 18px;
          font-weight: 500;
          line-height: 32px;
        }
      }
    }
  }
}

@keyframes shake {
  0% {
    transform: translate(1px, 1px) rotate(0deg);
  }
  10% {
    transform: translate(-1px, -2px) rotate(-1deg);
  }
  20% {
    transform: translate(-3px, 0px) rotate(1deg);
  }
  30% {
    transform: translate(3px, 2px) rotate(0deg);
  }
  40% {
    transform: translate(1px, -1px) rotate(1deg);
  }
  50% {
    transform: translate(-1px, 2px) rotate(-1deg);
  }
  60% {
    transform: translate(-3px, 1px) rotate(0deg);
  }
  70% {
    transform: translate(3px, 1px) rotate(-1deg);
  }
  80% {
    transform: translate(-1px, -1px) rotate(1deg);
  }
  90% {
    transform: translate(1px, 2px) rotate(0deg);
  }
  100% {
    transform: translate(1px, -2px) rotate(-1deg);
  }
}

@keyframes typing {
  from {
    width: 0
  }
  to {
    width: 100%
  }
}

@media only screen and (max-width: 720px) {
  .help-bot {
    display: none;
  }
}
</style>
