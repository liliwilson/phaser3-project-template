import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  static SPEED = 100;
  left = true;
  flipX = false;

  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, 'enemy', frame);

    this.createAnimations();
  }

  createAnimations() {
    this.anims.create({
      key: 'enemy-run',
      repeat: -1,
      frameRate: 20,
      frames: this.anims.generateFrameNumbers('enemy', {
        start: 0,
        end: 11
      })
    });

    this.play('enemy-run');
  }

  turnAround() {
    this.left = !this.left;
  }

  update() {
    super.update();

    if (this.left) {
      this.flipX = true;
      this.setVelocityX(-Enemy.SPEED);
    } else {
      this.flipX = false;
      this.setVelocityX(Enemy.SPEED);
    }
  }
}