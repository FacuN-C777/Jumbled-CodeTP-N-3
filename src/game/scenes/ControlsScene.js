import { Scene } from "phaser";
import keys from "../../enums/keys.js";
import { getTranslations, getPhrase } from "../../services/translations.js";

export class ControlsScene extends Scene {
  constructor() {
    super("ControlsScene");
    const { controls, move, stick, grabthroworder, back } =
      keys.sceneGameControls;
    this.controls = controls;
    this.move = move;
    this.stick = stick;
    this.grabthroworder = grabthroworder;
    this.back = back;
  }

  create() {
    this.add.image(512, 384, "controles").setOrigin(0.5, 0.5);

    const title = this.add
      .text(512, 100, getPhrase(this.controls), {
        fontFamily: '"Press Start 2P", monospace',
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

    this.createButton(512, 680, getPhrase(this.back), () => {
      this.scene.start("MainMenu");
    });
  }

  createButton(x, y, text, callback) {
    const buttonText = this.add
      .text(0, 0, text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const glow = this.add
      .rectangle(0, 0, buttonText.width + 40, 45, 0x000000, 0)
      .setStrokeStyle(2, 0x00ffff)
      .setOrigin(0.5);

    const button = this.add.container(x, y, [glow, buttonText]);
    button.setSize(glow.width, glow.height);
    button.setInteractive({ useHandCursor: true });

    button.on("pointerover", () => glow.setFillStyle(0x00ffff, 0.15));
    button.on("pointerout", () => glow.setFillStyle(0x000000, 0));
    button.on("pointerdown", callback);

    this.tweens.add({
      targets: glow,
      strokeAlpha: { from: 0.4, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
