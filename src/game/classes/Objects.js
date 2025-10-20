export default class Objects {
  constructor(scene) {
    this.scene = scene;
    this.group = this.scene.add.group();

    this.width = this.scene.cameras.main.width;
    this.height = this.scene.cameras.main.height;
     this.sonidoSpawn = this.scene.sound.add('spawnObjects');

    this.scene.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => this.spawnOne(),
    });
  }

  spawnOne() {
    // don't spawn if we've reached the max active objects
    if (this.group.getLength() >= 6) return;

    const x = Phaser.Math.Between(50, this.width - 50);
    const y = Phaser.Math.Between(50, this.height - 50);
    let type = Phaser.Math.RND.pick([
      "phone",
      "computer",
      "television",
      "headphones",
      "washingMachine",
    ]);
    console.log(type);

    const obj = this.scene.physics.add.sprite(x, y, type);
    obj.setScale(0.15);
    obj.setAlpha(0);
    obj.body.setCollideWorldBounds(true);
    obj.body.setBounce(0.05);
    if (type == "phone") {
      obj.value = 50;
    } else if (type == "computer") {
      obj.value = 100;
    } else if (type == "television") {
      obj.value = 75;
    } else if (type == "headphones") {
      obj.value = 50;
    } else if (type == "washingMachine") {
      obj.value = 150;
    }

    this.group.add(obj);
    this.sonidoSpawn.play();

    this.scene.tweens.add({
      targets: obj,
      alpha: 1,
      scale: 0.18,
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
    this.scene.time.delayedCall(20000, () => {
      this.scene.tweens.add({
        targets: obj,
        alpha: 0,
        duration: 400,
        onComplete: () => obj.destroy(),
      });
    });
  }
}
