import Phaser from "phaser";
import GameManager from "../../gameManager.js";
import keys from "../../enums/keys.js";
import { getTranslations, getPhrase } from "../../services/translations.js";

const OBJECT_TYPES = [
  "telefono",
  "computadora",
  "television",
  "audifonos",
  "lavarropa",
];

export class clients extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, key) {
    super(scene, x, y, key);
    const { ordert, o1, o2, o3, o4, o5 } = keys.classClientOrders;
    this.ordert = ordert;
    this.o1 = o1;
    this.o2 = o2;
    this.o3 = o3;
    this.o4 = o4;
    this.o5 = o5;
    this.scene = scene;
    this.scene.add.existing(this);

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

    // split order into two roughly equal lines to avoid clipping with nearby clients
    const splitIndex = Math.ceil(this.order.length / 2);
    const firstLine = this.order.slice(0, splitIndex).join(", ");
    const secondLine = this.order.slice(splitIndex).join(", ");
    const textContent = secondLine
      ? getPhrase(this.ordert) + `:\n${firstLine}\n${secondLine}`
      : getPhrase(this.ordert) + `: ${firstLine}`;

    this.orderText = this.scene.add
      .text(this.x, this.y - 40, textContent, {
        fontSize: "20px",
        color: "#013005ff",
        fontFamily: '"Press Start 2P", monospace',
        align: "center",
      })
      .setOrigin(0.5);
  }

  tryDeliverObject(obj) {
    const idx = this.order.indexOf(obj.texture.key);
    if (idx !== -1) {
      this.order.splice(idx, 1);
      GameManager.getInstance().addMoney(obj.value);

      if (this.scene.sonidoDinero) {
        this.scene.sonidoDinero.play();
      }

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
    this.scene.time.delayedCall(400, () => this.destroy());
  }

  update(dt) {
    if (this.orderText) {
      this.orderText.x = this.x;
      this.orderText.y = this.y - 40;
    }
  }

  // Pick a tilemap client spawn that isn't within minDistance of existing clients.
  static _getAvailableSpawn(scene, minDistance = 48) {
    const spawns = Array.isArray(scene.ClientSpawnLocations)
      ? scene.ClientSpawnLocations
      : [];
    if (spawns.length === 0) return null;

    const candidates = Phaser.Utils.Array.Shuffle(spawns.slice());
    for (let i = 0; i < candidates.length; i++) {
      const s = candidates[i];
      if (typeof s.x !== "number" || typeof s.y !== "number") continue;

      let occupied = false;
      const children =
        scene.clientsGroup && scene.clientsGroup.getChildren
          ? scene.clientsGroup.getChildren()
          : [];
      children.forEach((c) => {
        if (Phaser.Math.Distance.Between(s.x, s.y, c.x, c.y) < minDistance) {
          occupied = true;
        }
      });

      if (!occupied) return s;
    }
    return null;
  }

  // Spawn a client into the scene (adds to scene.clientsGroup). Handles tilemap spawns and fallback.
  static spawn(scene, minDistance = 48) {
    if (!scene) return null;
    if (!scene.clientsGroup) return null;
    if (scene.clientsGroup.getLength() >= 3) return null;

    let spawn = this._getAvailableSpawn(scene, minDistance);

    const x =
      spawn && typeof spawn.x === "number"
        ? spawn.x
        : Phaser.Math.Between(100, scene.cameras.main.width - 100);
    const y =
      spawn && typeof spawn.y === "number"
        ? spawn.y
        : Phaser.Math.Between(100, scene.cameras.main.height - 100);

    const client = new clients(scene, x, y, "client");
    scene.clientsGroup.add(client);

    // Play the same spawn sound used for objects (falls back if not loaded)
    if (scene.sound && scene.sound.play) {
      try {
        scene.sound.play("spawnObjects");
      } catch (e) {
        // ignore if sound not available
      }
    }

    return client;
  }
}
