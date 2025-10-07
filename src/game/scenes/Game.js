import { Scene } from "phaser";
import Player from "../classes/Player.js";
import Objects from "../classes/Objects.js";

export class Game extends Scene {
  constructor() {
    super("Game");
  }

  preload() {}

  create() {
    this.cameras.main.setBackgroundColor(0x111111);

    this.centerY = this.cameras.main.height / 2;

    this.player1 = new Player(this, "redCircle", 200, this.centerY, 1);
    this.add.existing(this.player1);
    this.player2 = new Player(this, "blueCircle", 824, this.centerY, 2);
    this.add.existing(this.player2);

    this.objects = new Objects(this);

    this.physics.add.collider(this.player1, this.player2);

    //timer config
    this.timeLeft = 40;
    this.timerText = this.add.text(680, 20, "time:" + this.timeLeft, {
      fontSize: "25px",
      color: "#000",
    });

    this.timer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;

        if (this.timeLeft <= 0) {
          this.scene.start("GameOver", { score: this.score });
        }
      },
      loop: true,
    });
  }

  update(time, delta) {
    const dt = delta / 1000; // ahora sí existe delta
    this.player1.update(dt, this.objects.group);
    this.player2.update(dt, this.objects.group);
  }
}
