export default class Objects {
  constructor(scene) {
    this.scene = scene;
    this.group = this.scene.add.group();

    this.width = this.scene.cameras.main.width;
    this.height = this.scene.cameras.main.height;
    this.sonidoSpawn = this.scene.sound.add("spawnObjects");

    this.scene.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => this.spawnOne(),
    });
  }

  // Find an object spawn (from tilemap objects) that isn't too close to existing objects.
  getAvailableObjectSpawn(minDistance = 48) {
    const spawns = Array.isArray(this.scene.objectSpawnLocations)
      ? this.scene.objectSpawnLocations
      : [];
    if (spawns.length === 0) return null;

    const candidates = Phaser.Utils.Array.Shuffle(spawns.slice());

    for (let i = 0; i < candidates.length; i++) {
      const s = candidates[i];
      if (typeof s.x !== "number" || typeof s.y !== "number") continue;

      let occupied = false;
      this.group.getChildren().forEach((o) => {
        if (Phaser.Math.Distance.Between(s.x, s.y, o.x, o.y) < minDistance) {
          occupied = true;
        }
      });

      if (!occupied) return s;
    }

    return null;
  }

  spawnOne() {
    // don't spawn if we've reached the max active objects
    if (this.group.getLength() >= 6) return;

    // Prefer tilemap-defined object spawn locations that aren't occupied
    let spawn = this.getAvailableObjectSpawn(48);

    const x =
      spawn && typeof spawn.x === "number"
        ? spawn.x
        : Phaser.Math.Between(50, this.width - 50);
    const y =
      spawn && typeof spawn.y === "number"
        ? spawn.y
        : Phaser.Math.Between(50, this.height - 50);

    let type = Phaser.Math.RND.pick([
      "telefono",
      "computadora",
      "television",
      "audifonos",
      "lavarropa",
    ]);

    const obj = this.scene.physics.add.sprite(x, y, type);
    obj.setScale(1.5);
    obj.setAlpha(0);
    obj.body.setCollideWorldBounds(true);
    obj.body.setBounce(0.05);
    if (type == "telefono") {
      obj.value = 50;
    } else if (type == "computadora") {
      obj.value = 100;
    } else if (type == "television") {
      obj.value = 75;
    } else if (type == "audifonos") {
      obj.value = 50;
    } else if (type == "lavarropa") {
      obj.value = 150;
    }

    this.group.add(obj);
    this.sonidoSpawn.play();

    this.scene.tweens.add({
      targets: obj,
      alpha: 1,
      duration: 400,
      ease: "Back.Out",
    });

    this.scene.tweens.add({
      targets: obj,
      angle: 360,
      duration: 6000,
      repeat: -1,
    });

    //timer de existencia de los objetos
    this.scene.time.delayedCall(12000, () => {
      this.scene.tweens.add({
        targets: obj,
        alpha: 0,
        duration: 400,
        onComplete: () => obj.destroy(),
      });
    });
  }
}
