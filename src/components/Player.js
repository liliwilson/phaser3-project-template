import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  static BASE_SPEED = 200;
  static DASH_SPEED = 1800;

  static GRAVITY = 350;
  static JUMP_VELOCITY = 460;

  score = 0;
  dashImages = [];
  dashSteps = 0;
  canDash = true;

  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.createAnimations();
    this.setPhysicalProperties();
  }

  setPhysicalProperties() {
    this.setBounce(0.2);
    this.setScale(1.2);
    this.setGravityY(Player.GRAVITY);
    this.setCollideWorldBounds(true);
  }

  createAnimations() {
    this.anims.create({
      key: 'player-left',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'player-right',
      frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'player-turn',
      frames: [{ key: 'player', frame: 4 }],
      frameRate: 20
    });
  }

  update(cursors) {
    if (this.dashSteps == 0) {
      if (cursors.left.isDown) {
        this.setVelocityX(-Player.BASE_SPEED);
        this.lastDirectionX = -1;
        this.anims.play('player-left', true);
      }
      else if (cursors.right.isDown) {
        this.setVelocityX(Player.BASE_SPEED);
        this.lastDirectionX = 1;
        this.anims.play('player-right', true);
      }
      else {
        this.setVelocityX(0);
        this.anims.play('player-turn');
      }

      if (cursors.shift.isDown && this.canDash) {
        this.dashSteps = 20;
        this.canDash = false;
      }
    }

    if (this.dashSteps > 0) {
      const speed = Math.max(Player.DASH_SPEED * (this.dashSteps / 20.0), Player.BASE_SPEED);
      this.setVelocityX(speed * this.lastDirectionX);
      if (this.dashSteps % 2 == 0) {
        const afterImage = this.scene.add.sprite(this.x, this.y, 'player');
        afterImage.anims.setCurrentFrame(this.anims.currentFrame);
        afterImage.setAlpha(0.5);
        afterImage.ticks = 0;
        this.dashImages.push(afterImage);
      }
      this.dashSteps--;
    }
    for (let image of this.dashImages) {
      image.ticks++;
      if (image.ticks > 12) {
        image.destroy();
        image.deleted = true;
      }
    }
    this.dashImages = this.dashImages.filter((image) => !image.deleted);

    this.jumpFrames--;
    if (this.body.onFloor()) {
      if (this.dashSteps <= 0) {
        this.canDash = true;
      }
      this.jumpFrames = 10;
    }

    if (this.jumpFrames > 0 && cursors.up.isDown) {
      this.setVelocityY(-Player.JUMP_VELOCITY);
    }
  }
}