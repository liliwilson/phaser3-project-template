import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  left = true;
  flipX = false;
  static SPEED = 100;

  constructor(scene, x, y) {
    super(scene, x, y, 'enemy');

    scene.anims.create({
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