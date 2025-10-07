import { Scene } from "phaser";

export class HUD extends Scene {
  constructor() {
    super("HUD");
    this.moneyCount = 0;
    this.roundCount = 0;
    this.roundTimeLeft = 120;
  }

  create() {
    // Texto del puntaje (en nuestro caso, dinero)
    this.moneyText = this.add.text(20, 20, "Dinero : 0", {
      fontSize: "24px",
      color: "#000000ff",
      fontFamily: "Arial",
    });
    this.moneyText.setScrollFactor(0);

    // Texto de la ronda actual
    this.roundText = this.add.text(this.scale.width / 2, 20, "Ronda 0", {
      fontSize: "24px",
      color: "#000000ff",
      fontFamily: "Arial",
    });
    this.roundText.setScrollFactor(0);

    // Texto del tiempo restante de la ronda actual
    this.roundTimerText = this.add.text(
      this.scale.width / 2,
      50,
      "Tiempo restante : 0",
      {
        fontSize: "24px",
        color: "#000000ff",
        fontFamily: "Arial",
      }
    );
    this.roundTimerText.setScrollFactor(0);
  }

  updatemoney(count) {
    this.moneyCount = count;
    this.moneyText.setText(`Ronda ${this.moneyCount}`);
  }

  updateRound(count) {
    this.roundCount = count;
    this.moneyText.setText(`Ronda ${this.roundCount}`);
  }

  updateRoundTimer(count) {
    this.roundTimeLeft = count;
    this.roundTimerText.setText(`Tiempo Restante: ${this.roundTimeLeft}`);
  }
}

export default HUD;
