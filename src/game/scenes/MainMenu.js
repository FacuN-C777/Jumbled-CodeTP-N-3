import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create() {
        
        this.cameras.main.setBackgroundColor(0x0a0a0a); 
       
        const title = this.add.text(512, 200, "JUMBLED CODE", {
          fontFamily: "Arial",
          fontSize: "64px",
          color: "#00ffff", 
          fontStyle: "bold",
        }).setOrigin(0.5);

       
        this.tweens.add({
          targets: title,
          alpha: { from: 0.4, to: 1 },
          duration: 2000,
          yoyo: true,
          repeat: -1
        });

        this.selectedMode = "Cooperativo"; 

        this.createButton(512, 305, "Jugar", () => {
          if (this.selectedMode === "Cooperativo") {
           this.sound.context.resume();
            this.scene.start("Game");
          } else {
           this.scene.start("GameOver");
          }
        });

       
        this.createModeSelector(512, 365); 

        this.createButton(512, 425, "Idiomas", () => {
          console.log("Idiomas");
        });

        this.createButton(512, 485, "Sonidos", () => {
          console.log("Sonidos");
        });
    }

    createButton(x, y, text, callback) {
        const buttonText = this.add.text(0, 0, text, {
          fontFamily: "Arial",
          fontSize: "36px",
          color: "#ffffff",
        }).setOrigin(0.5);

        const glow = this.add.rectangle(0, 0, buttonText.width + 40, 50, 0x000000, 0)
          .setStrokeStyle(2, 0x00ffff)
          .setOrigin(0.5);

        const button = this.add.container(x, y, [glow, buttonText]);
        button.setSize(glow.width, glow.height);
        button.setInteractive({ useHandCursor: true });

        button.on("pointerover", () => {
          glow.setFillStyle(0x00ffff, 0.15);
        });
        button.on("pointerout", () => {
          glow.setFillStyle(0x000000, 0);
        });

        button.on("pointerdown", callback);

        this.tweens.add({
          targets: glow,
          strokeAlpha: { from: 0.4, to: 1 },
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut"
        });
    }

    createModeSelector(x, y) {
        
        const bg = this.add.rectangle(x, y, 300, 50, 0x000000, 0)
          .setStrokeStyle(2, 0x00ffff)
          .setOrigin(0.5);

       
        const modeText = this.add.text(x, y, this.selectedMode, {
          fontFamily: "Arial",
          fontSize: "36px",
          color: "#ffffff"
        }).setOrigin(0.5);

       
        const leftArrow = this.add.text(x - 130, y, "<", {
          fontFamily: "Arial",
          fontSize: "32px",
          color: "#00ffff"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const rightArrow = this.add.text(x + 130, y, ">", {
          fontFamily: "Arial",
          fontSize: "32px",
          color: "#00ffff"
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        leftArrow.on("pointerdown", () => {
          this.selectedMode = (this.selectedMode === "Cooperativo") ? "Versus" : "Cooperativo";
          modeText.setText(this.selectedMode);
        });

        rightArrow.on("pointerdown", () => {
          this.selectedMode = (this.selectedMode === "Cooperativo") ? "Versus" : "Cooperativo";
          modeText.setText(this.selectedMode);
        });

       
        this.tweens.add({
          targets: bg,
          strokeAlpha: { from: 0.4, to: 1 },
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut"
        });

        this.tweens.add({
          targets: [leftArrow, rightArrow],
          alpha: { from: 0.5, to: 1 },
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut"
        });
    }
}