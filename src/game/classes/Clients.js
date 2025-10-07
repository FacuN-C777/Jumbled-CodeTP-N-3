import Phaser from "phaser";
import { StateMachine } from "../states/stateMachine.js";
import { orderState, waitState, leaveState } from "../states/clientStates.js";

export class clients extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    this.scene = scene;
    this.scene.add.existing(this);

    this.StateMachine = new StateMachine("ordering");
    this.StateMachine.addState("ordering", new orderState(this));
    this.StateMachine.addState("waiting", new waitState(this));
    this.StateMachine.addState("leaving", new leaveState(this));
    this.StateMachine.changeState("ordering", { clients: this });
  }

  update(dt) {
    this.StateMachine.update(dt);
  }
}
