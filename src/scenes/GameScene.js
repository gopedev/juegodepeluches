import Phaser from 'phaser'

const niveles = [
  { tipos: ['osito', 'gatito'], frascosExtra: 1 },
  { tipos: ['osito', 'gatito', 'perrito'], frascosExtra: 1 },
  { tipos: ['osito', 'gatito', 'perrito', 'conejo'], frascosExtra: 2 }
]

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
    this.nivelActual = 0
  }

  init(data) {
    this.nivelActual = data.nivel ?? 0
    this.recipientes = []
    this.peluches = []
    this.seleccionado = null
  }

  preload() {
    this.load.image('recipiente', 'assets/recipiente.png')
    this.load.image('osito', 'assets/osito.png')
    this.load.image('gatito', 'assets/gatito.png')
    this.load.image('perrito', 'assets/perrito.png')
    this.load.image('conejo', 'assets/conejo.png')
  }

  create() {
    const configNivel = niveles[this.nivelActual]
    const tipos = configNivel.tipos
    const totalRecipientes = tipos.length + configNivel.frascosExtra
    const espacioX = 800 / (totalRecipientes + 1)
    const baseY = 500

    for (let i = 0; i < totalRecipientes; i++) {
      const x = espacioX * (i + 1)
      const recipiente = this.add.image(x, baseY, 'recipiente').setScale(0.5)
      recipiente.setData('peluches', [])
      recipiente.setData('id', i)
      recipiente.setInteractive()
      this.recipientes.push(recipiente)
    }

    const peluches = []
    tipos.forEach(tipo => {
      for (let i = 0; i < 4; i++) peluches.push(tipo)
    })

    Phaser.Utils.Array.Shuffle(peluches).forEach((tipo, i) => {
      const recipiente = this.recipientes[i % tipos.length]
      const offsetY = -80 * recipiente.getData('peluches').length
      const peluche = this.add.image(recipiente.x, recipiente.y + offsetY, tipo).setScale(0.25).setInteractive()
      peluche.setData('tipo', tipo)
      peluche.setData('contenedorId', recipiente.getData('id'))

      recipiente.getData('peluches').push(peluche)
      this.peluches.push(peluche)
    })

    this.input.on('gameobjectdown', (pointer, gameObject) => {
      if (!this.seleccionado) {
        this.seleccionado = gameObject
        gameObject.setTint(0xffffaa)
      } else {
        if (this.seleccionado !== gameObject) {
          this.intercambiarPeluches(this.seleccionado, gameObject)
        }
        this.seleccionado.clearTint()
        this.seleccionado = null
      }
    })
  }

  intercambiarPeluches(p1, p2) {
    const r1 = this.recipientes.find(r => r.getData('id') === p1.getData('contenedorId'))
    const r2 = this.recipientes.find(r => r.getData('id') === p2.getData('contenedorId'))
    if (r1 === r2) return

    const pila1 = r1.getData('peluches')
    const pila2 = r2.getData('peluches')

    const i1 = pila1.indexOf(p1)
    const i2 = pila2.indexOf(p2)

    pila1[i1] = p2
    pila2[i2] = p1

    p1.setData('contenedorId', r2.getData('id'))
    p2.setData('contenedorId', r1.getData('id'))

    const oY1 = -80 * i2
    const oY2 = -80 * i1

    this.tweens.add({
      targets: p1,
      x: r2.x,
      y: r2.y + oY1,
      duration: 300,
      ease: 'Power2'
    })

    this.tweens.add({
      targets: p2,
      x: r1.x,
      y: r1.y + oY2,
      duration: 300,
      ease: 'Power2',
      onComplete: () => this.checkVictoria()
    })
  }

  checkVictoria() {
    const victoria = this.recipientes.every(r => {
      const peluches = r.getData('peluches')
      if (peluches.length === 0) return true
      const tipo = peluches[0].getData('tipo')
      return peluches.length === 4 && peluches.every(p => p.getData('tipo') === tipo)
    })

    if (victoria) this.mostrarVictoria()
  }

  mostrarVictoria() {
    const mensaje = this.add.text(450, 300, '¡Completaste el nivel! :D', {
      fontSize: '40px',
      color: '#28a745',
      backgroundColor: '#fff',
      fontFamily: 'sans-serif',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(10)

    this.peluches.forEach(p => {
      this.tweens.add({
        targets: p,
        scale: { from: 0.25, to: 0.3 },
        yoyo: true,
        duration: 300,
        repeat: 2
      })
    })

    const siguiente = this.add.text(450, 370,
      this.nivelActual < niveles.length - 1 ? 'Siguiente nivel' : 'Reiniciar',
      {
        fontSize: '28px',
        color: '#fff',
        backgroundColor: '#007bff',
        padding: { x: 15, y: 8 },
        fontFamily: 'sans-serif'
      }).setOrigin(0.5).setInteractive().setDepth(10)

    siguiente.on('pointerover', () => {
      siguiente.setStyle({ backgroundColor: '#0056b3' })
    })

    siguiente.on('pointerout', () => {
      siguiente.setStyle({ backgroundColor: '#007bff' })
    })

    siguiente.on('pointerdown', () => {
      if (this.nivelActual < niveles.length - 1) {
        this.scene.restart({ nivel: this.nivelActual + 1 })
      } else {
        this.scene.restart({ nivel: 0 })
      }
    })
  }
}
