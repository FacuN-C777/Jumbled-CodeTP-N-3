export default class Player {
  constructor(scene, texture, startX, startY, playerNumber = 1) {
    this.scene = scene;

    // Crear sprite con física
    this.sprite = scene.physics.add.sprite(startX, startY, texture);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setScale(0.1);

  
    if (playerNumber === 1) {
      this.controls = scene.input.keyboard.addKeys({
        up: 'W', down: 'S', left: 'A', right: 'D', grab: 'E'
      });
    } else {
      this.controls = scene.input.keyboard.createCursorKeys();
      this.controls.grab = scene.input.keyboard.addKey('SPACE');
    }

    this.speed = 200;
    this.heldObject = null;
    this.lastDirection = { x: 0, y: -1 };
  }

  handleInput() {
    let vx = 0;
    let vy = 0;

    if (this.controls.left.isDown) vx = -this.speed;
    else if (this.controls.right.isDown) vx = this.speed;

    if (this.controls.up.isDown) vy = -this.speed;
    else if (this.controls.down.isDown) vy = this.speed;

    this.sprite.body.setVelocity(vx, vy);

    if (vx !== 0 || vy !== 0) {
      this.lastDirection = { x: vx / this.speed, y: vy / this.speed };
    }

   
    if (this.heldObject) {
      this.heldObject.x = this.sprite.x;
      this.heldObject.y = this.sprite.y;
    }


    if (Phaser.Input.Keyboard.JustDown(this.controls.grab)) {
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
          this.sprite.x, this.sprite.y, obj.x, obj.y
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