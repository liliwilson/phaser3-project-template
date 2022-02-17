import Phaser from 'phaser';

import skyImg from '../assets/sky.png';
import playerSprite from '../assets/dude.png';

import Background from '../components/Background';
import Player from '../components/Player';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({
      key: "MainScene"
    });
  }

  preload() {
    // Place your code to load assets here...
    this.load.image('sky', skyImg);
    this.load.spritesheet('player', playerSprite, { frameWidth: 32, frameHeight: 48 });
  }

  create() {
    // Place your code to initialize objects here...
    this.background = new Background(this);

    // Get input cursors.
    this.cursors = this.input.keyboard.createCursorKeys();

    // Place the player in the center of the camera.
    const x = this.cameras.main.centerX;
    const y = this.cameras.main.centerY;

    this.player = new Player(this, x, y);
  }

  update() {
    // Place your code to update objects here...
    this.player.update(this.cursors);
  }
}
