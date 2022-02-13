import Phaser from 'phaser';
import logoImg from './assets/logo.png';
import skyImg from './assets/sky.png';
import groundImg from './assets/platform.png';
import startImg from './assets/star.png';
import bombImg from './assets/bomb.png';
import dudeSprite from './assets/dude.png';
import levelOneMap from './assets/tilemaps/level_one.json';
import levelOneTileset from './assets/tilesets/level_one.png';

const BASE_SPEED = 200
const DASH_SPEED = 1800
class MyGame extends Phaser.Scene {
    constructor() {
        super();

        this.score = 0;
        this.dashImages = []
        this.dashSteps = 0;
        this.canDash = true
        this.player;
        this.jumpFrames = 10;
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

        const platforms = map.createLayer('platforms', tileset);
        const boundary = map.createLayer('boundary', tileset);

        platforms.setCollisionByProperty({ collides: true });
        boundary.setCollisionByExclusion(-1);

        this.player = this.physics.add.sprite(100, 260, 'dude');
        this.player.setBounce(0.2);
        this.player.body.setGravityY(300);
        this.cameras.main.startFollow(this.player, true);

        this.physics.add.collider(this.player, platforms, null, null, this);
        this.physics.add.collider(this.player, boundary, null, null, this);

        // make stars
        const stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 40, y: 0, stepX: 70 }
        });
        
        stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        const scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        scoreText.setScrollFactor(0);


        this.physics.add.collider(stars, platforms);
        this.physics.add.overlap(this.player, stars, (player, star) => {
            this.canDash = true;
            star.disableBody(true, true);
            this.score += 10;
            scoreText.setText('Score: ' + this.score);
        });

        // animate the player
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

        if(this.dashSteps==0){
            if (cursors.left.isDown) {
                this.player.setVelocityX(-BASE_SPEED);
                this.player.lastDirectionX = -1
                this.player.anims.play('left', true);
            }
            else if (cursors.right.isDown) {
                this.player.setVelocityX(BASE_SPEED);
                this.player.lastDirectionX = 1
                this.player.anims.play('right', true);
            }
            else {
                this.player.setVelocityX(0);
                this.player.anims.play('turn');
            }

            if(cursors.shift.isDown && this.canDash){
                this.dashSteps = 20
                this.canDash = false
            }
        }

        if(this.dashSteps>0){
            const speed = Math.max(DASH_SPEED * (this.dashSteps/20.0), BASE_SPEED)
            this.player.setVelocityX(speed * this.player.lastDirectionX)
            if(this.dashSteps%2==0){
                const afterImage = this.add.sprite(this.player.x, this.player.y, 'dude');
                afterImage.anims.setCurrentFrame(this.player.anims.currentFrame)
                afterImage.setAlpha(0.5)
                afterImage.ticks = 0
                this.dashImages.push(afterImage)
            }
            this.dashSteps--;
        }
        for(let image of this.dashImages){
            image.ticks++;
            if(image.ticks>12){
                image.destroy()
                image.deleted = true
            }
        }
        this.dashImages = this.dashImages.filter((image)=>!image.deleted)
        
        this.jumpFrames--;
        if(this.player.body.onFloor()){
            if(this.dashSteps <= 0){
                this.canDash = true
            }
            this.jumpFrames = 10;
        }

        if (this.jumpFrames>0 && cursors.up.isDown){   
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
            debug: false
        }
    },
    scene: MyGame,
    pixelArt: true
};

const game = new Phaser.Game(config);
