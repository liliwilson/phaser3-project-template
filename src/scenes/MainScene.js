import Phaser from 'phaser';

import Enemy from '../components/Enemy';
import Player from '../components/Player';
import Background from '../components/Background';

import logoImg from '../assets/logo.png';
import skyImg from '../assets/sky.png';
import groundImg from '../assets/platform.png';
import startImg from '../assets/star.png';
import bombImg from '../assets/bomb.png';
import playerSprite from '../assets/dude.png';
import enemyRunSprite from '../assets/spritesheets/enemy_run.png';
import tilemap01 from '../assets/tilemaps/01.json';
import tileset02 from '../assets/tilesets/02.png';

export const BASE_SPEED = 200
export const DASH_SPEED = 1800

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({
      key: "MainScene"
    });

    this.score = 0;
    this.dashImages = [];
    this.dashSteps = 0;
    this.canDash = true;
    this.player;
    this.jumpFrames = 10;
  }

  loadImages() {
    this.load.image('logo', logoImg);
    this.load.image('sky', skyImg);
    this.load.image('ground', groundImg);
    this.load.image('star', startImg);
    this.load.image('bomb', bombImg);
  }

  loadSprites() {
    this.load.spritesheet('enemy',
      enemyRunSprite,
      { frameWidth: 32, frameHeight: 32 }
    );

    this.load.spritesheet('player',
      playerSprite,
      { frameWidth: 32, frameHeight: 48 }
    );
  }

  loadTilemaps() {
    this.load.tilemapTiledJSON('tilemap/01', tilemap01);
    this.load.image('tileset/02', tileset02);
  }

  preload() {
    this.loadImages();
    this.loadSprites();
    this.loadTilemaps();
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.background = new Background(this);

    const map = this.make.tilemap({ key: 'tilemap/01' });
    const tileset = map.addTilesetImage('02', 'tileset/02', 32, 32);
    const platforms = map.createLayer('platforms', tileset);
    const boundary = map.createLayer('boundary');
    const enemyCollider = map.createLayer('enemy_collider');

    platforms.setCollisionByExclusion(-1);
    boundary.setCollisionByExclusion(-1);
    enemyCollider.setCollisionByExclusion(-1);

    // animate the player
    this.anims.create({
      key: 'enemy-run',
      repeat: -1,
      frameRate: 20,
      frames: this.anims.generateFrameNumbers('enemy', {
        start: 0,
        end: 11
      })
    });

    // make stars
    const stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 64, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    // make enemies
    this.enemies = this.physics.add.group({
      classType: Enemy,
      gravityY: 15000
    });

    let playerX = 0, playerY = 0;

    for (const object of map.getObjectLayer('events').objects) {
      if (object.name === "spawn_player") {
        playerX = object.x;
        playerY = object.y;
      } else if (object.name === "spawn_enemy") {
        this.enemies.get(object.x + object.width * 0.5, object.y - object.height * 0.5, 'enemy');
      }
    }

    // this.player = this.physics.add.sprite(playerX, playerY, 'dude');
    // this.player.setBounce(0.2);
    // this.player.body.setGravityY(300);

    this.player = new Player(this, playerX, playerY);


    this.physics.add.collider(this.player, platforms, null, null, this);
    this.physics.add.collider(this.player, boundary, null, null, this);
    this.physics.add.collider(this.enemies, platforms, null, null, this);
    this.physics.add.collider(this.enemies, enemyCollider, this.handleEnemyCollide);

    this.cameras.main.startFollow(this.player, true);
    // this.cameras.main.setBounds(34, 34, boundary.width - 66, boundary.height - 66);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    scoreText.setScrollFactor(0);

    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(this.player, stars, (player, star) => {
      player.canDash = true;
      star.disableBody(true, true);
      this.score += 10;
      scoreText.setText('Score: ' + this.score);
    });
  }

  handleEnemyCollide(obj, tile) {
    obj.left = !obj.left;
  }

  update() {
    this.player.update(this.cursors);
  }
}
