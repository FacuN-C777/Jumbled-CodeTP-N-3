import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, key, x, y, playerNumber = 1) {
    super(scene, x, y, key);

    this.scene = scene;
    this.playerNumber = playerNumber;
    this.setScale(1);
    this.setOrigin(0.5, 0.5); // center origin for correct rotation
    this.moveSpeed = 200;
    this.heldObject = null;
    this.lastDirection = { x: 0, y: 1 }; // default facing DOWN (sprites face down)

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.stepSound = this.scene.sound.add("stepsPlayer", {
      loop: true,
      volume: 0.1,
    });

    this.inputSystem = new InputSystem(this.scene.input);
    // small cooldown to avoid "instant" repeated just-press actions (ms)
    this._lastWestTime = 0;
    this._westCooldown = 200;

    if (playerNumber === 1) {
      this.inputSystem.configureKeyboard({
        [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.W],
        [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.S],
        [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.D],
        [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.A],
        [INPUT_ACTIONS.WEST]: [Phaser.Input.Keyboard.KeyCodes.E],
      });
    } else if (playerNumber === 2) {
      this.inputSystem.configureKeyboard({
        [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.UP],
        [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.DOWN],
        [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.RIGHT],
        [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.LEFT],
        [INPUT_ACTIONS.WEST]: [Phaser.Input.Keyboard.KeyCodes.SPACE],
      });
    }
    // Assign gamepad if available and listen for connections for this player index
    if (this.scene.input && this.scene.input.gamepad) {
      // Only pick the pad at this player's index for initial state.
      const pads = this.scene.input.gamepad.pads || [];
      this.inputSystem.gamepad = pads[playerNumber - 1] || null;
    }
  }

  // helper to get animation key prefix (p1 or p2)
  _animPrefix() {
    return `p${this.playerNumber}`;
  }

  handleInput(dt) {
    if (!this.inputSystem) return;

    let velocityX = 0;
    let velocityY = 0;

    if (this.inputSystem.isPressed(INPUT_ACTIONS.LEFT))
      velocityX = -this.moveSpeed;
    if (this.inputSystem.isPressed(INPUT_ACTIONS.RIGHT))
      velocityX = this.moveSpeed;
    if (this.inputSystem.isPressed(INPUT_ACTIONS.UP))
      velocityY = -this.moveSpeed;
    if (this.inputSystem.isPressed(INPUT_ACTIONS.DOWN))
      velocityY = this.moveSpeed;

    this.setVelocity(velocityX, velocityY);

    if (velocityX !== 0 || velocityY !== 0) {
      this.lastDirection = {
        x: velocityX / this.moveSpeed,
        y: velocityY / this.moveSpeed,
      };
      // rotate sprite so the "down" frames point toward movement direction
      const angle = Phaser.Math.Angle.Between(
        0,
        0,
        this.lastDirection.x,
        this.lastDirection.y
      );
      this.rotation = angle - Math.PI / 2;
    }

    if (this.heldObject) {
      this.heldObject.x = this.x;
      this.heldObject.y = this.y;
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST)) {
      const now = Date.now();
      if (now - this._lastWestTime < this._westCooldown) {
        // ignore rapid retriggers
      } else {
        this._lastWestTime = now;
        if (this.heldObject) {
          // Try to deliver to nearby client first
          if (this.tryDeliverToClient()) {
            this.heldObject = null;
          } else {
            this.launchObject();
          }
        } else {
          this.tryGrabNearby();
        }
      }
    }
  }

  tryGrabNearby() {
    if (!this.scene.objects?.group) return;

    this.scene.objects.group.getChildren().forEach((obj) => {
      if (!this.heldObject) {
        const distance = Phaser.Math.Distance.Between(
          this.x,
          this.y,
          obj.x,
          obj.y
        );
        if (distance < 50) {
          // Disable physics while held
          if (obj.body) {
            try {
              obj.body.enable = false;
              obj.body.setVelocity(0, 0);
            } catch (e) {
              // ignore if body manipulation fails
            }
          }
          this.heldObject = obj;
          // snap position immediately
          obj.x = this.x;
          obj.y = this.y;
        }
      }
    });
  }

  tryDeliverToClient() {
    if (!this.scene.clientsGroup) return false;
    let delivered = false;
    this.scene.clientsGroup.getChildren().forEach((client) => {
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
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

  launchObject() {
    if (this.heldObject) {
      // play throw animation briefly
      const throwKey = `${this._animPrefix()}throw`;
      this.anims.play(throwKey, true);
      // schedule revert to stand after 250ms
      this.scene.time.delayedCall(250, () => {
        const standKey = `${this._animPrefix()}stand`;
        if (this.anims) this.anims.play(standKey, true);
      });

      const throwSpeed = 600;
      // Re-enable physics for the object and apply velocity
      try {
        this.scene.physics.add.existing(this.heldObject);
        if (this.heldObject.body) {
          this.heldObject.body.setVelocity(
            this.lastDirection.x * throwSpeed,
            this.lastDirection.y * throwSpeed
          );
        }
      } catch (e) {
        // fallback: try enabling via physics world
        try {
          this.scene.physics.world.enable(this.heldObject);
          if (this.heldObject.body) {
            this.heldObject.body.setVelocity(
              this.lastDirection.x * throwSpeed,
              this.lastDirection.y * throwSpeed
            );
          }
        } catch (e) {}
      }
      this.scene.sound.play("launchObjects");
      this.heldObject = null;
    }
  }

  update(dt) {
    if (this.inputSystem) {
      this.handleInput(dt);
    }

    // Play appropriate animation based on state
    const prefix = this._animPrefix();
    if (this.heldObject) {
      this.anims.play(`${prefix}carry`, true);
    } else {
      // moving?
      const vx = this.body ? this.body.velocity.x : 0;
      const vy = this.body ? this.body.velocity.y : 0;
      if (Math.abs(vx) > 1 || Math.abs(vy) > 1) {
        this.anims.play(`${prefix}walk`, true);
      } else {
        this.anims.play(`${prefix}stand`, true);
      }
    }

    // ...existing step sound logic...
    if (this.stepSound && this.body) {
      if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
        if (!this.stepSound.isPlaying) {
          this.stepSound.play();
        }
      } else {
        if (this.stepSound.isPlaying) {
          this.stepSound.stop();
        }
      }
    }
  }
}
