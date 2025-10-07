import { State } from "./state";

export class orderState extends State {
  constructor(gameObject) {
    super();
    this.gameObject = gameObject;
  }

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
