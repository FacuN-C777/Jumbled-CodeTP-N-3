import { Boot } from "./scenes/Boot";
import { Game as MainGame } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import { PauseMenu } from "./scenes/PauseMenu";
import { AUTO, Game } from "phaser";
import { HUD } from "./scenes/HUD";
import { Versus } from "./scenes/Versus";
import { HUDVersus } from "./scenes/HUDVersus.js";
import { GameOverVersus } from "./scenes/GameOverVersus.js";
import { ControlsScene } from "./scenes/ControlsScene.js";
import { FirebasePlugin } from "../plugins/FirebasePlugin.js";
import { Login } from "./scenes/Login.js";

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
  scene: [
    Boot,
    Preloader,
    Login,
    MainMenu,
    MainGame,
    GameOver,
    HUD,
    PauseMenu,
    Versus,
    HUDVersus,
    GameOverVersus,
    ControlsScene,
  ],

  plugins: {
    global: [
      {
        key: "FirebasePlugin",
        plugin: FirebasePlugin,
        start: true,
        mapping: "firebase",
      },
    ],
  },
};

const StartGame = (parent) => {
  return new Game({ ...config, parent });
};

export default StartGame;
