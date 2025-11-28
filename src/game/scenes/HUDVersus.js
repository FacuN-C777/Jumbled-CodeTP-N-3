import { Scene } from "phaser";
import keys from "../../enums/keys.js";
import { getTranslations, getPhrase } from "../../services/translations.js";

export class HUDVersus extends Scene {
  constructor() {
    super("HUDVersus");
    const { player, timer } = keys.sceneGameVs;
    this.player = player;
    this.timer = timer;
    this.moneyPlayer1 = 0;
    this.moneyPlayer2 = 0;
    this.roundTimeLeft = 120; // tiempo por defecto
  }

  create() {
    // Dinero jugador 1 - izquierda
    this.moneyPlayer1Text = this.add
      .text(20, 20, getPhrase(this.player) + " 1: $0", {
        fontSize: "24px",
        color: "#ff0000", // rojo para jugador 1
        fontFamily: '"Press Start 2P", monospace',
      })
      .setScrollFactor(0);

    // Dinero jugador 2 - derecha
    this.moneyPlayer2Text = this.add
      .text(this.scale.width - 250, 20, getPhrase(this.player) + " 2: $0", {
        fontSize: "24px",
        color: "#0000ff", // azul para jugador 2
        fontFamily: '"Press Start 2P", monospace',
      })
      .setScrollFactor(0);

    // Timer arriba centrado
    this.roundTimerText = this.add
      .text(
        this.scale.width / 2,
        20,
        getPhrase(this.timer) + `: ${this.roundTimeLeft}`,
        {
          fontSize: "24px",
          color: "#028af8",
          fontFamily: '"Press Start 2P", monospace',
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0);

    // Texto para mostrar ganador al final
    this.winnerText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "", {
        fontSize: "40px",
        color: "#000000ff",
        fontFamily: '"Press Start 2P", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
  }

  updateMoney(player, count) {
    if (player === 1) {
      this.moneyPlayer1 = count;
      if (this.moneyPlayer1Text)
        this.moneyPlayer1Text.setText(
          getPhrase(this.player) + ` 1: $${this.moneyPlayer1}`
        );
    } else if (player === 2) {
      this.moneyPlayer2 = count;
      if (this.moneyPlayer2Text)
        this.moneyPlayer2Text.setText(
          getPhrase(this.player) + ` 2: $${this.moneyPlayer2}`
        );
    }
  }

  updateRoundTimer(count) {
    this.roundTimeLeft = count;
    if (this.roundTimerText)
      this.roundTimerText.setText(
        getPhrase(this.timer) + `: ${this.roundTimeLeft}`
      );

    // Si el tiempo llega a 0, mostramos ganador
    if (this.roundTimeLeft <= 0) {
      this.showWinner();
    }
  }

  showWinner() {
    let winnerText = "Empate!";
    if (this.moneyPlayer1 > this.moneyPlayer2) {
      winnerText = "¡Jugador 1 Gana!";
    } else if (this.moneyPlayer2 > this.moneyPlayer1) {
      winnerText = "¡Jugador 2 Gana!";
    }
    if (this.winnerText) this.winnerText.setText(winnerText);
  }
}

export default HUDVersus;
