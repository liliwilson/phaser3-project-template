import Phaser from 'phaser';

import skyImg from "../assets/sky.png";

import Background from '../components/Background';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({
      key: "MainScene"
    });
  }

  preload() {
    // Place your code to load assets here...
    this.load.image('sky', skyImg);
  }

  create() {
    // Place your code to initialize objects here...
    const background = new Background(this);
  }

  update() {
    // Place your code to update objects here...
  }
}
