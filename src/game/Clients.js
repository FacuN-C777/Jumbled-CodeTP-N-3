import { StateMachine } from "./states/stateMachine.js";
import { State } from "./states/state.js";

export class clients extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    this.scene = scene;

    this.StateMachine = new StateMachine("ordering");
    this.StateMachine.addState("ordering", new orderState());
    this.StateMachine.addState("waiting", new waitState());
    this.StateMachine.addState("leaving", new leaveState());
    this.StateMachine.changeState("ordering", { clients: this });

    this.scene.add.existing(this);
  }

  update(dt) {
    this.StateMachine.update(dt);
  }
}

class orderState extends State {
  init(params) {
    this.clients = params.clients;
  }

  update(dt) {}

  finish() {}
}

class waitState extends State {
  init(params) {
    this.clients = params.clients;
  }

  update(dt) {}

  finish() {}
}

class leaveState extends State {
  init(params) {
    this.clients = params.clients;
  }

  update(dt) {}

  finish() {}
}
