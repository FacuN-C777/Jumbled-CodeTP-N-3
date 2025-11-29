export class PlayerAnimationManager {
  constructor(sprite, playerNumber) {
    this.sprite = sprite;
    this.playerNumber = playerNumber;
    this.prefix = `p${playerNumber}`;
  }

  update(isCarrying, velocityMagnitude) {
    if (isCarrying) {
      this.playAnimation("carry");
    } else if (velocityMagnitude > 1) {
      this.playAnimation("walk");
    } else {
      this.playAnimation("stand");
    }
  }

  playAnimation(state) {
    const key = `${this.prefix}${state}`;
    if (this.sprite.anims) {
      this.sprite.anims.play(key, true);
    }
  }

  playThrowAnimation(callback) {
    const throwKey = `${this.prefix}throw`;
    if (this.sprite.anims) {
      this.sprite.anims.play(throwKey, true);
    }
    if (callback) {
      this.sprite.scene.time.delayedCall(250, callback);
    }
  }

  returnToStand() {
    this.playAnimation("stand");
  }
}
