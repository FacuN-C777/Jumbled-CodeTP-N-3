import { Scene } from "phaser";
import { clients } from "../classes/Clients.js";
import { GameSceneInitializer } from "../classes/GameSceneInitializer.js";
import { RoundTimer } from "../classes/RoundTimer.js";
import GameManager from "../../gameManager.js";

export class Game extends Scene {
  constructor() {
    super("Game");
  }

  create() {
    this.cameras.main.setBackgroundColor(0x111111);
    const initializer = new GameSceneInitializer(this);

    const { wallLayer, furnitureLayer, map } = initializer.setupMap();
    const { player1, player2 } = initializer.setupPlayers(
      wallLayer,
      furnitureLayer,
      map
    );

    this.player1 = player1;
    this.player2 = player2;
    this.clientsGroup = this.add.group();

    initializer.setupObjectSpawns(map);
    initializer.setupCollectibles(wallLayer);
    initializer.setupGamepadHandling();

    // HUD
    if (this.scene.isActive("HUD")) this.scene.stop("HUD");
    this.scene.launch("HUD");
    this.hud = this.scene.get("HUD");

    this.events.on("shutdown", () => {
      if (this.scene.isActive("HUD")) this.scene.stop("HUD");
      if (this.coopMusic?.isPlaying) this.coopMusic.stop();
    });

    // ...existing music setup...
    try {
      this.sound.stopByKey("MainMenuMusic");
    } catch (e) {}
    this.coopMusic = this.sound.add("CoopModeMusic", {
      loop: true,
      volume: 0.2,
    });
    try {
      this.coopMusic.play();
    } catch (e) {}

    this.sonidoDinero = this.sound.add("cashsound");

    // Initialize round timer
    this.roundTimer = new RoundTimer(this, this.hud);
    this.roundTimer.start((reason) => {
      if (reason === "failed") {
        try {
          if (this.coopMusic?.isPlaying) this.coopMusic.stop();
        } catch (e) {}
        this.scene.start("GameOver", {
          score: GameManager.getInstance().getTotalMoney(),
        });
      }
    });

    // Spawn clients periodically
    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        clients.spawn(this, 48);
      },
    });

    // Pause handling
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.launch("PauseMenu");
      this.scene.pause();
      if (this.coopMusic?.isPlaying) {
        try {
          this.coopMusic.pause();
        } catch (e) {}
      }
    });

    this.events.on("resume", () => {
      if (this.coopMusic?.isPaused) {
        try {
          this.coopMusic.resume();
        } catch (e) {}
      }
    });
  }

  update() {
    this.player1.update();
    this.player2.update();
    this.clientsGroup.getChildren().forEach((client) => client.update());

    if (this.hud) {
      this.hud.updateMoney(GameManager.getInstance().getMoney());
      this.hud.updateRound(GameManager.getInstance().getRound());
      this.hud.updateRoundGoal(GameManager.getInstance().getMoneyGoal());
    }
  }

  shutdown() {
    if (this.roundTimer) this.roundTimer.cleanup();
  }
}
