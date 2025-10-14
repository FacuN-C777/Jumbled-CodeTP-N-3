class GameManager {
  static instance;

  constructor() {
    if (GameManager.instance) {
      return GameManager.instance;
    }
    this.moneyCount = 0;
    this.totalMoney = 0;
    this.round = 1;
    this.moneyGoal = 200;
    GameManager.instance = this;
  }

  static getInstance() {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  addMoney(amount) {
    this.moneyCount += amount;
    this.totalMoney += amount;
  }

  getMoney() {
    return this.moneyCount;
  }

  getTotalMoney() {
    return this.totalMoney;
  }

  resetMoney() {
    this.moneyCount = 0;
  }

  setMoneyGoal(goal) {
    this.moneyGoal = goal;
  }

  getMoneyGoal() {
    return this.moneyGoal;
  }

  setRound(round) {
    this.round = round;
  }

  getRound() {
    return this.round;
  }

  nextRound() {
    this.round++;
    this.resetMoney();
    this.moneyGoal += 1000; // Increase goal per round (optional)
  }
}

export default GameManager;
