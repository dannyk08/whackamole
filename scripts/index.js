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
    // TODO: start the countdown when the user clicks `start`
    // setTimeout(() => {
    this._initialize()
    this.scoreBoard.startCountDown()
    // }, 3 * 1000);
  }

  get isGameValid() {
    return this.scoreBoard.timeRemaining > 0
  }

  _initialize() {
    this.molesCollection = this._createMolesCollection()
    this._createBoard()

    document.addEventListener('click', this._gameClickListeners.bind(this), false)
    // TODO:
    // create a custom event listener to listen when the scoreboard countdown is at zero

  }

  _gameClickListeners(e) {
    let currentTarget = e.target
    if (currentTarget.className.includes('mole')) {
      this._handleClickedMole(currentTarget)
    }
  }

  _getClickedMole(moleEl) {
    return this.molesCollection.find(({ id }) => moleEl.id == id)
  }

  _handleClickedMole(moleEl) {
    if (this.isGameValid) {
      let clickedMole = this._getClickedMole(moleEl)
      if (!clickedMole) return

      this.scoreBoard.updateScore = this.scoreBoard.points += clickedMole.points
      clickedMole.hide()
    } else { // TODO: when custom event listener is created; perform this cleanup
      this.moleField.innerHTML = ''
      this.molesCollection = []
    }
  }

  _createBoard() {
    this.boardEl = document.getElementById('gameBoard')
    this.boardEl.innerHTML = ''
    this.boardEl.appendChild(this._createContentBoard())
  }

  _createContentBoard() {
    let board = document.createElement('div')
    this.moleField = this._createMoleField()

    board.classList.add('board')
    board.appendChild(this.scoreBoard.boardEl)
    board.appendChild(this.moleField)

    return board
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
  boardEl
  recordScoreEl
  scoreEl
  timeTrackerEl
  countdownInterval = null
  // maxTimeAllowed = 1000 * 60 * 3 // 3 minutes
  maxTimeAllowed = 1000 * 60

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
      this.timeRemaining = this.maxTimeAllowed
      this.timeTrackerEl.innerHTML = this._updateBoardComponent('Time', this.timeLeft)

      this.countdownInterval = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining -= 1000
          this.timeTrackerEl.innerHTML = this._updateBoardComponent('Time', this.timeLeft)
        } else {
          clearInterval(this.countdownInterval)
          this.countdownInterval = null
          console.log('clearing interval', this.countdownInterval)
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
  active
  moleClass = 'mole'
  hiddenClass = 'hidden'
  // maxPoints = 10000
  maxPoints = 250
  minTimeout = 2000

  constructor(obj) {
    // Mole should be hiding/showing if it's active
    this.active = obj && obj.active || false
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
