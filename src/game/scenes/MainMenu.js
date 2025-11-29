import { Scene } from "phaser";
import keys from "../../enums/keys.js";
import { getTranslations, getPhrase } from "../../services/translations.js";
import { DE, EN, ES, PT } from "../../enums/languages";
import { FETCHED, FETCHING, READY, TODO } from "../../enums/status";
import { ButtonFactory } from "../../utils/ButtonFactory.js";
import { GamepadInputHandler } from "../../utils/GamepadInputHandler.js";
import { ModeSelector } from "../../utils/ModeSelector.js";

export class MainMenu extends Scene {
  #wasChangedLanguage = TODO;
  #buttonFactory;
  #gamepadHandler;
  #modeSelector;

  constructor() {
    super("MainMenu");
    const { play, coop, languaget, controls } = keys.sceneInitialMenu;
    this.play = play;
    this.coop = coop;
    this.languaget = languaget;
    this.controls = controls;
  }

  init({ language }) {
    const persisted = (() => {
      try {
        return localStorage.getItem("jumbled_lang");
      } catch (e) {
        return null;
      }
    })();
    this.currentLanguage = language || persisted || ES;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x0a0a0a);
    this.#buttonFactory = new ButtonFactory(this);
    this.#gamepadHandler = new GamepadInputHandler(this);
    this.selectedMode = getPhrase(this.coop);

    // Create title
    const title = this.add
      .text(512, 200, "JUMBLED CODE", {
        fontFamily: "Arial",
        fontSize: "64px",
        color: "#00ffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: title,
      alpha: { from: 0.4, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
    });

    this.playbutton = this.#buttonFactory.createButton(
      512,
      305,
      getPhrase(this.play),
      () => {
        if (this.selectedMode === getPhrase(this.coop)) {
          this.sound.context.resume();
          this.scene.start("Game");
        } else {
          this.scene.start("Versus");
        }
      }
    );

    this.#modeSelector = new ModeSelector(this, 512, 365, this.selectedMode);
    this.#modeSelector.on("modeChanged", (mode) => {
      this.selectedMode = mode;
    });

    this.languagebutton = this.#buttonFactory.createButton(
      512,
      425,
      getPhrase(this.languaget),
      () => {
        const newLang = this.currentLanguage === EN ? ES : EN;
        this.getTranslations(newLang);
      }
    );

    this.controlbutton = this.#buttonFactory.createButton(
      512,
      485,
      getPhrase(this.controls),
      () => {
        this.scene.start("ControlsScene");
      }
    );

    // Play main menu music
    if (!this.bgMusic) {
      this.bgMusic = this.sound.add("MainMenuMusic", {
        loop: true,
        volume: 0.2,
      });
      try {
        this.bgMusic.play();
      } catch (e) {}
    }

    this.#gamepadHandler.selectButton(0);

    this.events.on("shutdown", () => {
      if (this.bgMusic && this.bgMusic.isPlaying) this.bgMusic.stop();
    });
  }

  update() {
    if (this.#wasChangedLanguage === FETCHED) {
      this.#wasChangedLanguage = READY;
      this.playbutton.buttonText.setText(getPhrase(this.play));
      this.languagebutton.buttonText.setText(getPhrase(this.languaget));
      this.controlbutton.buttonText.setText(getPhrase(this.controls));
    }

    this.#gamepadHandler.update();
  }

  updateWasChangedLanguage = () => {
    this.#wasChangedLanguage = FETCHED;
  };

  async getTranslations(language) {
    this.#wasChangedLanguage = FETCHING;
    await getTranslations(language, this.updateWasChangedLanguage);
    this.currentLanguage = language;
    try {
      localStorage.setItem("jumbled_lang", language);
    } catch (e) {}
  }
}
