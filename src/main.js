import Phaser from 'phaser'
import GameScene from './scenes/GameScene.js'

const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 700,
  backgroundColor: '#f0f0f0',
  scene: [GameScene]
}

new Phaser.Game(config)
