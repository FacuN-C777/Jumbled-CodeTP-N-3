import GameManager from "../../gameManager.js";

export class RoundTimer {
  constructor(scene, hud) {
    this.scene = scene;
    this.hud = hud;
    this.roundActive = true;
    this.roundInterval = false;
    this.roundTime = 120;
    this.intervalTime = 15;
    this.timeLeft = this.roundTime;
    this.timer = null;
    this.onRoundEnd = null;
  }

  start(onRoundEnd) {
    this.onRoundEnd = onRoundEnd;
    this.roundActive = true;
    this.roundInterval = false;
    this.timeLeft = this.roundTime;

    if (this.hud) {
      this.hud.updateRound(GameManager.getInstance().getRound());
      this.hud.updateRoundTimer(this.timeLeft);
      this.hud.updateRoundInterval(false);
      this.hud.updateRoundGoal(GameManager.getInstance().getMoneyGoal());
    }

    this.startCountdown();
  }

  startCountdown() {
    if (this.timer) this.timer.remove();
    this.timer = this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        if (this.hud) this.hud.updateRoundTimer(this.timeLeft);

        if (
          this.timeLeft <= 0 ||
          GameManager.getInstance().getMoney() >=
            GameManager.getInstance().getMoneyGoal()
        ) {
          this.end();
        }
      },
      loop: true,
    });
  }

  end() {
    this.roundActive = false;
    this.roundInterval = true;
    if (this.timer) this.timer.remove();

    if (
      GameManager.getInstance().getMoney() <
      GameManager.getInstance().getMoneyGoal()
    ) {
      if (this.onRoundEnd) this.onRoundEnd("failed");
      return;
    }

    if (this.hud) {
      this.hud.updateRoundInterval(true);
      this.hud.updateRoundTimer(this.intervalTime);
    }

    this.timeLeft = this.intervalTime;
    this.timer = this.scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        if (this.hud) this.hud.updateRoundTimer(this.timeLeft);
        if (this.timeLeft <= 0) {
          GameManager.getInstance().nextRound();
          this.start(this.onRoundEnd);
        }
      },
      loop: true,
    });
  }

  cleanup() {
    if (this.timer) this.timer.remove();
  }
}
