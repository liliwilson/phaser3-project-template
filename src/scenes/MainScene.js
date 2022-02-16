import Phaser from 'phaser';

import Player from '../components/Player';
import Enemy from '../components/enemies/Enemy';
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

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({
      key: "MainScene"
    });

    this.score = 0;
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
    const enemyCollider = map.createLayer('enemy_collider');
    const events = map.getObjectLayer("events");

    platforms.setCollisionByExclusion([-1]);
    enemyCollider.setCollisionByExclusion([-1]);

    // make stars
    const stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 64, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    const { x, y } = events.objects.filter(object => object.name === "spawn_player")[0];
    const enemyPositions = events.objects
      .filter(object => object.name === "spawn_enemy")
      .map(object => ({ x: object.x, y: object.y }));

    this.player = new Player(this, x, y);

    this.physics.add.collider(this.player, platforms);

    this.enemies = this.physics.add.group({
      classType: Enemy,
      runChildUpdate: true,
    });

    enemyPositions.forEach(({ x, y }) => {
      this.enemies.get(x, y);
    });

    this.physics.add.collider(this.enemies, platforms);
    this.physics.add.collider(this.enemies, enemyCollider, this.handleEnemyCollide, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollide, null, this);

    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    this.scoreText.setScrollFactor(0);

    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(this.player, stars, this.handlePlayerStarOverlap, null, this);
  }

  handlePlayerEnemyCollide(player, enemy) {
    // this.cameras.main.shake(200, 0.05);

    player.handleDamage();
  }

  handlePlayerStarOverlap(player, star) {
    player.canDash = true;
    star.disableBody(true, true);
    this.score += 10;
  }

  handleEnemyCollide(obj, _tile) {
    obj.left = !obj.left;
  }

  update() {
    this.player.update(this.cursors);
    this.scoreText.setText('Score: ' + this.score);
  }
}
