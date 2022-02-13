import Phaser from 'phaser';
import Enemy from './entities/Enemy';

import logoImg from './assets/logo.png';
import skyImg from './assets/sky.png';
import groundImg from './assets/platform.png';
import startImg from './assets/star.png';
import bombImg from './assets/bomb.png';
import dudeSprite from './assets/dude.png';
import enemyRunSprite from './assets/spritesheets/enemy_run.png';
import tilemap01 from './assets/tilemaps/01.json';
import tileset02 from './assets/tilesets/02.png';

class MyGame extends Phaser.Scene {

    constructor() {
        super();

        this.score = 0;
        this.dashImages = []
        this.dashSteps = 0;
        this.canDash = true
        this.player;
    }

    preload() {
        this.load.image('logo', logoImg);
        this.load.image('sky', skyImg);
        this.load.image('ground', groundImg);
        this.load.image('star', startImg);
        this.load.image('bomb', bombImg);

        this.load.tilemapTiledJSON('tilemap/01', tilemap01);
        this.load.image('tileset/02', tileset02);

        this.load.spritesheet('enemy',
            enemyRunSprite,
            { frameWidth: 32, frameHeight: 32 }
        );

        this.load.spritesheet('dude',
            dudeSprite,
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    create() {
        this.sky = this.add.image(400, 300, 'sky');
        this.sky.setScrollFactor(0);

        const map = this.make.tilemap({ key: 'tilemap/01' });
        const tileset = map.addTilesetImage('02', 'tileset/02', 32, 32);
        const platforms = map.createLayer('platforms', tileset);
        const boundary = map.createLayer('boundary');
        const enemyCollider = map.createLayer('enemy_collider');

        platforms.setCollisionByProperty({ collides: true });
        boundary.setCollisionByProperty({ collides: true });
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
      
        const scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        scoreText.setScrollFactor(0);

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

        // make stars
        const stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 64, y: 0, stepX: 70 }
        });

        stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        })

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
                this.enemies.get(object.x + object.width * 0.5, object.y - object.height * 0.5, 'enemy')
            }
        }

        this.player = this.physics.add.sprite(playerX, playerY, 'dude');
        this.player.setBounce(0.2);
        this.player.body.setGravityY(300);


        this.physics.add.collider(this.player, platforms, null, null, this);
        this.physics.add.collider(this.player, boundary, null, null, this);
        this.physics.add.collider(this.enemies, platforms, null, null, this);
        this.physics.add.collider(this.enemies, enemyCollider, this.handleEnemyCollide);

        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setBounds(34, 34, boundary.width - 66, boundary.height - 66);

        const scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        scoreText.setScrollFactor(0);
      
        this.physics.add.collider(stars, platforms);
        this.physics.add.overlap(this.player, stars, (player, star) => {
            this.canDash = true;
            star.disableBody(true, true);
            this.score += 10;
            scoreText.setText('Score: ' + this.score);
        });
    }

    handleEnemyCollide(obj, tile) {
        obj.left = !obj.left;
    }

    update() {

        const cursors = this.input.keyboard.createCursorKeys();

        if (cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.lastDirectionX = -1
            this.player.anims.play('left', true);
        }
        else if (cursors.right.isDown) {
            this.player.setVelocityX(160);
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

        if(this.dashSteps>0){
            const speed = Math.max(1800 * (this.dashSteps/20.0), 160)
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
        
        
        if(this.player.body.onFloor()){
            if(this.dashSteps <= 0){
                this.canDash = true
            }
            if (cursors.up.isDown){   
                this.player.setVelocityY(-500);
            }
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
