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
  new WhackAMoleGame()
}

class WhackAMoleGame {
  constructor() {
    this.boardEl = document.getElementById('gameBoard')
    this.boardEl.innerHTML = ''

    this.board = this.createBoard()
    this.boardEl.appendChild(this.board)

    document.addEventListener('click', this.gameClickListeners.bind(this), false)
  }

  gameClickListeners(e) {
    let currentTarget = e.target

    if (currentTarget.className.includes('hole')) {
      let mole = currentTarget.querySelector('.mole')
      mole.classList.remove('hidden')
    }

    if (currentTarget.className.includes('mole')) {
      currentTarget.classList.add('hidden')
    }
  }

  createBoard() {
    let board = document.createElement('div')
    let hole = this.createHole()

    board.classList.add('board')
    board.appendChild(hole)

    return board
  }

  createDirtImage() {
    let dirtImage = document.createElement('img')
    dirtImage.classList.add('dirt')
    dirtImage.setAttribute('src', GAME_PROPERTIES.objects.dirt.image)
    return dirtImage
  }
  createHole() {
    let hole = document.createElement('div')
    let dirtImage = this.createDirtImage()
    let newMole = this.createMole()

    hole.classList.add('hole')
    hole.appendChild(newMole.domElement)
    hole.appendChild(dirtImage)

    return hole
  }

  createMole() {
    let mole = new Mole()
    return mole
  }
}

class Mole {
  constructor() {
    this.domElement = this.createImg()
    this.points = Math.floor(10000 * Math.random())
    this.timeRemaining = Math.floor(5000 * Math.random())
  }

  createImg() {
    let image = document.createElement('img')
    image.classList.add('mole')
    image.setAttribute('src', GAME_PROPERTIES.objects.mole.image)
    return image
  }

  hide() {
    this.domElement.classList.add('hidden')
  }
}
