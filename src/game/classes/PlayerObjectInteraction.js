export class PlayerObjectInteraction {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.heldObject = null;
  }

  tryGrabNearby() {
    if (!this.scene.objects?.group) return;

    this.scene.objects.group.getChildren().forEach((obj) => {
      if (!this.heldObject) {
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          obj.x,
          obj.y
        );
        if (distance < 50) {
          if (obj.body) {
            try {
              obj.body.enable = false;
              obj.body.setVelocity(0, 0);
            } catch (e) {}
          }
          this.heldObject = obj;
          obj.x = this.player.x;
          obj.y = this.player.y;
        }
      }
    });
  }

  tryDeliverToClient() {
    if (!this.scene.clientsGroup) return false;
    let delivered = false;
    this.scene.clientsGroup.getChildren().forEach((client) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        client.x,
        client.y
      );
      if (
        distance < 60 &&
        this.heldObject &&
        client.tryDeliverObject(this.heldObject)
      ) {
        delivered = true;
      }
    });
    return delivered;
  }

  launchObject(direction) {
    if (!this.heldObject) return;

    const throwSpeed = 600;
    try {
      this.scene.physics.add.existing(this.heldObject);
      if (this.heldObject.body) {
        this.heldObject.body.setVelocity(
          direction.x * throwSpeed,
          direction.y * throwSpeed
        );
      }
    } catch (e) {
      try {
        this.scene.physics.world.enable(this.heldObject);
        if (this.heldObject.body) {
          this.heldObject.body.setVelocity(
            direction.x * throwSpeed,
            direction.y * throwSpeed
          );
        }
      } catch (e) {}
    }
    this.scene.sound.play("launchObjects");
    this.heldObject = null;
  }

  updatePosition() {
    if (this.heldObject) {
      this.heldObject.x = this.player.x;
      this.heldObject.y = this.player.y;
    }
  }
}
