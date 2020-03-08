const GAME_PROPERTIES = {
  objects: {
    mole: {
      image: '/images/mole.png'
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
  boardEl
  // boardSize = 5
  boardSize = 1
  board = {
    score: 0,
    timeLeft: 0
  }

  constructor() {
    this.initialize()
  }

  initialize() {
    this.molesCollection = this.createMolesCollection()

    this.boardEl = document.getElementById('gameBoard')
    this.boardEl.innerHTML = ''

    this.boardEl.appendChild(this.createBoard())
    document.addEventListener('click', this.gameClickListeners.bind(this), false)
  }

  gameClickListeners(e) {
    let currentTarget = e.target

    if (currentTarget.className.includes('hole')) {
      let mole = this.getClickedMole(currentTarget.querySelector('.mole'))
      mole.show()
    }

    if (currentTarget.className.includes('mole')) {
      this.handleClickedMole(currentTarget)
    }
  }

  getClickedMole(moleEl) {
    return this.molesCollection.find(({ id }) => moleEl.id == id)
  }

  handleClickedMole(moleEl) {
    // console.log({ moleEl })
    let clickedMole = this.getClickedMole(moleEl)
    if (!clickedMole) return
    // console.log({ clickedMole })
    this.board.score += clickedMole.points
    console.log('new score:', this.board.score)
    clickedMole.hide()
  }

  createBoard() {
    let board = document.createElement('div')
    let moleField = this.createMoleField()
    let scoreBoard = this.createScoreBoard()

    board.classList.add('board')
    board.appendChild(scoreBoard)
    board.appendChild(moleField)

    return board
  }

  getCurrentScore(points) {
    return `Score: ${points}pts`
  }
  getTimeLeft(time) {
    return `Time: ${time}`
  }

  createScoreBoard() {
    let scoreBoard = document.createElement('div')
    let pointsTracker = document.createElement('p')
    let timeTracker = document.createElement('p')

    scoreBoard.classList.add('score-board')
    pointsTracker.innerText = this.getCurrentScore(this.board.score)
    pointsTracker.classList.add('score-board-points')
    timeTracker.innerText = this.getTimeLeft(this.board.timeLeft)
    pointsTracker.classList.add('score-board-timeleft')

    scoreBoard.appendChild(pointsTracker)
    scoreBoard.appendChild(timeTracker)

    return scoreBoard
  }

  createMoleField() {
    let field = document.createElement('div')
    field.classList.add('mole-field')

    this.molesCollection.forEach(mole => {
      let hole = this.createHole(mole)
      field.appendChild(hole)
    })

    return field
  }

  createDirtImage() {
    let dirtImage = document.createElement('img')
    dirtImage.classList.add('dirt')
    dirtImage.setAttribute('src', GAME_PROPERTIES.objects.dirt.image)
    return dirtImage
  }

  createHole(mole) {
    let hole = document.createElement('div')
    let dirtImage = this.createDirtImage()

    hole.classList.add('hole')
    hole.appendChild(mole.domElement)
    hole.appendChild(dirtImage)

    return hole
  }

  createMolesCollection() {
    let collection = []
    for (let i = 0; i < this.boardSize; i++) {
      collection.push(new Mole())
    }
    console.log(collection)
    return collection
  }
}

class Mole {
  moleClass = 'mole'
  hiddenClass = 'hidden'
  maxPoints = 10000
  minTimeout = 2000

  constructor() {
    this.currentTimeout = null

    this.points = this.generateRandomNumber(this.maxPoints)
    this.timeRemaining = this.generateRandomNumber()
    this.id = this.generateRandomNumber(Date.now())

    this.domElement = this.createImg()
    this.setHideTimeout()
  }

  isMoleHidden() {
    return this.domElement.classList.contains(this.hiddenClass)
  }

  clearCurrentTimeout() {
    clearTimeout(this.currentTimeout)
    this.currentTimeout = null
  }

  resetCurrentTimeout() {
    console.log('resetCurrentTimeout')
    this.clearCurrentTimeout()
    this.timeRemaining = this.generateRandomNumber()
    this.setHideTimeout()
  }

  setHideTimeout() {
    if (this.currentTimeout == null) {
      this.show()
      this.currentTimeout = setTimeout(this.handleHideTimeout.bind(this), Math.max(this.minTimeout, this.timeRemaining));
      console.log('timeout set:', this)
    }
  }

  handleHideTimeout() {
    this.clearCurrentTimeout()
    this.hide()
    console.log('timeout done:', this)
  }

  generateRandomNumber(limit = 4000) {
    return Math.floor(limit * Math.random())
  }

  createImg() {
    let image = document.createElement('img')
    image.classList.add(this.moleClass)
    image.id = this.id
    image.setAttribute('src', GAME_PROPERTIES.objects.mole.image)
    return image
  }

  hide() {
    if (!this.isMoleHidden()) {
      this.domElement.classList.add(this.hiddenClass)

      setTimeout(() => {
        this.resetCurrentTimeout()
        // this.show()
      }, this.minTimeout);
      console.log('hiding', this.domElement)
    }
  }

  show() {
    if (this.isMoleHidden()) {
      this.domElement.classList.remove(this.hiddenClass)
      console.log('showing', this.domElement)
    }
    console.log(`@show()`, this.domElement.classList)
  }
}
