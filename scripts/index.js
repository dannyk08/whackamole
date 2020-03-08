const GAME_PROPERTIES = {
  objects: {
    mole: {
      image: '/images/mr-meseeks.png'
    },
    mallet: {
      image: '/images/mallet.png'
    },
    dirt: {
      image: '/images/dirt.png'
    }
  }
}

window.onload = function onDocumentLoad() {
  // TODO:
  // make sure there can only be one instance of the game
  new WhackAMoleGame()
}

class WhackAMoleGame {
  boardSize = 5
  scoreBoard = new ScoreBoard()
  boardEl
  moleField

  constructor() {
    this._initialize()
  }

  get isGameValid() {
    return this.scoreBoard.timeRemaining > 0
  }

  _initialize() {
    this._gameHome()

    let storageScoreRecord = localStorage.getItem('whackamoleScoreRecord')
    if (storageScoreRecord != null) {
      this.scoreBoard.updateScoreRecord = storageScoreRecord
    }

    document.addEventListener('click', this._gameClickListeners.bind(this), false)
    document.addEventListener('whackamoleGameOver', this._handleGameOverEvent.bind(this), false)
  }

  _gameClickListeners(e) {
    let currentTarget = e.target
    if (currentTarget.id == 'startGame') {
      this._handleClickStartGame()
    }
    if (currentTarget.className.includes('mole')) {
      this._handleClickedMole(currentTarget)
    }
  }

  _handleGameOverEvent(e) {
    this.molesCollection = []
    this._gameHome(true)
  }

  _handleClickStartGame() {
    this._gameStart()
  }

  _handleClickedMole(moleEl) {
    if (this.isGameValid) {
      let clickedMole = this._getClickedMole(moleEl)
      if (!clickedMole) return

      this.scoreBoard.updateScore = this.scoreBoard.points += clickedMole.points
      clickedMole.hide()
    }
  }

  _getClickedMole(moleEl) {
    return this.molesCollection.find(({ id }) => moleEl.id == id)
  }

  _gameHome(gameOver) {
    this.boardEl = document.getElementById('gameBoard')
    this.boardEl.innerHTML = ''
    this.boardEl.appendChild(this._createGameHomeEl(gameOver))
  }

  _gameStart() {
    this.molesCollection = this._createMolesCollection()

    this.boardEl = document.getElementById('gameBoard')
    this._createBoardEl()

    this.scoreBoard.startCountDown()
  }

  _createGameHomeEl(gameOver) {
    let gameStart = document.createElement('div')
    let homeScreen = document.createElement('div')
    let startGameAgain = `<h2>Game Over</h2>`
    let startGameButton = `<button id="startGame" 
      class="button start-game arcade-font x-sm">
        Start Game
      </button>
    `

    homeScreen.classList.add('home-screen')
    homeScreen.innerHTML = gameOver ? (startGameAgain + startGameButton) : startGameButton

    gameStart.classList.add('board')
    gameStart.appendChild(this.scoreBoard.boardEl)
    gameStart.appendChild(homeScreen)

    return gameStart
  }

  _createBoardEl() {
    this.moleField = this._createMoleField()
    let [board] = document.getElementsByClassName('board')

    board.innerHTML = ''
    board.appendChild(this.scoreBoard.boardEl)
    board.appendChild(this.moleField)
  }

  _createMoleField() {
    let field = document.createElement('div')
    field.classList.add('mole-field')

    this.molesCollection.forEach(mole => {
      let hole = this._createHole(mole)
      field.appendChild(hole)
    })

    return field
  }

  _createDirtImage() {
    let dirtImage = document.createElement('img')
    dirtImage.classList.add('dirt')
    dirtImage.setAttribute('src', GAME_PROPERTIES.objects.dirt.image)
    return dirtImage
  }

  _createHole(mole) {
    let hole = document.createElement('div')
    let dirtImage = this._createDirtImage()

    hole.classList.add('hole')
    hole.appendChild(mole.domElement)
    hole.appendChild(dirtImage)

    return hole
  }

  _createMolesCollection() {
    return Array
      .from(new Array(this.boardSize).fill(null))
      .map(() => new Mole())
  }
}

class ScoreBoard {
  gameOverEvent = new Event('whackamoleGameOver')

  boardEl
  recordScoreEl
  scoreEl
  timeTrackerEl
  countdownInterval = null
  // maxTimeAllowed = 1000 * 60 // 1 minute
  maxTimeAllowed = 1000 * 30

  scoreBoardClass = 'scoreboard'
  scoreBoardPointsRecordClass = 'scoreboard-record'
  scoreBoardPointsClass = 'scoreboard-points'
  scoreBoardTimeTrackerClass = 'scoreboard-tracker'
  scoreRecord = 0
  points = 0
  timeRemaining = 0

  constructor() {
    this.initialize()
  }

  get currentScoreRecord() {
    return `${this.scoreRecord}pts`
  }
  get currentScore() {
    return `${this.points}pts`
  }
  get timeLeft() {
    let minutes = Math.floor(this.timeRemaining / (1000 * 60))
    let seconds = Math.floor((this.timeRemaining / 1000) % 60)
    if (seconds < 10) {
      seconds = `0${seconds}`
    }
    if (minutes < 10) {
      minutes = `0${minutes}`
    }
    return `${minutes}:${seconds}`
  }

  set updateScoreRecord(record) {
    this.scoreRecord = record
    this.recordScoreEl.innerHTML = this._updateBoardComponent('Record', this.currentScoreRecord)
  }
  set updateScore(points) {
    this.points = points
    this.scoreEl.innerHTML = this._updateBoardComponent('Points', this.currentScore)
  }

  initialize() {
    this.boardEl = this._createBoardEl()
    this.recordScoreEl = this._createHighScoreTracker()
    this.scoreEl = this._createPointsTracker()
    this.timeTrackerEl = this._createTimeTracker()

    this.boardEl.appendChild(this.recordScoreEl)
    this.boardEl.appendChild(this.scoreEl)
    this.boardEl.appendChild(this.timeTrackerEl)
  }

  startCountDown() {
    if (this.countdownInterval == null) {
      this.updateScore = 0
      this.timeRemaining = this.maxTimeAllowed
      this.timeTrackerEl.innerHTML = this._updateBoardComponent('Time', this.timeLeft)

      this.countdownInterval = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining -= 1000
          this.timeTrackerEl.innerHTML = this._updateBoardComponent('Time', this.timeLeft)
        } else {
          clearInterval(this.countdownInterval)
          this.countdownInterval = null

          if (this.points > this.scoreRecord) {
            this.updateScoreRecord = this.points
            localStorage.setItem('whackamoleScoreRecord', this.points)
          }
          document.dispatchEvent(this.gameOverEvent)
        }
      }, 1000);
    }
  }

  _createBoardEl() {
    let scoreBoard = document.createElement('div')
    scoreBoard.classList.add(this.scoreBoardClass)
    return scoreBoard
  }

  _createPointsTracker() {
    let pointsTracker = document.createElement('p')
    pointsTracker.classList.add(this.scoreBoardPointsClass)
    pointsTracker.innerHTML = this._updateBoardComponent('Points', this.currentScore)
    return pointsTracker
  }

  _createTimeTracker() {
    let timeTracker = document.createElement('p')
    timeTracker.classList.add(this.scoreBoardTimeTrackerClass)
    timeTracker.innerHTML = this._updateBoardComponent('Time', this.timeLeft)
    return timeTracker
  }

  _createHighScoreTracker() {
    let recordTracker = document.createElement('p')
    recordTracker.classList.add(this.scoreBoardPointsRecordClass)
    // TODO: Update the highscore when the current game session is over
    recordTracker.innerHTML = this._updateBoardComponent('Record', this.currentScoreRecord)
    return recordTracker
  }

  _updateBoardComponent(label, currentScore) {
    return `
      <span class="arcade-font sm">${label}</span>
      <span class="arcade-font">${currentScore}</span>
    `
  }

}

class Mole {
  moleClass = 'mole'
  hiddenClass = 'hidden'
  // maxPoints = 10000
  maxPoints = 250
  minTimeout = 2000

  constructor(obj) {
    this.currentTimeout = null

    this.points = this.generateRandomNumber(this.maxPoints)
    this.timeRemaining = this.generateRandomTimeout()
    this.id = this.generateRandomNumber(Date.now())

    this.domElement = this._createImgEl()
    this._setHideTimeout()
  }

  get isMoleHidden() {
    return this.domElement.classList.contains(this.hiddenClass)
  }

  generateRandomNumber(limit = 4000) {
    return Math.floor(limit * Math.random())
  }

  generateRandomTimeout(num) {
    return Math.max(this.minTimeout, this.generateRandomNumber(num))
  }

  _clearCurrentTimeout() {
    clearTimeout(this.currentTimeout)
    this.currentTimeout = null
  }

  _resetCurrentTimeout() {
    this._clearCurrentTimeout()
    this.timeRemaining = this.generateRandomTimeout()
    this._setHideTimeout()
  }

  _setHideTimeout() {
    if (this.currentTimeout == null) {
      this.show()
      this.currentTimeout = setTimeout(this._handleHideTimeout.bind(this), this.timeRemaining);
    }
  }

  _handleHideTimeout() {
    this._clearCurrentTimeout()
    this.hide()
  }

  _createImgEl() {
    let image = document.createElement('img')
    image.classList.add(this.moleClass)
    image.id = this.id
    image.setAttribute('src', GAME_PROPERTIES.objects.mole.image)
    return image
  }

  hide() {
    if (!this.isMoleHidden) {
      this.domElement.classList.add(this.hiddenClass)
      setTimeout(() => {
        this._resetCurrentTimeout()
      }, this.generateRandomTimeout());
    }
  }

  show() {
    if (this.isMoleHidden) {
      this.domElement.classList.remove(this.hiddenClass)
    }
  }
}
