import { Scene } from "phaser";
import GameManager from "../../gameManager.js";
import keys from "../../enums/keys.js";
import { getTranslations, getPhrase } from "../../services/translations.js";

export class GameOver extends Scene {
  constructor() {
    super("GameOver");
    const { roundsurvived, totalscore, retry } = keys.sceneGameOver;
    this.roundsurvived = roundsurvived;
    this.totalscore = totalscore;
    this.retry = retry;
  }

  create() {
    // stop other background music to avoid overlap
    try {
      this.sound.stopByKey("CoopModeMusic");
      this.sound.stopByKey("MainMenuMusic");
    } catch (e) {}

    // play single chime (do not loop)
    try {
      this.sound.play("GameOverChime", { loop: false, volume: 0.2 });
    } catch (e) {}

    this.cameras.main.setBackgroundColor(0x0a0a0a);
    this.add.image(512, 384, "background").setAlpha(0.5);

    const title = this.add
      .text(512, 200, "Game Over", {
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

    // read stats from GameManager
    const rounds = GameManager.getInstance().getRound();
    const total = GameManager.getInstance().getTotalMoney();

    this.add
      .text(512, 320, getPhrase(this.roundsurvived) + `: ${rounds}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(512, 360, getPhrase(this.totalscore) + `: ${total}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "20px",
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

    // pointer handler
    this.input.once("pointerdown", () => {
      this.scene.start("MainMenu");
    });

    // keyboard handler (any key)
    this.input.keyboard.once("keydown", () => {
      this.scene.start("MainMenu");
    });

    // gamepad: any button press returns to menu
    if (this.input && this.input.gamepad) {
      const gp = this.input.gamepad;
      // if already connected pads, also listen to 'down' from plugin
      gp.on("down", () => {
        this.scene.start("MainMenu");
      });
    }
  }
}
