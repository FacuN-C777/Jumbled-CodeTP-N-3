import { Scene } from "phaser";
import keys from "../../utils/enums/keys";
import { getTranslations, getPhrase } from "../../utils/Translations";

export class GameOverVersus extends Phaser.Scene {
  constructor() {
    super("GameOverVersus");
    const { gamemover, winnert, totalscore, retry } = keys.sceneGameOverVs;
    this.gamemover = gamemover;
    this.winnert = winnert;
    this.totalscore = totalscore;
    this.retry = retry;
  }

  create(data) {
    const { winner, money } = data;

    this.cameras.main.setBackgroundColor(0x0a0a0a);
    this.add.image(512, 384, "background").setAlpha(0.5);

    const title = this.add
      .text(512, 200, getPhrase(this.gamemover), {
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
      .text(512, 320, getPhrase(this.winnert) + `: ${winner}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(512, 360, getPhrase(this.totalscore) + `: $${money}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const hint = this.add
      .text(512, 440, getPhrase(this.retry), {
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
