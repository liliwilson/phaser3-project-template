import Phaser from 'phaser';

import skyImg from '../assets/sky.png';
import starImg from '../assets/star.png';
import playerSprite from '../assets/dude.png';

import tilemap01 from '../assets/tilemaps/01.json';
import tilemap02 from '../assets/tilemaps/02.json';
import tileset01 from '../assets/tilesets/01.png';

import Background from '../components/Background';
import Player from '../components/Player';

export default class MainScene extends Phaser.Scene {
  score = 0;

  constructor() {
    super({
      key: "MainScene"
    });
  }

  preload() {
    // Loading in images
    this.load.image('sky', skyImg);
    this.load.image('star', starImg);
    this.load.spritesheet('player', playerSprite, { frameWidth: 32, frameHeight: 48 });

    // Loading in tilemap assets.
    this.load.tilemapTiledJSON('tilemap/01', tilemap01);
    this.load.tilemapTiledJSON('tilemap/02', tilemap02);
    this.load.image('tileset/01', tileset01);
  }

  /**
   * Draws debug graphics for layer.
   * 
   * @param {Phaser.Tilemaps.TilemapLayer} layer 
   */
  debugTilemapLayer(layer) {
    const gfx = this.add.graphics();

    layer.renderDebug(gfx, {
      collidingTileColor: null,
      tileColor: null,
      faceColor: new Phaser.Display.Color(255, 255, 0, 255)
    });
  }

  createTilemap() {
    const map = this.make.tilemap({ key: 'tilemap/01' });
    const tileset = map.addTilesetImage('01', 'tileset/01');
    const foreground = map.createLayer('foreground', tileset, 0, 0);

    // Tell Phaser to make every tile on 'foreground' layer collideable.
    foreground.setCollisionByExclusion([-1]);

    // this.debugTilemapLayer(foreground);

    return {
      map,
      foreground
    };
  }

  createCollisions() {
    this.physics.add.collider(this.player, this.tilemap.foreground);
    this.physics.add.collider(this.collectibles, this.tilemap.foreground);
    this.physics.add.overlap(this.collectibles, this.player, (player, star) => { this.score += 10; star.disableBody(true, true); });
  }

  create() {
    // Place your code to initialize objects here...
    this.background = new Background(this);

    // Get input cursors.
    this.cursors = this.input.keyboard.createCursorKeys();

    // Initialize our tilemap.
    this.tilemap = this.createTilemap();

    // Set the world bounds to be the dimensions of the tilemap.
    this.physics.world.setBounds(0, 0, this.tilemap.map.widthInPixels, this.tilemap.map.heightInPixels);

    // Place the player in the center of the camera.
    const x = this.cameras.main.centerX;
    const y = this.cameras.main.centerY;

    this.player = new Player(this, x, y);

    // Place 11 collectibles.
    this.collectibles = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 64, y: 0, stepX: 70 }
    });

    this.collectibles.children.iterate((child) => {
      child.setBounceY(Phaser.Math.Between(0.4, 0.8));
    });

    // Setup collisions.
    this.createCollisions();

    // Tell the camera to follow the player and set world bounds to be tilemap dimensions.
    const { main } = this.cameras;
    main.startFollow(this.player);
    main.setBounds(0, 0, this.tilemap.map.widthInPixels, this.tilemap.map.heightInPixels);

    // Tell background to not scroll with the camera.
    this.background.setScrollFactor(0);

    // Create score text.
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '20px', fontFamily: 'VT323', fill: '#fff' });
    this.scoreText.setScrollFactor(0);
  }

  update() {
    // Place your code to update objects here...
    this.player.update(this.cursors);

    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      this.cameras.main.flash(250, 255, 255, 255);
      this.cameras.main.shake(250, 0.075);
    }

    this.scoreText.setText('Score: ' + this.score);
  }
}
