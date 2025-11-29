import { Scene } from "phaser";
import Player from "../classes/Player.js";
import Objects from "../classes/Objects.js";
import { clients } from "../classes/Clients.js";
import HUDVersus from "./HUDVersus.js";
import { GameOverVersus } from "./GameOverVersus.js";

export class Versus extends Scene {
  constructor() {
    super("Versus");
    this.moneyPlayer1 = 0;
    this.moneyPlayer2 = 0;
  }

  preload() {}

  create() {
    const map = this.make.tilemap({ key: "betaMapCoop" });
    const paredes = map.addTilesetImage("wallsFinal", "wallTiles");
    const muebles = map.addTilesetImage("furniture", "furnitureTiles");
    const wallLayer = map.createLayer("Paredes", paredes, 0, 0);
    const furnitureLayer = map.createLayer("Muebles", muebles, 0, 0);
    const objectsLayer = map.getObjectLayer("Objetos");

    const spawnPoint1 = map.findObject(
      "Objetos",
      (obj) => obj.name === "Jugador1"
    );
    const spawnPoint2 = map.findObject(
      "Objetos",
      (obj) => obj.name === "Jugador2"
    );

    this.cameras.main.setBackgroundColor(0x111111);

    this.player1 = new Player(this, "p1", spawnPoint1.x, spawnPoint1.y, 1);
    this.add.existing(this.player1);
    this.player2 = new Player(this, "p2", spawnPoint2.x, spawnPoint2.y, 2);
    this.add.existing(this.player2);

    this.ClientSpawnLocations = [];
    this.objectSpawnLocations = [];

    objectsLayer.objects.forEach((objData) => {
      if (objData.type === "objects_spawn")
        this.objectSpawnLocations.push(objData);
      if (objData.type === "clients_spawn")
        this.ClientSpawnLocations.push(objData);
    });

    if (this.input && this.input.gamepad) {
      const gp = this.input.gamepad;
      if (typeof gp.removeAllListeners === "function") {
        gp.removeAllListeners("connected");
        gp.removeAllListeners("disconnected");
      }
      const tryAssignPads = (() => {
        let attempts = 0;
        return () => {
          attempts++;
          const pads = gp.pads || [];
          if (pads.length > 0 || attempts > 10) {
            this.player1.inputHandler.inputSystem.gamepad = pads[0] || null;
            this.player2.inputHandler.inputSystem.gamepad = pads[1] || null;
            return;
          }
          this.time.delayedCall(100, tryAssignPads);
        };
      })();
      tryAssignPads();
      gp.on("connected", (pad) => {
        if (pad.index === 0)
          this.player1.inputHandler.inputSystem.gamepad = pad;
        if (pad.index === 1)
          this.player2.inputHandler.inputSystem.gamepad = pad;
      });
      gp.on("disconnected", (pad) => {
        if (pad.index === 0)
          this.player1.inputHandler.inputSystem.gamepad = null;
        if (pad.index === 1)
          this.player2.inputHandler.inputSystem.gamepad = null;
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

    if (this.scene.isActive("HUDVersus")) this.scene.stop("HUDVersus");
    this.scene.launch("HUDVersus");
    this.hud = this.scene.get("HUDVersus");

    this.events.on("shutdown", () => {
      if (this.scene.isActive("HUDVersus")) this.scene.stop("HUDVersus");
      if (this.coopMusic && this.coopMusic.isPlaying) this.coopMusic.stop();
    });

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

    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => clients.spawn(this, 48),
    });
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.launch("PauseMenu");
      this.scene.pause();
      if (this.coopMusic && this.coopMusic.isPlaying) this.coopMusic.pause();
    });
    this.events.on("resume", () => {
      if (this.coopMusic && this.coopMusic.isPaused) this.coopMusic.resume();
    });

    const scene = this;
    const cashPerDelivery = 10;

    const origDeliver1 = this.player1.objectInteraction.tryDeliverToClient.bind(
      this.player1.objectInteraction
    );
    this.player1.objectInteraction.tryDeliverToClient = function () {
      const delivered = origDeliver1();
      if (delivered) {
        scene.moneyPlayer1 += cashPerDelivery;
        if (scene.hud && typeof scene.hud.updateMoney === "function") {
          scene.hud.updateMoney(1, scene.moneyPlayer1);
        }
        if (scene.sonidoDinero) scene.sonidoDinero.play();
      }
      return delivered;
    };

    const origDeliver2 = this.player2.objectInteraction.tryDeliverToClient.bind(
      this.player2.objectInteraction
    );
    this.player2.objectInteraction.tryDeliverToClient = function () {
      const delivered = origDeliver2();
      if (delivered) {
        scene.moneyPlayer2 += cashPerDelivery;
        if (scene.hud && typeof scene.hud.updateMoney === "function") {
          scene.hud.updateMoney(2, scene.moneyPlayer2);
        }
        if (scene.sonidoDinero) scene.sonidoDinero.play();
      }
      return delivered;
    };

    this.roundTime = 60;
    this.timeLeft = this.roundTime;
    this.startRoundTimer();
  }

  update(time, delta) {
    const dt = delta / 1000;
    this.player1.update(dt, this.objects.group);
    this.player2.update(dt, this.objects.group);
    this.clientsGroup.getChildren().forEach((client) => client.update(dt));
    if (this.hud) this.hud.updateRoundTimer(this.timeLeft);
  }

  startRoundTimer() {
    this.timer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.timeLeft--;
        if (this.hud) this.hud.updateRoundTimer(this.timeLeft);
        if (this.timeLeft <= 0) this.endRound();
      },
    });
  }

  endRound() {
    if (this.timer) this.timer.remove();

    let winner = "Empate";
    let money = 0;

    if (this.moneyPlayer1 > this.moneyPlayer2) {
      winner = "Jugador 1";
      money = this.moneyPlayer1;
    } else if (this.moneyPlayer2 > this.moneyPlayer1) {
      winner = "Jugador 2";
      money = this.moneyPlayer2;
    } else {
      winner = "Empate";
      money = this.moneyPlayer1;
    }

    this.scene.start("GameOverVersus", { winner, money });
  }
}
