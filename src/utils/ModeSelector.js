import { EventEmitter } from "eventemitter3";
import { getPhrase } from "../services/translations.js";

export class ModeSelector extends EventEmitter {
  constructor(scene, x, y, initialMode) {
    super();
    this.scene = scene;
    this.selectedMode = initialMode;

    const bg = scene.add
      .rectangle(x, y, 300, 50, 0x000000, 0)
      .setStrokeStyle(2, 0x00ffff)
      .setOrigin(0.5);

    const modeText = scene.add
      .text(x, y, initialMode, {
        fontFamily: "Arial",
        fontSize: "36px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const createArrow = (arrowX, isLeft) => {
      return scene.add
        .text(arrowX, y, isLeft ? "<" : ">", {
          fontFamily: "Arial",
          fontSize: "32px",
          color: "#00ffff",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
    };

    const leftArrow = createArrow(x - 130, true);
    const rightArrow = createArrow(x + 130, false);

    const toggleMode = () => {
      this.selectedMode =
        this.selectedMode === getPhrase(scene.coop)
          ? "Versus"
          : getPhrase(scene.coop);
      modeText.setText(this.selectedMode);
      this.emit("modeChanged", this.selectedMode);
    };

    leftArrow.on("pointerdown", toggleMode);
    rightArrow.on("pointerdown", toggleMode);

    this.addPulseAnimation(scene, bg, { strokeAlpha: { from: 0.4, to: 1 } });
    this.addPulseAnimation(scene, [leftArrow, rightArrow], {
      alpha: { from: 0.5, to: 1 },
    });
  }

  addPulseAnimation(scene, targets, props) {
    scene.tweens.add({
      targets,
      ...props,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
