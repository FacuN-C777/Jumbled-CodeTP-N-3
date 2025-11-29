import { PlayerInputHandler } from "./PlayerInputHandler.js";
import { PlayerAnimationManager } from "./PlayerAnimationManager.js";
import { PlayerObjectInteraction } from "./PlayerObjectInteraction.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, key, x, y, playerNumber = 1) {
    super(scene, x, y, key);

    this.scene = scene;
    this.playerNumber = playerNumber;
    this.setScale(1);
    this.setOrigin(0.5, 0.5); // center origin for correct rotation
    this.moveSpeed = 200;
    this.lastDirection = { x: 0, y: 1 }; // default facing DOWN (sprites face down)

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);

    this.stepSound = this.scene.sound.add("stepsPlayer", {
      loop: true,
      volume: 0.1,
    });

    this.inputHandler = new PlayerInputHandler(scene, playerNumber);
    this.animationManager = new PlayerAnimationManager(this, playerNumber);
    this.objectInteraction = new PlayerObjectInteraction(scene, this);
  }

  handleInput() {
    const { vx, vy } = this.inputHandler.getMovementInput();
    const velocityX = vx * this.moveSpeed;
    const velocityY = vy * this.moveSpeed;

    this.setVelocity(velocityX, velocityY);

    if (velocityX !== 0 || velocityY !== 0) {
      this.lastDirection = { x: vx, y: vy };
      const angle = Phaser.Math.Angle.Between(0, 0, vx, vy);
      this.rotation = angle - Math.PI / 2;
    }

    this.objectInteraction.updatePosition();

    if (
      this.inputHandler.isActionPressed() &&
      this.inputHandler.canActionTrigger()
    ) {
      if (this.objectInteraction.heldObject) {
        if (this.objectInteraction.tryDeliverToClient()) {
          this.objectInteraction.heldObject = null;
        } else {
          this.animationManager.playThrowAnimation(() => {
            this.animationManager.returnToStand();
          });
          this.objectInteraction.launchObject(this.lastDirection);
        }
      } else {
        this.objectInteraction.tryGrabNearby();
      }
    }
  }

  update(dt) {
    this.handleInput();

    const velocityMagnitude = this.body
      ? Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.y ** 2)
      : 0;

    this.animationManager.update(
      !!this.objectInteraction.heldObject,
      velocityMagnitude
    );

    // ...existing step sound logic...
    if (this.stepSound && this.body) {
      if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
        if (!this.stepSound.isPlaying) this.stepSound.play();
      } else {
        if (this.stepSound.isPlaying) this.stepSound.stop();
      }
    }
  }
}
