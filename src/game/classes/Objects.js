export default class Objects {
  constructor(scene) {
    this.scene = scene;
    this.group = this.scene.add.group();

    this.width = this.scene.cameras.main.width;
    this.height = this.scene.cameras.main.height;

    this.scene.time.addEvent({
      delay: 4000,
      loop: true,
      callback: () => this.spawnOne(),
    });
  }

  spawnOne() {
    const x = Phaser.Math.Between(50, this.width - 50);
    const y = Phaser.Math.Between(50, this.height - 50);
    let type = Phaser.Math.RND.pick("phone", "triangle");

    const obj = this.scene.physics.add.sprite(x, y, type);
    obj.setScale(0.15);
    obj.setAlpha(0);
    obj.body.setCollideWorldBounds(true);
    obj.body.setBounce(0.05);
    if (type == "phone") {
      obj.value = 50;
    } else {
      obj.value = 100;
    }

    this.group.add(obj);

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
