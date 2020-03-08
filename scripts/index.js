const gameProperties = {
  objects: {
    mole: {
      image: '/images/mole.png'
    },
    mallet: {
      image: '/images/mallet.png'
    }
  }
}


window.onload = function onDocumentLoad() {
  let newMoleEl = document.createElement('img')
  newMoleEl.setAttribute('src', gameProperties.objects.mallet.image)
  newMoleEl.onload = function onMoleImgLoad(event) {
    document.body.appendChild(newMoleEl)
  }
  newMoleEl.addEventListener('click', function() {
    console.log('image', this)
    document.body.removeChild(this)
  }.bind(newMoleEl))
}
