import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    this.add.image(512, 384, "background");
    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);
    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath("assets");
    this.load.image("client", "Client_sprite.png");
    this.load.spritesheet("p1", "player1_SpritesheetRevised.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("p2", "player2_SpritesheetRevised.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.image("telefono", "object_phone.png");
    this.load.image("television", "object_tv.png");
    this.load.image("computadora", "object_laptop.png");
    this.load.image("audifonos", "object_headphones.png");
    this.load.image("lavarropa", "object_washMachine.png");
    this.load.image("controles", "Controles.png");

    this.load.tilemapTiledJSON("betaMapCoop", "tilemaps/mapaBeta3.json");
    this.load.image("wallTiles", "modern_supermarket_indoor_wall_floor.png");
    this.load.image("furnitureTiles", "modern_supermarket_indoor_props.png");

    this.load.audio("cashsound", "sounds/cash-register-kaching-376867.mp3");
    this.load.audio("spawnObjects", "sounds/pop-cartoon-328167.mp3");
    this.load.audio("stepsPlayer", "sounds/pasos-al-caminar-80084.mp3");
    this.load.audio("launchObjects", "sounds/swing-whoosh-5-198498.mp3");
    this.load.audio("CoopModeMusic", "sounds/gaming-hard-164122.mp3");
    this.load.audio("GameOverChime", "sounds/violin-lose-5-185126.mp3");
    this.load.audio("MainMenuMusic", "sounds/cherry-ice-cream-380758 (1).mp3");
  }

  create() {
    //making the player charaters' animations
    if (!this.anims.exists("p1stand")) {
      this.anims.create({
        key: "p1stand",
        frames: [{ key: "p1", frame: 0 }],
      });
    }
    if (!this.anims.exists("p1walk")) {
      this.anims.create({
        key: "p1walk",
        frames: [
          { key: "p1", frame: 1 },
          { key: "p1", frame: 0 },
          { key: "p1", frame: 2 },
          { key: "p1", frame: 0 },
        ],
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!this.anims.exists("p1carry")) {
      this.anims.create({
        key: "p1carry",
        frames: [
          { key: "p1", frame: 3 },
          { key: "p1", frame: 4 },
          { key: "p1", frame: 3 },
          { key: "p1", frame: 5 },
        ],
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!this.anims.exists("p1throw")) {
      this.anims.create({
        key: "p1throw",
        frames: [{ key: "p1", frame: 6 }],
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!this.anims.exists("p2stand")) {
      this.anims.create({
        key: "p2stand",
        frames: [{ key: "p2", frame: 0 }],
      });
    }
    if (!this.anims.exists("p2walk")) {
      this.anims.create({
        key: "p2walk",
        frames: [
          { key: "p2", frame: 1 },
          { key: "p2", frame: 0 },
          { key: "p2", frame: 2 },
          { key: "p2", frame: 0 },
        ],
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!this.anims.exists("p2carry")) {
      this.anims.create({
        key: "p2carry",
        frames: [
          { key: "p2", frame: 3 },
          { key: "p2", frame: 4 },
          { key: "p2", frame: 3 },
          { key: "p2", frame: 5 },
        ],
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!this.anims.exists("p2throw")) {
      this.anims.create({
        key: "p2throw",
        frames: [{ key: "p2", frame: 6 }],
        frameRate: 8,
        repeat: -1,
      });
    }
    this.scene.start("MainMenu");
  }
}
