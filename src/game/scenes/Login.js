import Phaser from "phaser";

export class Login extends Phaser.Scene {
  constructor() {
    super("Login");
  }

  init({ language }) {
    this.language = language;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x0a0a0a);
    // agregar un texto "Login" en la parte superior de la pantalla
    this.add
      .text(512, 100, "Login", {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "64px",
        color: "#00ffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    // Agregar un texto "Ingresas de forma Anonima" que al hacer clic me levante un popup js para ingresar los datos
    this.createButton(512, 300, "Ingresar de forma Anonima", () => {
      this.firebase
        .signInAnonymously()
        .then(() => {
          this.scene.start("MainMenu", { language: this.language });
        })
        .catch((error) => {
          console.log("🚀 ~ file: Login.js:74 ~ .catch ~ error", error);
        });
    });

    // agregar un texto centrado "Ingresar con Google" que al hacer clic me levante un popup js para ingresar los datos
    this.createButton(512, 400, "Ingresar con Google", () => {
      this.firebase
        .signInWithGoogle()
        .then(() => {
          this.scene.start("MainMenu", { language: this.language });
        })
        .catch((error) => {
          console.log("🚀 ~ file: Login.js:74 ~ .catch ~ error", error);
        });
    });

    // agregar un texto "Ingresar con GitHub" que al hacer clic me levante un popup js para ingresar los datos
    this.createButton(512, 500, "Ingresar con GitHub", () => {
      this.firebase
        .signInWithGithub()
        .then(() => {
          this.scene.start("MainMenu", { language: this.language });
        })
        .catch((error) => {
          console.log("🚀 ~ file: Login.js:74 ~ .catch ~ error", error);
        });
    });
  }

  createButton(x, y, text, callback) {
    const buttonText = this.add
      .text(0, 0, text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "36px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const glow = this.add
      .rectangle(0, 0, buttonText.width + 40, 45, 0x000000, 0)
      .setStrokeStyle(2, 0x00ffff)
      .setOrigin(0.5);

    const button = this.add.container(x, y, [glow, buttonText]);
    button.setSize(glow.width, glow.height);
    button.setInteractive({ useHandCursor: true });

    button.on("pointerover", () => glow.setFillStyle(0x00ffff, 0.15));
    button.on("pointerout", () => glow.setFillStyle(0x000000, 0));
    button.on("pointerdown", callback);

    this.tweens.add({
      targets: glow,
      strokeAlpha: { from: 0.4, to: 1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
