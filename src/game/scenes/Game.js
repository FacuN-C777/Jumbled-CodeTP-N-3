import { Scene } from "phaser";
import Player from "../classes/Player.js";
import Objects from "../classes/Objects.js";
import { clients } from "../classes/Clients.js";
import HUD from "./HUD.js";
import GameManager from "../../gameManager.js";

export class Game extends Scene {
  constructor() {
    super("Game");
  }

  preload() {}

  create() {
    const map = this.make.tilemap({ key: "betaMapCoop" });
    const paredes = map.addTilesetImage("wallsFinal", "wallTiles");
    const muebles = map.addTilesetImage("furniture", "furnitureTiles");
    const wallLayer = map.createLayer("Paredes", paredes, 0, 0);
    const furnitureLayer = map.createLayer("Muebles", muebles, 0, 0);
    const objectsLayer = map.getObjectLayer("Objetos");
    //Getting player spawn location
    const spawnPoint1 = map.findObject(
      "Objetos",
      (obj) => obj.name === "Jugador1"
    );
    const spawnPoint2 = map.findObject(
      "Objetos",
      (obj) => obj.name === "Jugador2"
    );
    this.cameras.main.setBackgroundColor(0x111111);
    this.centerY = this.cameras.main.height / 2;
    this.player1 = new Player(this, "p1", spawnPoint1.x, spawnPoint1.y, 1);
    this.add.existing(this.player1);
    this.player2 = new Player(this, "p2", spawnPoint2.x, spawnPoint2.y, 2);
    this.add.existing(this.player2);
    this.ClientSpawnLocations = [];
    this.objectSpawnLocations = [];
    // find colectable-type objects in object layer & add to array
    objectsLayer.objects.forEach((objData) => {
      const { x = 0, y = 0, name, type } = objData;
      switch (type) {
        case "objects_spawn": {
          //Getting posible locations for collectibles to spawn
          this.objectSpawnLocations.push(objData);
          break;
        }
        case "clients_spawn": {
          //Getting posible locations for collectibles to spawn
          this.ClientSpawnLocations.push(objData);
          break;
        }
      }
    });
    // Centralize gamepad handling:
    if (this.input && this.input.gamepad) {
      const gp = this.input.gamepad;
      // Remove any previously registered connected/disconnected listeners
      if (typeof gp.removeAllListeners === "function") {
        gp.removeAllListeners("connected");
        gp.removeAllListeners("disconnected");
      }

      // Helper: try to assign Phaser-wrapped pads to players, retry a few times
      const tryAssignPads = (() => {
        let attempts = 0;
        return () => {
          attempts++;
          const pads = gp.pads || [];
          if (pads.length > 0 || attempts > 10) {
            // assign if available, otherwise null
            this.player1.inputSystem.gamepad = pads[0] || null;
            this.player2.inputSystem.gamepad = pads[1] || null;
            return;
          }
          // wait a bit for Phaser to wrap connected pads
          this.time.delayedCall(100, tryAssignPads);
        };
      })();
      tryAssignPads();

      // Register centralized handlers that map pad index to the correct player
      gp.on("connected", (pad) => {
        if (pad.index === 0) this.player1.inputSystem.gamepad = pad;
        if (pad.index === 1) this.player2.inputSystem.gamepad = pad;
      });
      gp.on("disconnected", (pad) => {
        if (pad.index === 0) this.player1.inputSystem.gamepad = null;
        if (pad.index === 1) this.player2.inputSystem.gamepad = null;
      });
    }
    wallLayer.setCollisionByProperty({ colisionable: true });
    furnitureLayer.setCollisionByProperty({ colisionable: true });
    this.physics.add.collider(this.player1, wallLayer);
    this.physics.add.collider(this.player2, wallLayer);
    this.physics.add.collider(this.player1, furnitureLayer);
    this.physics.add.collider(this.player2, furnitureLayer);
    this.objects = new Objects(this);
    this.physics.add.collider(this.objects.group, wallLayer);
    this.clientsGroup = this.add.group();
    this.physics.add.collider(this.player1, this.player2);
    // HUD
    // ensure any existing HUD is stopped (prevents persistence across scenes), then launch fresh
    if (this.scene.isActive("HUD")) {
      this.scene.stop("HUD");
    }
    this.scene.launch("HUD");
    this.hud = this.scene.get("HUD");
    // when this Game scene shuts down, stop the HUD so it doesn't linger
    this.events.on("shutdown", () => {
      if (this.scene.isActive("HUD")) this.scene.stop("HUD");
      // stop coop music if playing
      if (this.coopMusic && this.coopMusic.isPlaying) this.coopMusic.stop();
    });

    // stop menu music if still playing, then play coop theme looped
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

    // Spawn clients periodically
    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        // delegate spawning to the clients class (it will check tilemap spawns and proximity)
        clients.spawn(this, 48);
      },
    });

    // Pause handling: ESC launches PauseMenu and pauses this scene; pause music as well.
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.launch("PauseMenu");
      this.scene.pause(); // pause this Game scene
      if (this.coopMusic && this.coopMusic.isPlaying) {
        try {
          this.coopMusic.pause();
        } catch (e) {}
      }
    });

    // When this scene is resumed (e.g. from PauseMenu), resume coop music if it was paused.
    this.events.on("resume", () => {
      if (this.coopMusic && this.coopMusic.isPaused) {
        try {
          this.coopMusic.resume();
        } catch (e) {}
      }
    });
  }

  update(time, delta) {
    const dt = delta / 1000;
    this.player1.update(dt, this.objects.group);
    this.player2.update(dt, this.objects.group);
    // Update all clients
    this.clientsGroup.getChildren().forEach((client) => client.update(dt));
    // Update HUD money and round info
    if (this.hud) {
      // only update current money (used for round goal)
      this.hud.updateMoney(GameManager.getInstance().getMoney());
      // removed: this.hud.updateTotalMoney(...)
      this.hud.updateRound(GameManager.getInstance().getRound());
      this.hud.updateRoundGoal(GameManager.getInstance().getMoneyGoal());
    }
  }

  startRoundTimer() {
    this.roundActive = true;
    this.roundInterval = false;
    this.timeLeft = this.roundTime;
    if (this.hud) {
      this.hud.updateRound(GameManager.getInstance().getRound());
      this.hud.updateRoundTimer(this.timeLeft);
      this.hud.updateRoundInterval(false);
      this.hud.updateRoundGoal(GameManager.getInstance().getMoneyGoal());
    }
    if (this.timer) this.timer.remove();
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        if (this.hud) this.hud.updateRoundTimer(this.timeLeft);
        // Check for round completion
        if (
          this.timeLeft <= 0 ||
          GameManager.getInstance().getMoney() >=
            GameManager.getInstance().getMoneyGoal()
        ) {
          this.endRound();
        }
      },
      loop: true,
    });
  }

  endRound() {
    this.roundActive = false;
    this.roundInterval = true;
    if (this.timer) this.timer.remove();
    // Check if money goal was met, otherwise go to GameOver
    if (
      GameManager.getInstance().getMoney() <
      GameManager.getInstance().getMoneyGoal()
    ) {
      // stop coop music when going to game over
      try {
        if (this.coopMusic && this.coopMusic.isPlaying) this.coopMusic.stop();
      } catch (e) {}
      this.scene.start("GameOver", {
        score: GameManager.getInstance().getTotalMoney(),
      });
      return;
    }
    if (this.hud) {
      this.hud.updateRoundInterval(true);
      this.hud.updateRoundTimer(this.intervalTime);
    }
    this.timeLeft = this.intervalTime;
    this.intervalTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        if (this.hud) this.hud.updateRoundTimer(this.timeLeft);
        if (this.timeLeft <= 0) {
          this.startNextRound();
        }
      },
      loop: true,
    });
  }

  startNextRound() {
    if (this.intervalTimer) this.intervalTimer.remove();
    GameManager.getInstance().nextRound();
    this.startRoundTimer();
  }
}
