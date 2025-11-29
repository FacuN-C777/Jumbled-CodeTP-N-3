import { getPhrase } from "../services/translations.js";

export class ButtonFactory {
  constructor(scene) {
    this.scene = scene;
    this.menuButtons = [];
  }

  createButton(x, y, text, callback) {
    const buttonText = this.scene.add
      .text(0, 0, text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "36px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const glow = this.scene.add
      .rectangle(0, 0, buttonText.width + 40, 50, 0x000000, 0)
      .setStrokeStyle(2, 0x00ffff)
      .setOrigin(0.5);

    const button = this.scene.add.container(x, y, [glow, buttonText]);
    button.setSize(glow.width, glow.height);
    button.setInteractive({ useHandCursor: true });
    button.buttonText = buttonText;
    button._callback = callback;

    this.menuButtons.push({ container: button, glow, callback });

    button.on("pointerover", () => {
      glow.setFillStyle(0x00ffff, 0.15);
      const idx = this.menuButtons.findIndex((b) => b.container === button);
      if (idx >= 0) this.scene.selectedButtonIndex = idx;
    });

    button.on("pointerout", () => {
      glow.setFillStyle(0x000000, 0);
    });

    button.on("pointerdown", () => {
      if (this.scene.bgMusic && this.scene.bgMusic.isPlaying) {
        this.scene.bgMusic.stop();
      }
      callback();
    });

    this.scene.tweens.add({
      targets: glow,
      strokeAlpha: { from: 0.4, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    return button;
  }

  selectButton(index) {
    if (!this.menuButtons || this.menuButtons.length === 0) return;
    index = Phaser.Math.Wrap(index, 0, this.menuButtons.length);
    this.scene.selectedButtonIndex = index;
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
}
