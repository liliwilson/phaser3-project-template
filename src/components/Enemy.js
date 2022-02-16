import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  left = true;
  flipX = false;
  static SPEED = 100;

  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    this.anims.play('enemy-run');
  }
  
  preUpdate(t, dt) {
    super.preUpdate(t, dt);

    if (this.left) {
      this.flipX = true;
      this.setVelocity(-Enemy.SPEED, 0);
    } else {
      this.flipX = false;
      this.setVelocity(Enemy.SPEED, 0);
    }
  }
}