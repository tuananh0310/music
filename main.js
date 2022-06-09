// 1. Render songs
// 2. Scroll top
// 3. Play / pause / seek
// 4. CD rotate 
// 5. Next / prev 
// 6. Random 
// 7. Next / Repeat when ended 
// 8. Active song 
// 9. Scroll active song into view 
// 10. Play song when click 

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'TA_PLAYER'

const playlist = $('.playlist')
const player  = $ ('.player')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: true,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'I Like You (A Happier Song)',
            singer: 'Post Malone, Doja Cat',
            path: './assets/mp3/song6.mp3',
            image: './assets/image/song6.jpg',
        },
        {
            name: 'Peter Pan Was Right',
            singer: 'Anson Seabra',
            path: './assets/mp3/song1.mp3',
            image: './assets/image/song1.jpg'
        },
        {
            name: 'With You (Ngẫu Hứng)',
            singer: 'Nick Strand',
            path: './assets/mp3/song2.mp3',
            image: './assets/image/song2.jpg'
        },
        {
            name: 'Vanilla Ice Cream',
            singer: 'Earth Patravee',
            path: './assets/mp3/song3.mp3',
            image: './assets/image/song3.jpg',
        },
        {
            name: 'I LOVE U',
            singer: 'The Chainsmokers',
            path: './assets/mp3/song4.mp3',
            image: './assets/image/song4.jpg',
        },
        {
            name: 'Head In the Clouds',
            singer: 'Hayd',
            path: './assets/mp3/song5.mp3',
            image: './assets/image/song5.jpg',
        },
         
    ],
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    }, 
    render: function(){
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
            `
        })
          playlist.innerHTML = htmls.join('')
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
        
    },
    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Xử lí CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 200000, //10 seconds
            interations: Infinity 
        })
        cdThumbAnimate.pause()
        // Xử lí phóng to / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lí khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
               }
        }

       // Khi song được play 
      audio.onplay = function() {
        _this.isPlaying = true
        player.classList.add('playing')
        cdThumbAnimate.play()
      }
      // Khi song bị pause
      audio.onpause = function() {
        _this.isPlaying = false
        player.classList.remove('playing')
        cdThumbAnimate.pause()
      }
      // Khi tiến độ bài hát thay đổi
      audio.ontimeupdate = function() {
          if (audio.duration) {
              const progresspercent = Math.floor(audio.currentTime / audio.duration * 100)
              progress.value = progresspercent
          }
      }
      // Xử lí khi tua song
      progress.oninput = function(e) {
        const seekTime = audio.duration / 100*e.target.value
        audio.currentTime = seekTime
      }

      // Khi next bài hát
      nextBtn.onclick = function() {
          if (_this.isRandom) {
            _this.playRandomSong()
          } else {
              _this.nextSong()
        }
          audio.play()
          _this.render()
          _this.scrollToActiveSong()
      }
      // Khi prev bài hát
      prevBtn.onclick = function() {
        if (_this.isRandom) {
            _this.playRandomSong()
          } else {
              _this.prevSong()
        }
        audio.play()
        _this.render()
        _this.scrollToActiveSong()
    }
      // Xử lí bật tắt random
      randomBtn.onclick = function(e) {
        _this.isRandom = !_this.isRandom
        _this.setConfig('isRandom',_this.isRandom)
        randomBtn.classList.toggle('active', _this.isRandom)
      }
      // Xử lý lặp lại song
      repeatBtn.onclick = function(e) { 
        _this.setConfig('isRepeat',_this.isRepeat)
          
        _this.isRepeat = !_this.isRepeat
        repeatBtn.classList.toggle('active', _this.isRepeat)
      }

      // Xử lý next song khi audio ended
      audio.onended = function() {
          if (_this.isRepeat) {
            audio.play()
          } else {
              nextBtn.click()
             }
      }
      // lang nghe hanh vi click vao playlist
      playlist.onclick = function(e) {
          const songNode = e.target.closest('.song:not(.active)')
          if (songNode || e.target.closest('.option')) {
              
              // Xử lí khi click vào song
            
              if (songNode) {
                _this.currentIndex = Number(songNode.dataset.index)
                _this.loadCurrentSong()
                audio.play()
                _this.render()
              }

              // Xử lí khi click vào song option

              if (e.target.closest('.option')) {

              }
        }
      }

    },
    scrollToActiveSong: function() {
       setTimeout(() => {
        $('.song.active').scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        })
       }, 300)
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
        console.log(heading, cdThumb, audio)
    },
    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function() {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        // Định nghĩa các thuộc tính cho object
        this.defineProperties()
       // Lắng nghe và xử lí các sự kiện (dom events)
        this.handleEvents()
        
        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()
        
        // Render playlist
        this.render()
        // Hiển thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()
