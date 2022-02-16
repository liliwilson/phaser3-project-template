import Phaser from 'phaser';

export default class Background extends Phaser.GameObjects.Image {
  constructor(scene) {
    super(scene, 0, 0, 'sky');
    scene.add.existing(this);

    this.setOrigin(0, 0);
    this.setScrollFactor(0);
  }
}