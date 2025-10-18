import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, key, x, y, playerNumber = 1) {
    super(scene, x, y, key);

    this.scene = scene;
    this.playerNumber = playerNumber;
    this.setScale(0.1);
    this.moveSpeed = 200;
    this.heldObject = null;
    this.lastDirection = { x: 0, y: -1 };

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.stepSound = this.scene.sound.add("stepsPlayer", { loop: true, volume: 1 });

    this.inputSystem = new InputSystem(this.scene.input);

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
    this.scene.time.delayedCall(100, () => {
  if (!this.scene.input.gamepad) return;

  const pads = this.scene.input.gamepad?.pads || [];
  this.inputSystem.gamepad = pads[playerNumber - 1] || null;

  // Escuchar nuevas conexiones de mandos(chatgpt)
  this.scene.input.gamepad.on('connected', (pad) => {
    if (pad.index === playerNumber - 1) {
      this.inputSystem.gamepad = pad;
      console.log(`🎮 Gamepad asignado al jugador ${playerNumber}: ${pad.id}`);
    }
  });

  this.scene.input.gamepad.on('disconnected', (pad) => {
    if (pad.index === playerNumber - 1) {
      this.inputSystem.gamepad = null;
      console.log(`❌ Gamepad del jugador ${playerNumber} desconectado`);
    }
  });
});
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
    }


    if (this.heldObject) {
      this.heldObject.x = this.x;
      this.heldObject.y = this.y;
    }

    if (this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST)) {
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
          this.heldObject = obj;
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
      const throwSpeed = 600;
      this.scene.physics.add.existing(this.heldObject);
      this.heldObject.body.setVelocity(
        this.lastDirection.x * throwSpeed,
        this.lastDirection.y * throwSpeed
      );
       this.scene.sound.play('launchObjects');
      this.heldObject = null;
    }

    
     
  }

  update(dt) {
    if (this.inputSystem) {
      this.handleInput(dt);
    }
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
