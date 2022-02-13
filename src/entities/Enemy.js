import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    this.anims.play('enemy-run');
    this.left = true;
  }
  preUpdate(t, dt) {
    super.preUpdate(t, dt);

    const speed = 100;

    if (this.left) {
      this.flipX = true;
      this.setVelocity(-speed, 0);
    } else {
      this.flipX = false;
      this.setVelocity(speed, 0);
    }
  }
}