import { Boot } from "./scenes/Boot";
import { Game as MainGame } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import { PauseMenu } from "./scenes/PauseMenu";
import { AUTO, Game } from "phaser";
import { HUD } from "./scenes/HUD";

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: "game-container",
  backgroundColor: "#028af8",
  input: { gamepad: true },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    // 🔹 agregá esto
    default: "arcade",
    arcade: { debug: false },
  },
  scene: [Boot, Preloader, MainMenu, MainGame, GameOver, HUD, PauseMenu],
};

const StartGame = (parent) => {
  return new Game({ ...config, parent });
};

export default StartGame;
