class GameManager {
  static instance;

  constructor() {
    if (GameManager.instance) {
      return GameManager.instance;
    }
    this.moneyCount = 0;
    this.playerLives = 5;
    this.isInnmune = false;
    GameManager.instance = this;
  }

  static getInstance() {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  addMoney() {
    this.moneyCount++;
  }

  getMoney() {
    return this.moneyCount;
  }

  resetMoney() {
    this.moneyCount = 0;
  }

  setPlayerLives(lives) {
    this.playerLives = lives;
  }

  getPlayerLives() {
    return this.playerLives;
  }

  losePlayerLife() {
    if (this.isInnmune) return;
    this.playerLives = Math.max(0, this.playerLives - 1);
  }

  resetPlayerLives() {
    this.playerLives = 5;
  }
}

export default GameManager;
