import { Scene } from "phaser";

export class PauseMenu extends Scene {
  constructor() {
    super("PauseMenu");
  }

  create() {
   this.scene.bringToTop();
    const panel = this.add.rectangle(512, 384, 400, 300, 0x000000, 0.6)
      .setStrokeStyle(3, 0x00ffff)
      .setOrigin(0.5);

    
    this.tweens.add({
      targets: panel,
      strokeAlpha: { from: 0.5, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    
    const title = this.add.text(512, 280, "PAUSA", {
      fontFamily: "Arial",
      fontSize: "48px",
      color: "#00ffff",
      fontStyle: "bold",
    }).setOrigin(0.5);

  this.tweens.add({
          targets: title,
          alpha: { from: 0.4, to: 1 },
          duration: 2000,
          yoyo: true,
          repeat: -1
        });




    this.createButton(512, 360, "Reanudar", () => {
  if (this.scene.isPaused("Game")) this.scene.resume("Game");
  if (this.scene.isPaused("Versus")) this.scene.resume("Versus");
  this.scene.stop("PauseMenu");
});

this.createButton(512, 420, "Reiniciar", () => {
  if (this.scene.isPaused("Game")) {
    this.scene.stop("Game");
    this.scene.start("Game");
  }
  if (this.scene.isPaused("Versus")) {
    this.scene.stop("Versus");
    this.scene.start("Versus");
  }
  this.scene.stop("PauseMenu");
});

this.createButton(512, 480, "Salir al Menú", () => {
  if (this.scene.isPaused("Game")) this.scene.stop("Game");
  if (this.scene.isPaused("Versus")) this.scene.stop("Versus");
  this.scene.start("MainMenu");
  this.scene.stop("PauseMenu");
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
      ease: "Sine.easeInOut"
    });
  }
}