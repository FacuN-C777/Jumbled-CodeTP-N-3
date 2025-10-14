import { State } from "./state";

export class orderState extends State {
  constructor(gameObject) {
    super();
    this.gameObject = gameObject;
  }

  init(params) {
    this.clients = params.clients;
  }

  update(delta) {}

  finish() {}
}

export class waitState extends State {
  init(params) {
    this.clients = params.clients;
  }

  update(dt) {}

  finish() {}
}

export class leaveState extends State {
  init(params) {
    this.clients = params.clients;
  }

  update(dt) {}

  finish() {}
}
