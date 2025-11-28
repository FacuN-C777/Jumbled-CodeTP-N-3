import { Scene } from "phaser";
import keys from "../../utils/enums/keys";
import { getTranslations, getPhrase } from "../../utils/Translations";
import { DE, EN, ES, PT } from "../../enums/languages";
import { FETCHED, FETCHING, READY, TODO } from "../../enums/status";

export class MainMenu extends Scene {
  #textSpanish;
  #textGerman;
  #textEnglish;
  #textPortuguese;

  #updatedTextInScene;
  #updatedString = "Siguiente";
  #wasChangedLanguage = TODO;
  constructor() {
    super("MainMenu");
    const { play, coop, language, controls } = keys.sceneInitialMenu;
    this.play = play;
    this.coop = coop;
    this.language = language;
    this.controls = controls;
    this.#updatedString = next;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x0a0a0a);

    // initialize menu navigation state for gamepad
    this.menuButtons = [];
    this.selectedButtonIndex = 0;
    this._lastNavTime = 0;
    this._navCooldown = 200; // ms
    this._lastAState = false;

    const title = this.add
      .text(512, 200, "JUMBLED CODE", {
        fontFamily: "Arial",
        fontSize: "64px",
        color: "#00ffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: title,
      alpha: { from: 0.4, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });

    this.selectedMode = getPhrase(this.coop);

    // If a gamepad was connected before the scene started, Phaser may take a moment
    // to wrap it. Poll a few times so gp.pads becomes available for immediate navigation.
    if (this.input && this.input.gamepad) {
      const gp = this.input.gamepad;
      let attempts = 0;
      const waitForPads = () => {
        attempts++;
        const pads = gp.pads || [];
        if (pads.length > 0 || attempts > 10) {
          // nothing else needed here; update() reads gp.gamepads directly,
          // this ensures gp.pads will be populated shortly after scene start.
          return;
        }
        this.time.delayedCall(100, waitForPads);
      };
      waitForPads();
    }

    // create buttons (they will register themselves)
    this.createButton(512, 305, getPhrase(this.play), () => {
      if (this.selectedMode === "Cooperativo") {
        this.sound.context.resume();
        this.scene.start("Game");
      } else {
        this.scene.start("Versus");
      }
    });

    this.createModeSelector(512, 365);

    this.createButton(512, 425, getPhrase(this.language), () => {
      console.log("Idiomas");
    });

    this.createButton(512, 485, getPhrase(this.controls), () => {
      this.scene.start("ControlsScene");
    });

    // Play main menu music (looped). Keep reference to stop later.
    if (!this.bgMusic) {
      this.bgMusic = this.sound.add("MainMenuMusic", {
        loop: true,
        volume: 0.2,
      });
      try {
        this.bgMusic.play();
      } catch (e) {}
    }

    // ensure first button is selected visually
    this.selectButton(0);

    // stop music when scene shuts down to prevent it persisting
    this.events.on("shutdown", () => {
      if (this.bgMusic && this.bgMusic.isPlaying) this.bgMusic.stop();
    });
  }

  createButton(x, y, text, callback) {
    const buttonText = this.add
      .text(0, 0, text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "36px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const glow = this.add
      .rectangle(0, 0, buttonText.width + 40, 50, 0x000000, 0)
      .setStrokeStyle(2, 0x00ffff)
      .setOrigin(0.5);

    const button = this.add.container(x, y, [glow, buttonText]);
    button.setSize(glow.width, glow.height);
    button.setInteractive({ useHandCursor: true });

    // attach callback for gamepad-triggered "click"
    button._callback = callback;
    // register in menuButtons for gamepad navigation
    if (!this.menuButtons) this.menuButtons = [];
    this.menuButtons.push({ container: button, glow, callback });

    button.on("pointerover", () => {
      glow.setFillStyle(0x00ffff, 0.15);
      // sync selected index when mouse hovers
      const idx = this.menuButtons.findIndex((b) => b.container === button);
      if (idx >= 0) this.selectedButtonIndex = idx;
    });
    button.on("pointerout", () => {
      glow.setFillStyle(0x000000, 0);
    });

    button.on("pointerdown", callback);

    this.tweens.add({
      targets: glow,
      strokeAlpha: { from: 0.4, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // override the Play button callback to stop menu music before switching
    if (text === "Jugar") {
      const original = callback;
      callback = () => {
        if (this.bgMusic && this.bgMusic.isPlaying) this.bgMusic.stop();
        original();
      };
    }
  }

  // update selection visual
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
      // small scale cue
      b.container.setScale(i === index ? 1.02 : 1);
    });
  }

  update() {
    if (this.#wasChangedLanguage === FETCHED) {
      this.#wasChangedLanguage = READY;
      this.#updatedTextInScene.setText(getPhrase(this.#updatedString));
    }
    // poll first connected pad (if any)
    const pads = this.input.gamepad ? this.input.gamepad.gamepads : [];
    const pad = pads && pads.length ? pads[0] : null;
    const now = Date.now();

    if (pad) {
      // read vertical axis (axis 1) for up/down navigation
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

      // A / primary button triggers the selected button callback
      const aPressed = pad.buttons[0] && pad.buttons[0].pressed;
      if (aPressed && !this._lastAState) {
        const b =
          this.menuButtons && this.menuButtons[this.selectedButtonIndex];
        if (b && b.callback) {
          b.callback();
        }
      }
      this._lastAState = !!aPressed;
    }
  }

  createModeSelector(x, y) {
    const bg = this.add
      .rectangle(x, y, 300, 50, 0x000000, 0)
      .setStrokeStyle(2, 0x00ffff)
      .setOrigin(0.5);

    const modeText = this.add
      .text(x, y, this.selectedMode, {
        fontFamily: "Arial",
        fontSize: "36px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const leftArrow = this.add
      .text(x - 130, y, "<", {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#00ffff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const rightArrow = this.add
      .text(x + 130, y, ">", {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#00ffff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    leftArrow.on("pointerdown", () => {
      this.selectedMode =
        this.selectedMode === getPhrase(this.coop)
          ? "Versus"
          : getPhrase(this.coop);
      modeText.setText(this.selectedMode);
    });

    rightArrow.on("pointerdown", () => {
      this.selectedMode =
        this.selectedMode === getPhrase(this.coop)
          ? "Versus"
          : getPhrase(this.coop);
      modeText.setText(this.selectedMode);
    });

    this.tweens.add({
      targets: bg,
      strokeAlpha: { from: 0.4, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: [leftArrow, rightArrow],
      alpha: { from: 0.5, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
