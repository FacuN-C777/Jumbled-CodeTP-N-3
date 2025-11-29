export class GamepadInputHandler {
  constructor(scene) {
    this.scene = scene;
    this.selectedButtonIndex = 0;
    this._lastNavTime = 0;
    this._navCooldown = 200;
    this._lastAState = false;
    this.menuButtons = [];

    this.initializeGamepad();
  }

  initializeGamepad() {
    if (this.scene.input && this.scene.input.gamepad) {
      const gp = this.scene.input.gamepad;
      let attempts = 0;
      const waitForPads = () => {
        attempts++;
        const pads = gp.pads || [];
        if (pads.length > 0 || attempts > 10) return;
        this.scene.time.delayedCall(100, waitForPads);
      };
      waitForPads();
    }
  }

  registerButton(buttonObj) {
    this.menuButtons.push(buttonObj);
  }

  selectButton(index) {
    if (!this.menuButtons || this.menuButtons.length === 0) return;
    index = Phaser.Math.Wrap(index, 0, this.menuButtons.length);
    this.selectedButtonIndex = index;
    this.menuButtons.forEach((b, i) => {
      if (b.glow) {
        b.glow.setFillStyle(
          i === index ? 0x00ffff : 0x000000,
          i === index ? 0.15 : 0
        );
      }
      b.container.setScale(i === index ? 1.02 : 1);
    });
  }

  update() {
    const pads = this.scene.input.gamepad
      ? this.scene.input.gamepad.gamepads
      : [];
    const pad = pads && pads.length ? pads[0] : null;
    if (!pad) return;

    const now = Date.now();
    const axisY = pad.axes && pad.axes[1] ? pad.axes[1].getValue() : 0;
    const upPressed =
      axisY < -0.5 || (pad.buttons[12] && pad.buttons[12].pressed);
    const downPressed =
      axisY > 0.5 || (pad.buttons[13] && pad.buttons[13].pressed);

    if (now - this._lastNavTime > this._navCooldown) {
      if (upPressed) {
        this.selectButton(this.selectedButtonIndex - 1);
        this._lastNavTime = now;
      } else if (downPressed) {
        this.selectButton(this.selectedButtonIndex + 1);
        this._lastNavTime = now;
      }
    }

    const aPressed = pad.buttons[0] && pad.buttons[0].pressed;
    if (aPressed && !this._lastAState) {
      const b = this.menuButtons && this.menuButtons[this.selectedButtonIndex];
      if (b && b.callback) b.callback();
    }
    this._lastAState = !!aPressed;
  }
}
