import { Scene } from "phaser";

export class GameOverVersus extends Phaser.Scene {
  constructor() {
    super("GameOverVersus");
  }

  create(data) {
    
    const { winner, money } = data;

    this.cameras.main.setBackgroundColor(0x0a0a0a);
    this.add.image(512, 384, "background").setAlpha(0.5);

    const title = this.add
      .text(512, 200, "¡Juego Terminado!", {
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

    this.add
      .text(512, 320, `Ganador: ${winner}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(512, 360, `Dinero obtenido: $${money}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const hint = this.add
      .text(512, 440, "Presiona cualquier botón para volver al menú", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "16px",
        color: "#00ffff",
      })
      .setOrigin(0.5);

   
    this.input.once("pointerdown", () => this.scene.start("MainMenu"));
    this.input.keyboard.once("keydown", () => this.scene.start("MainMenu"));
    if (this.input && this.input.gamepad) {
      const gp = this.input.gamepad;
      gp.on("down", () => this.scene.start("MainMenu"));
    }
  }
}
