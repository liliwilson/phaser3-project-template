import Phaser from 'phaser';
import Enemy from './Enemy';

export default class EnemyGroup extends Phaser.Physics.Arcade.Group {
  /**
   * 
   * @param {Phaser.Scene} scene 
   * @param {*} positions 
   */
  constructor(scene, positions) {
    super(scene.physics.world, scene, { runChildUpdate: true });

    const enemies = positions.map(({ x, y }) => new Enemy(scene, x, y));

    this.addMultiple(enemies);
  }
}