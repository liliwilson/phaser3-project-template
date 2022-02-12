import Phaser from 'phaser';
import logoImg from './assets/logo.png';
import skyImg from './assets/sky.png';
import groundImg from './assets/platform.png';
import startImg from './assets/star.png';
import bombImg from './assets/bomb.png';
import dudeSprite from './assets/dude.png';
import levelOneMap from './assets/tilemaps/level_one.json';
import levelOneTileset from './assets/tilesets/level_one.png';

class MyGame extends Phaser.Scene {

    constructor() {
        super();

        this.player;
    }

    preload() {
        this.load.image('logo', logoImg);
        this.load.image('sky', skyImg);
        this.load.image('ground', groundImg);
        this.load.image('star', startImg);
        this.load.image('bomb', bombImg);

        this.load.tilemapTiledJSON('map/01', levelOneMap);
        this.load.image('tileset/01', levelOneTileset);

        this.load.spritesheet('dude',
            dudeSprite,
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    create() {
        this.sky = this.add.image(400, 300, 'sky');
        this.sky.setScrollFactor(0);

        const map = this.make.tilemap({ key: 'map/01' });
        const tileset = map.addTilesetImage('level_one', 'tileset/01', 32, 32);

        const debugGraphics = this.add.graphics().setAlpha(0.7);

        const platforms = map.createLayer('platforms', tileset);
        platforms.setCollisionByProperty({ collides: true });
        platforms.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        });

        this.player = this.physics.add.sprite(100, 260, 'dude');
        this.player.setBounce(0.2);
        this.player.body.setGravityY(300);
        this.cameras.main.startFollow(this.player, true);

        this.physics.add.collider(this.player, platforms, null, null, this);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    }

    update() {

        const cursors = this.input.keyboard.createCursorKeys();

        if (cursors.left.isDown) {
            this.player.setVelocityX(-160);

            this.player.anims.play('left', true);
        }
        else if (cursors.right.isDown) {
            this.player.setVelocityX(160);

            this.player.anims.play('right', true);
        }
        else {
            this.player.setVelocityX(0);

            this.player.anims.play('turn');
        }

        if (cursors.up.isDown && this.player.body.onFloor()) {
            this.player.setVelocityY(-500);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true
        }
    },
    scene: MyGame,
    pixelArt: true
};

const game = new Phaser.Game(config);
