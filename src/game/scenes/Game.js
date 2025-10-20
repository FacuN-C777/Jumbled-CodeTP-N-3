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
    const paredes = map.addTilesetImage("wallsBeta", "tiles");
    const wallLayer = map.createLayer("Paredes", paredes, 0, 0);
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
    this.player1 = new Player(
      this,
      "redCircle",
      spawnPoint1.x,
      spawnPoint1.y,
      1
    );
    this.add.existing(this.player1);
    this.player2 = new Player(
      this,
      "blueCircle",
      spawnPoint2.x,
      spawnPoint2.y,
      2
    );
    this.add.existing(this.player2);
    wallLayer.setCollisionByProperty({ colisionable: true });
    this.physics.add.collider(this.player1, wallLayer);
    this.physics.add.collider(this.player2, wallLayer);
    this.objects = new Objects(this);
    this.clientsGroup = this.add.group();
    this.physics.add.collider(this.player1, this.player2);
    // HUD
    this.scene.launch("HUD");
    this.hud = this.scene.get("HUD");
    //timer config
    this.timeLeft = 120;
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        // Update HUD round timer
        if (this.hud) {
          this.hud.updateRoundTimer(this.timeLeft);
        }
        if (this.timeLeft <= 0) {
          this.scene.start("GameOver", { score: this.score });
        }
      },
      loop: true,
    });
    this.roundActive = true;
    this.roundInterval = false;
    this.roundTime = 120;
    this.intervalTime = 15;
    this.timeLeft = this.roundTime;
    this.startRoundTimer();
    // Spawn clients periodically
    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        if (this.clientsGroup.getLength() >= 3) return;
        const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
        const y = Phaser.Math.Between(100, this.cameras.main.height - 100);
        const client = new clients(this, x, y, "triangle").setScale(0.1);
        this.clientsGroup.add(client);
      },
    });
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.launch("PauseMenu");
      this.scene.pause(); // Tecla esc para pausar el juego.
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
      this.hud.updateMoney(GameManager.getInstance().getMoney());
      this.hud.updateTotalMoney(GameManager.getInstance().getTotalMoney());
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
