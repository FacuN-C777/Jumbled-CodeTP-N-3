import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";

export default class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, key, x, y, playerNumber = 1) {
    super(scene, x, y, key);
    this.scene = scene;

    // Crear sprite con física
    /*this.sprite = scene.physics.add.sprite(startX, startY, texture);
    this.sprite.setCollideWorldBounds(true);*/
    this.setScale(0.1);

    if (playerNumber === 1) {
      // Initialize InputSystem
      this.inputSystem = new InputSystem(this.scene.input);

      this.inputSystem.configureKeyboard({
        [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.W],
        [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.S],
        [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.D],
        [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.A],
        [INPUT_ACTIONS.WEST]: [Phaser.Input.Keyboard.KeyCodes.E],
      });

      this.moveSpeed = 200;
      /*this.controls = scene.input.keyboard.addKeys({
        up: "W",
        down: "S",
        left: "A",
        right: "D",
        grab: "E",
      });
    } else {
      this.controls = scene.input.keyboard.createCursorKeys();
      this.controls.grab = scene.input.keyboard.addKey("SPACE");
    }*/

      this.heldObject = null;
      this.lastDirection = { x: 0, y: -1 };
    }
  }

  handleInput(dt) {
    // Check input and move logo
    let velocityX = 0;
    let velocityY = 0;

    if (this.inputSystem.isPressed(INPUT_ACTIONS.LEFT)) {
      velocityX = -this.moveSpeed;
    }
    if (this.inputSystem.isPressed(INPUT_ACTIONS.RIGHT)) {
      velocityX = this.moveSpeed;
    }

    if (this.inputSystem.isPressed(INPUT_ACTIONS.UP)) {
      velocityY = -this.moveSpeed;
    }
    if (this.inputSystem.isPressed(INPUT_ACTIONS.DOWN)) {
      velocityY = this.moveSpeed;
    }

    if (this.inputSystem.isPressed(INPUT_ACTIONS.WEST)) {
      velocityX = -this.moveSpeed;
    }

    this.x += velocityX * dt;
    this.y += velocityY * dt;

    if (velocityX !== 0 || velocityY !== 0) {
      this.lastDirection = {
        x: velocityX / this.speed,
        y: velocityY / this.moveSpeed,
      };
    }

    if (this.heldObject) {
      this.heldObject.x = this.x;
      this.heldObject.y = this.y;
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST)) {
      if (this.heldObject) {
        this.launchObject();
      } else {
        this.tryGrabNearby();
      }
    }
  }

  tryGrabNearby() {
    this.scene.objects.group.getChildren().forEach((obj) => {
      if (!this.heldObject) {
        const distance = Phaser.Math.Distance.Between(
          this.x,
          this.y,
          obj.x,
          obj.y
        );
        if (distance < 50) {
          this.heldObject = obj;
        }
      }
    });
  }

  launchObject() {
    if (this.heldObject) {
      const throwSpeed = 600;
      this.scene.physics.add.existing(this.heldObject);
      this.heldObject.body.setVelocity(
        this.lastDirection.x * throwSpeed,
        this.lastDirection.y * throwSpeed
      );
      this.heldObject = null;
    }
  }

  update() {
    this.handleInput();
  }
}
