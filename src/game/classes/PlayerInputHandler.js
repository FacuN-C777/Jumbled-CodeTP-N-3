import InputSystem, { INPUT_ACTIONS } from "../utils/InputSystem.js";

export class PlayerInputHandler {
  constructor(scene, playerNumber) {
    this.scene = scene;
    this.playerNumber = playerNumber;
    this.inputSystem = new InputSystem(scene.input);
    this._lastWestTime = 0;
    this._westCooldown = 200;

    this.configureKeyboard();
    this.initializeGamepad();
  }

  configureKeyboard() {
    if (this.playerNumber === 1) {
      this.inputSystem.configureKeyboard({
        [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.W],
        [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.S],
        [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.D],
        [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.A],
        [INPUT_ACTIONS.WEST]: [Phaser.Input.Keyboard.KeyCodes.E],
      });
    } else if (this.playerNumber === 2) {
      this.inputSystem.configureKeyboard({
        [INPUT_ACTIONS.UP]: [Phaser.Input.Keyboard.KeyCodes.UP],
        [INPUT_ACTIONS.DOWN]: [Phaser.Input.Keyboard.KeyCodes.DOWN],
        [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.RIGHT],
        [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.LEFT],
        [INPUT_ACTIONS.WEST]: [Phaser.Input.Keyboard.KeyCodes.SPACE],
      });
    }
  }

  initializeGamepad() {
    if (this.scene.input && this.scene.input.gamepad) {
      const pads = this.scene.input.gamepad.pads || [];
      this.inputSystem.gamepad = pads[this.playerNumber - 1] || null;
    }
  }

  getMovementInput() {
    let vx = 0,
      vy = 0;
    if (this.inputSystem.isPressed(INPUT_ACTIONS.LEFT)) vx = -1;
    if (this.inputSystem.isPressed(INPUT_ACTIONS.RIGHT)) vx = 1;
    if (this.inputSystem.isPressed(INPUT_ACTIONS.UP)) vy = -1;
    if (this.inputSystem.isPressed(INPUT_ACTIONS.DOWN)) vy = 1;
    return { vx, vy };
  }

  isActionPressed() {
    return this.inputSystem.isJustPressed(INPUT_ACTIONS.WEST);
  }

  canActionTrigger() {
    const now = Date.now();
    if (now - this._lastWestTime < this._westCooldown) return false;
    this._lastWestTime = now;
    return true;
  }
}
