import Phaser from 'phaser';
import logoImg from './assets/logo.png';
import skyImg from './assets/sky.png';
import groundImg from './assets/platform.png';
import startImg from './assets/star.png';
import bombImg from './assets/bomb.png';
import dudeSprite from './assets/dude.png';

class MyGame extends Phaser.Scene
{

    constructor ()
    {
        super();

        this.score = 0;
        this.player;
    }

    preload ()
    {
        this.load.image('logo', logoImg);
        this.load.image('sky', skyImg);
        this.load.image('ground', groundImg);
        this.load.image('star', startImg);
        this.load.image('bomb', bombImg);
        this.load.spritesheet('dude', 
        dudeSprite,
            { frameWidth: 32, frameHeight: 48 }
        );
    }
      
    create ()
    {
        const sky = this.add.image(400, 300, 'sky');

        // make platforms
        const platforms = this.physics.add.staticGroup();
        platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');

        // make player
        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.player.body.setGravityY(300)
        this.physics.add.collider(this.player, platforms);

        // make stars
        const stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });
        
        stars.children.iterate(function (child) {
        
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        
        });

        const scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });


        this.physics.add.collider(stars, platforms);
        this.physics.add.overlap(this.player, stars, (player, star) => {
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
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });
        
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });


    }

    update () {

        const cursors = this.input.keyboard.createCursorKeys();

        if (cursors.left.isDown)
        {
            this.player.setVelocityX(-160);

            this.player.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            this.player.setVelocityX(160);

            this.player.anims.play('right', true);
        }
        else
        {
            this.player.setVelocityX(0);

            this.player.anims.play('turn');
        }

        if (cursors.up.isDown && this.player.body.touching.down)
        {
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
    scene: MyGame
};

const game = new Phaser.Game(config);
