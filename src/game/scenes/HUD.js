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
      color: "#028af8",
      fontFamily: '"Press Start 2P", monospace',
    });
    this.moneyText.setScrollFactor(0);

    // Texto de la ronda actual
    this.roundText = this.add.text(this.scale.width / 2, 20, "Ronda 0", {
      fontSize: "24px",
      color: "#000000ff",
      fontFamily: '"Press Start 2P", monospace',
    });
    this.roundText.setScrollFactor(0);

    // Texto del objetivo de la ronda actual
    this.roundGoalText = this.add.text(this.scale.width / 2, 50, "Meta: 0", {
      fontSize: "20px",
      color: "#2c2601ff",
      fontFamily: '"Press Start 2P", monospace',
    });
    this.roundGoalText.setScrollFactor(0);

    // Texto del intervalo de la ronda actual
    this.roundIntervalText = this.add.text(this.scale.width / 2, 80, "", {
      fontSize: "20px",
      color: "#990000",
      fontFamily: '"Press Start 2P", monospace',
    });
    this.roundIntervalText.setScrollFactor(0);

    // Texto del tiempo restante de la ronda actual
    this.roundTimerText = this.add.text(
      this.scale.width - 270,
      20,
      `Tiempo Restante: ${this.roundTimeLeft}`,
      {
        fontSize: "24px",
        color: "#028af8",
        fontFamily: '"Press Start 2P", monospace',
      }
    );
    this.roundTimerText.setScrollFactor(0);
  }

  updateMoney(count) {
    this.moneyCount = count;
    if (this.moneyText) this.moneyText.setText(`Dinero : ${this.moneyCount}`);
  }

  // keep method but no-op so callers don't break; total money displayed in GameOver only
  updateTotalMoney(/* total */) {
    // intentionally left blank
  }

  updateRound(count) {
    this.roundCount = count;
    if (this.roundText) this.roundText.setText(`Ronda ${this.roundCount}`);
  }

  updateRoundGoal(goal) {
    if (this.roundGoalText) this.roundGoalText.setText(`Meta: ${goal}`);
  }

  updateRoundInterval(isInterval) {
    if (this.roundIntervalText)
      this.roundIntervalText.setText(isInterval ? "¡Nueva ronda pronto!" : "");
  }

  updateRoundTimer(count) {
    this.roundTimeLeft = count;
    if (this.roundTimerText)
      this.roundTimerText.setText(`Tiempo Restante: ${this.roundTimeLeft}`);
  }
}

export default HUD;
