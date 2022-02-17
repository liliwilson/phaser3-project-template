import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  static BASE_SPEED = 200;

  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.createAnimations();
    this.createProperties();

    this.play('player-idle');
  }

  createProperties() {
    this.setCollideWorldBounds(true);
    this.setScale(1.2);
    this.body.setAllowGravity(false);
  }

  createAnimations() {
    this.anims.create({
      key: 'player-idle',
      frames: [{ key: 'player', frame: 4 }],
      frameRate: 20
    });
  }

  /**
   * Updates the player.
   * @param {Phaser.Types.Input.Keyboard.CursorKeys} cursors 
   */
  update(cursors) {
    if (cursors.left.isDown) {
      this.setVelocityX(-Player.BASE_SPEED);
    } else if (cursors.right.isDown) {
      this.setVelocityX(Player.BASE_SPEED);
    } else {
      this.setVelocityX(0);
    }
    
    if (cursors.up.isDown) {
      this.setVelocityY(-Player.BASE_SPEED);
    } else if (cursors.down.isDown) {
      this.setVelocityY(Player.BASE_SPEED);
    } else {
      this.setVelocityY(0);
    }
  }
}