import { Scene } from "phaser";

export class ControlsScene extends Scene {
  constructor() {
    super("ControlsScene");
  }

  create() {
    
    this.add.image(512, 384, "controles").setOrigin(0.5, 0.5);

   const title = this.add
      .text(512, 100, "CONTROLES", {
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

        this.createButton(512, 680, "Volver", () => {
      this.scene.start("MainMenu");
    });
  }

  createButton(x, y, text, callback) {
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: "Arial",
      fontSize: "32px",
      color: "#ffffff",
    }).setOrigin(0.5);

    const glow = this.add.rectangle(0, 0, buttonText.width + 40, 45, 0x000000, 0)
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