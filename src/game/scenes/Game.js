import { Scene } from 'phaser';
import Player from '../classes/Player.js';
import Objects from '../classes/Objects.js';

export class Game extends Scene {
  constructor() {
    super('Game');
  }

  preload() {
    this.load.image('phone', 'assets/phone.png');
    this.load.image('redCircle', 'assets/redCircle.png');
    this.load.image('blueCircle', 'assets/blueCircle.png');
  }

  create() {
   this.cameras.main.setBackgroundColor(0x111111);

   this.centerY = this.cameras.main.height / 2;

 
    this.player1 = new Player(this, 'redCircle', 200,this.centerY, 1);
    this.player2 = new Player(this, 'blueCircle', 824, this.centerY, 2);

 
    this.objects = new Objects(this);
 

  
    this.physics.add.collider(this.player1.sprite, this.player2.sprite);
    
  }

  update() {
    this.player1.update(this.objects.group);
    this.player2.update(this.objects.group);
  }
}