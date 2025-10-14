import Phaser from "phaser";
/*import { StateMachine } from "../states/stateMachine.js";
import { orderState, waitState, leaveState } from "../states/clientStates.js";*/
import GameManager from "../../gameManager.js";

const OBJECT_TYPES = [
  "phone",
  "computer",
  "television",
  "headphones",
  "washingMachine",
];

export class clients extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    this.scene = scene;
    this.scene.add.existing(this);

    /*this.StateMachine = new StateMachine("ordering");
    this.StateMachine.addState("ordering", new orderState(this));
    this.StateMachine.addState("waiting", new waitState(this));
    this.StateMachine.addState("leaving", new leaveState(this));
    this.StateMachine.changeState("ordering", { clients: this });*/

    this.generateOrder();
    this.fulfilled = [];
  }

  generateOrder() {
    const orderSize = Phaser.Math.Between(1, 4);
    this.order = [];
    for (let i = 0; i < orderSize; i++) {
      this.order.push(Phaser.Math.RND.pick(OBJECT_TYPES));
    }
    this.displayOrder();
  }

  displayOrder() {
    if (this.orderText) this.orderText.destroy();
    this.orderText = this.scene.add
      .text(this.x, this.y - 40, "Pedido: " + this.order.join(", "), {
        fontSize: "18px",
        color: "#ffffffff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);
  }

  tryDeliverObject(obj) {
    const idx = this.order.indexOf(obj.texture.key);
    if (idx !== -1) {
      this.order.splice(idx, 1);
      GameManager.getInstance().addMoney(obj.value);
      if (this.order.length === 0) {
        this.leave();
      } else {
        this.displayOrder();
      }
      obj.destroy();
      return true;
    }
    return false;
  }

  leave() {
    if (this.orderText) this.orderText.destroy();
    //this.StateMachine.changeState("leaving", { clients: this });
    this.scene.time.delayedCall(400, () => this.destroy());
  }

  update(dt) {
    //this.StateMachine.update(dt);
    if (this.orderText) {
      this.orderText.x = this.x;
      this.orderText.y = this.y - 40;
    }
  }
}
