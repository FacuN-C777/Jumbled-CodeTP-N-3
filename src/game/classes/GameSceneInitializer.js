import Player from "./Player.js";
import Objects from "./Objects.js";
import { clients } from "./Clients.js";

export class GameSceneInitializer {
  constructor(scene) {
    this.scene = scene;
  }

  setupMap() {
    const map = this.scene.make.tilemap({ key: "betaMapCoop" });
    const paredes = map.addTilesetImage("wallsFinal", "wallTiles");
    const muebles = map.addTilesetImage("furniture", "furnitureTiles");
    const wallLayer = map.createLayer("Paredes", paredes, 0, 0);
    const furnitureLayer = map.createLayer("Muebles", muebles, 0, 0);

    wallLayer.setCollisionByProperty({ colisionable: true });
    furnitureLayer.setCollisionByProperty({ colisionable: true });

    return { wallLayer, furnitureLayer, map };
  }

  setupPlayers(wallLayer, furnitureLayer, map) {
    const spawnPoint1 = map.findObject(
      "Objetos",
      (obj) => obj.name === "Jugador1"
    );
    const spawnPoint2 = map.findObject(
      "Objetos",
      (obj) => obj.name === "Jugador2"
    );

    const player1 = new Player(
      this.scene,
      "p1",
      spawnPoint1.x,
      spawnPoint1.y,
      1
    );
    const player2 = new Player(
      this.scene,
      "p2",
      spawnPoint2.x,
      spawnPoint2.y,
      2
    );

    this.scene.add.existing(player1);
    this.scene.add.existing(player2);

    this.scene.physics.add.collider(player1, wallLayer);
    this.scene.physics.add.collider(player2, wallLayer);
    this.scene.physics.add.collider(player1, furnitureLayer);
    this.scene.physics.add.collider(player2, furnitureLayer);
    this.scene.physics.add.collider(player1, player2);

    return { player1, player2 };
  }

  setupObjectSpawns(map) {
    const objectsLayer = map.getObjectLayer("Objetos");
    const objectSpawns = [];
    const clientSpawns = [];

    objectsLayer.objects.forEach((objData) => {
      if (objData.type === "objects_spawn") objectSpawns.push(objData);
      if (objData.type === "clients_spawn") clientSpawns.push(objData);
    });

    this.scene.objectSpawnLocations = objectSpawns;
    this.scene.ClientSpawnLocations = clientSpawns;
  }

  setupCollectibles(wallLayer) {
    this.scene.objects = new Objects(this.scene);
    this.scene.physics.add.collider(this.scene.objects.group, wallLayer);
  }

  setupGamepadHandling() {
    if (!this.scene.input?.gamepad) return;

    const gp = this.scene.input.gamepad;
    if (typeof gp.removeAllListeners === "function") {
      gp.removeAllListeners("connected");
      gp.removeAllListeners("disconnected");
    }

    const tryAssignPads = (() => {
      let attempts = 0;
      return () => {
        attempts++;
        const pads = gp.pads || [];
        if (pads.length > 0 || attempts > 10) {
          this.scene.player1.inputHandler.inputSystem.gamepad = pads[0] || null;
          this.scene.player2.inputHandler.inputSystem.gamepad = pads[1] || null;
          return;
        }
        this.scene.time.delayedCall(100, tryAssignPads);
      };
    })();
    tryAssignPads();

    gp.on("connected", (pad) => {
      if (pad.index === 0)
        this.scene.player1.inputHandler.inputSystem.gamepad = pad;
      if (pad.index === 1)
        this.scene.player2.inputHandler.inputSystem.gamepad = pad;
    });

    gp.on("disconnected", (pad) => {
      if (pad.index === 0)
        this.scene.player1.inputHandler.inputSystem.gamepad = null;
      if (pad.index === 1)
        this.scene.player2.inputHandler.inputSystem.gamepad = null;
    });
  }
}
