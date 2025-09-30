/**
 * Constantes de acciones de entrada disponibles en el sistema
 * Estas constantes evitan hardcodear strings y proporcionan autocompletado
 */
export const INPUT_ACTIONS = {
  UP: "up", // Movimiento hacia arriba (eje Y negativo)
  DOWN: "down", // Movimiento hacia abajo (eje Y positivo)
  LEFT: "left", // Movimiento hacia la izquierda (eje X negativo)
  RIGHT: "right", // Movimiento hacia la derecha (eje X positivo)
  NORTH: "north", // Botón norte del gamepad (B3)
  EAST: "east", // Botón este del gamepad (B1)
  SOUTH: "south", // Botón sur del gamepad (B0)
  WEST: "west", // Botón oeste del gamepad (B2)
};

/**
 * Sistema de entrada unificado para teclado y gamepad arcade Unraf
 *
 * Características principales:
 * - Mapeo configurable de teclas de teclado
 * - Compatibilidad fija con gamepad arcade Unraf (USB GENERIC)
 * - Detección de entrada simultánea de teclado y gamepad
 * - Métodos para detectar pulsaciones continuas y momentáneas
 *
 * Especificaciones del gamepad Unraf:
 * - 4 Botones: Norte(B3), Este(B1), Sur(B0), Oeste(B2)
 * - 1 Joystick: Eje X(axis 0), Eje Y(axis 1)
 * - Valores del joystick: -1 a 1 en cada eje
 *
 * @example
 * // Inicialización básica
 * const inputSystem = new InputSystem(this.input);
 *
 * // Configurar teclas personalizadas
 * inputSystem.configureKeyboard({
 *   [INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.SPACE],
 *   [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.X]
 * });
 *
 * // Verificar entrada en el loop de actualización
 * if (inputSystem.isPressed(INPUT_ACTIONS.NORTH)) {
 *   // El jugador está presionando el botón norte
 * }
 */
export default class InputSystem {
  // Constantes estáticas accesibles desde la clase
  static ACTIONS = INPUT_ACTIONS;

  /**
   * Constructor del sistema de entrada
   *
   * @param {Phaser.Input.InputPlugin} input - Plugin de entrada de Phaser de la escena
   */
  constructor(input) {
    /** @private {Phaser.Input.InputPlugin} Plugin de entrada de Phaser */
    this.input = input;

    /** @private {Object} Colección de teclas del teclado inicializadas */
    this.keys = {};

    /** @private {Phaser.Input.Gamepad.Gamepad|null} Referencia al gamepad conectado */
    this.gamepad = null;

    /**
     * Mapeo de acciones a controles de entrada
     * Las configuraciones de gamepad son fijas para compatibilidad con Unraf
     * Las configuraciones de teclado pueden ser modificadas por el desarrollador
     *
     * @private {Object}
     */
    this.mapping = {
      // Movimientos direccionales del joystick
      [INPUT_ACTIONS.UP]: {
        keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
        gamepad: [{ type: "axis", index: 1, dir: -1 }], // Eje Y hacia arriba
      },
      [INPUT_ACTIONS.DOWN]: {
        keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
        gamepad: [{ type: "axis", index: 1, dir: 1 }], // Eje Y hacia abajo
      },
      [INPUT_ACTIONS.LEFT]: {
        keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
        gamepad: [{ type: "axis", index: 0, dir: -1 }], // Eje X hacia la izquierda
      },
      [INPUT_ACTIONS.RIGHT]: {
        keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
        gamepad: [{ type: "axis", index: 0, dir: 1 }], // Eje X hacia la derecha
      },

      // Botones del gamepad arcade
      [INPUT_ACTIONS.NORTH]: {
        keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
        gamepad: [{ type: "button", index: 3 }], // B3 - Botón superior
      },
      [INPUT_ACTIONS.EAST]: {
        keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
        gamepad: [{ type: "button", index: 1 }], // B1 - Botón derecho
      },
      [INPUT_ACTIONS.SOUTH]: {
        keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
        gamepad: [{ type: "button", index: 0 }], // B0 - Botón inferior
      },
      [INPUT_ACTIONS.WEST]: {
        keyboard: [], // Sin mapeo por defecto - configurable por el desarrollador
        gamepad: [{ type: "button", index: 2 }], // B2 - Botón izquierdo
      },
    };

    // Inicializar sistemas de entrada
    this.initializeKeyboard();
    this.initializeGamepad();
  }

  /**
   * Inicializa las teclas del teclado basándose en el mapeo actual
   * Crea objetos Key de Phaser para cada tecla configurada
   *
   * @private
   */
  initializeKeyboard() {
    // Crear teclas del teclado para todas las acciones mapeadas
    Object.keys(this.mapping).forEach((action) => {
      const keyboardMappings = this.mapping[action].keyboard;
      keyboardMappings.forEach((key) => {
        if (typeof key === "string") {
          this.keys[key] = this.input.keyboard.addKey(key);
        } else {
          this.keys[key] = this.input.keyboard.addKey(key);
        }
      });
    });
  }

  /**
   * Inicializa la detección de gamepad y configura eventos de conexión
   * Maneja automáticamente la conexión y desconexión del gamepad
   *
   * @private
   */
  initializeGamepad() {
    // Inicializar gamepad si está disponible
    if (this.input.gamepad) {
      this.input.gamepad.on("connected", (pad) => {
        this.gamepad = pad;
        console.log("Gamepad conectado:", pad.id);
      });

      this.input.gamepad.on("disconnected", (pad) => {
        this.gamepad = null;
        console.log("Gamepad desconectado");
      });
    }
  }

  /**
   * Configura un mapeo personalizado para una acción específica
   * Permite modificar tanto controles de teclado como de gamepad (no recomendado para gamepad)
   *
   * @param {string} action - Nombre de la acción (usar INPUT_ACTIONS constantes)
   * @param {Object} config - Objeto de configuración
   * @param {Array} [config.keyboard] - Array de códigos de tecla o strings
   * @param {Array} [config.gamepad] - Array de configuraciones de gamepad (no recomendado modificar)
   *
   * @example
   * // Configurar solo teclado (recomendado)
   * inputSystem.setMapping(INPUT_ACTIONS.NORTH, {
   *   keyboard: [Phaser.Input.Keyboard.KeyCodes.SPACE, 'ENTER']
   * });
   */
  setMapping(action, config) {
    if (config.keyboard) {
      this.mapping[action].keyboard = config.keyboard;
      // Agregar nuevas teclas de teclado
      config.keyboard.forEach((key) => {
        if (!this.keys[key]) {
          this.keys[key] = this.input.keyboard.addKey(key);
        }
      });
    }

    if (config.gamepad) {
      this.mapping[action].gamepad = config.gamepad;
    }
  }

  /**
   * Configura múltiples mapeos a la vez
   * Método conveniente para configurar varios controles simultáneamente
   *
   * @param {Object} mappings - Objeto con múltiples configuraciones de acciones
   *
   * @example
   * inputSystem.setMappings({
   *   [INPUT_ACTIONS.NORTH]: { keyboard: ['SPACE'] },
   *   [INPUT_ACTIONS.SOUTH]: { keyboard: ['X'] },
   * });
   */
  setMappings(mappings) {
    Object.keys(mappings).forEach((action) => {
      this.setMapping(action, mappings[action]);
    });
  }

  /**
   * Verifica si una acción está siendo presionada actualmente
   * Combina la entrada de teclado y gamepad (OR lógico)
   *
   * @param {string} action - La acción a verificar (usar INPUT_ACTIONS constantes)
   * @returns {boolean} true si la acción está siendo presionada
   *
   * @example
   * // En el método update() de una escena
   * if (inputSystem.isPressed(INPUT_ACTIONS.NORTH)) {
   *   // Acción continua mientras se mantiene presionado
   *   player.jump();
   * }
   */
  isPressed(action) {
    return this.isKeyboardPressed(action) || this.isGamepadPressed(action);
  }

  /**
   * Verifica si una acción fue presionada en este frame específico
   * Útil para acciones que deben ejecutarse una sola vez por pulsación
   *
   * @param {string} action - La acción a verificar (usar INPUT_ACTIONS constantes)
   * @returns {boolean} true si la acción fue presionada en este frame
   *
   * @example
   * // En el método update() de una escena
   * if (inputSystem.isJustPressed(INPUT_ACTIONS.SOUTH)) {
   *   // Acción única por pulsación
   *   openMenu();
   * }
   */
  isJustPressed(action) {
    return (
      this.isKeyboardJustPressed(action) || this.isGamepadJustPressed(action)
    );
  }

  /**
   * Verifica entrada de teclado para una acción específica
   * Método interno, generalmente no se llama directamente
   *
   * @private
   * @param {string} action - La acción a verificar
   * @returns {boolean} true si está presionada via teclado
   */
  isKeyboardPressed(action) {
    if (!this.mapping[action] || !this.mapping[action].keyboard) return false;

    return this.mapping[action].keyboard.some((key) => {
      const keyObj = this.keys[key];
      return keyObj && keyObj.isDown;
    });
  }

  /**
   * Verifica si una acción de teclado fue presionada en este frame
   * Método interno, generalmente no se llama directamente
   *
   * @private
   * @param {string} action - La acción a verificar
   * @returns {boolean} true si fue presionada via teclado en este frame
   */
  isKeyboardJustPressed(action) {
    if (!this.mapping[action] || !this.mapping[action].keyboard) return false;

    return this.mapping[action].keyboard.some((key) => {
      const keyObj = this.keys[key];
      return keyObj && Phaser.Input.Keyboard.JustDown(keyObj);
    });
  }

  /**
   * Verifica entrada de gamepad para una acción específica
   * Maneja tanto botones como ejes del joystick
   * Método interno, generalmente no se llama directamente
   *
   * @private
   * @param {string} action - La acción a verificar
   * @returns {boolean} true si está presionada via gamepad
   */
  isGamepadPressed(action) {
    if (!this.gamepad || !this.mapping[action] || !this.mapping[action].gamepad)
      return false;

    return this.mapping[action].gamepad.some((input) => {
      if (input.type === "button") {
        return (
          this.gamepad.buttons[input.index] &&
          this.gamepad.buttons[input.index].pressed
        );
      } else if (input.type === "axis") {
        const axisValue = this.gamepad.axes[input.index].getValue();
        return input.dir > 0 ? axisValue > 0.5 : axisValue < -0.5;
      }
      return false;
    });
  }

  /**
   * Verifica si una acción de gamepad fue presionada en este frame
   * Implementa detección de "just pressed" para botones y ejes
   * Método interno, generalmente no se llama directamente
   *
   * @private
   * @param {string} action - La acción a verificar
   * @returns {boolean} true si fue presionada via gamepad en este frame
   */
  isGamepadJustPressed(action) {
    if (!this.gamepad || !this.mapping[action] || !this.mapping[action].gamepad)
      return false;

    return this.mapping[action].gamepad.some((input) => {
      if (input.type === "button") {
        const button = this.gamepad.buttons[input.index];
        return button && button.pressed && button.duration < 100; // Umbral de just pressed
      } else if (input.type === "axis") {
        // Para ejes, necesitamos rastrear el estado anterior (enfoque simplificado)
        const axisValue = this.gamepad.axes[input.index].getValue();
        const threshold = 0.5;
        const isPressed =
          input.dir > 0 ? axisValue > threshold : axisValue < -threshold;

        // Almacenar estado anterior para detección de just pressed
        const stateKey = `axis_${input.index}_${input.dir}`;
        const wasPressed =
          this.previousAxisStates && this.previousAxisStates[stateKey];

        if (!this.previousAxisStates) this.previousAxisStates = {};
        this.previousAxisStates[stateKey] = isPressed;

        return isPressed && !wasPressed;
      }
      return false;
    });
  }

  /**
   * Obtiene la configuración actual de mapeo
   * Útil para debugging o para mostrar controles al usuario
   *
   * @returns {Object} Copia de la configuración actual de mapeo
   *
   * @example
   * const currentMapping = inputSystem.getMapping();
   * console.log('Teclas para saltar:', currentMapping[INPUT_ACTIONS.NORTH].keyboard);
   */
  getMapping() {
    return { ...this.mapping };
  }

  /**
   * Configura controles de teclado para acciones específicas
   * Los controles de gamepad permanecen fijos para compatibilidad con Unraf
   * Método principal para personalización de controles
   *
   * @param {Object} keyboardMappings - Objeto con mapeo de acción -> teclas
   *
   * @example
   * // Configuración estilo FPS
   * inputSystem.configureKeyboard({
   *   [INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.SPACE],
   *   [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.C],
   *   [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.A],
   *   [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.D]
   * });
   *
   * // Configuración para jugadores zurdos
   * inputSystem.configureKeyboard({
   *   [INPUT_ACTIONS.NORTH]: [Phaser.Input.Keyboard.KeyCodes.UP],
   *   [INPUT_ACTIONS.SOUTH]: [Phaser.Input.Keyboard.KeyCodes.DOWN],
   *   [INPUT_ACTIONS.LEFT]: [Phaser.Input.Keyboard.KeyCodes.LEFT],
   *   [INPUT_ACTIONS.RIGHT]: [Phaser.Input.Keyboard.KeyCodes.RIGHT]
   * });
   */
  configureKeyboard(keyboardMappings) {
    Object.keys(keyboardMappings).forEach((action) => {
      if (this.mapping[action]) {
        // Mantener mapeo de gamepad sin cambios, solo actualizar teclado
        this.mapping[action].keyboard = keyboardMappings[action];

        // Agregar nuevas teclas de teclado a la colección de teclas
        keyboardMappings[action].forEach((key) => {
          if (!this.keys[key]) {
            this.keys[key] = this.input.keyboard.addKey(key);
          }
        });
      }
    });
  }

  /**
   * Configura controles de teclado usando strings en lugar de KeyCodes
   * Método más conveniente para configuración rápida
   *
   * @param {Object} keyboardMappings - Objeto con mapeo de acción -> strings de teclas
   *
   * @example
   * // Más fácil de escribir que KeyCodes
   * inputSystem.configureKeyboardByString({
   *   [INPUT_ACTIONS.NORTH]: ['SPACE', 'W'],
   *   [INPUT_ACTIONS.SOUTH]: ['X', 'S'],
   *   [INPUT_ACTIONS.EAST]: ['D'],
   *   [INPUT_ACTIONS.WEST]: ['A']
   * });
   */
  configureKeyboardByString(keyboardMappings) {
    const convertedMappings = {};

    Object.keys(keyboardMappings).forEach((action) => {
      convertedMappings[action] = keyboardMappings[action].map((keyString) => {
        // Convertir string a KeyCode si existe, sino usar el string directamente
        const keyCode = Phaser.Input.Keyboard.KeyCodes[keyString.toUpperCase()];
        return keyCode !== undefined ? keyCode : keyString;
      });
    });

    this.configureKeyboard(convertedMappings);
  }

  /**
   * Obtiene la configuración actual de teclado para una acción
   * Útil para mostrar controles actuales al usuario
   *
   * @param {string} action - El nombre de la acción
   * @returns {Array} Array de teclas asignadas a esta acción
   *
   * @example
   * const jumpKeys = inputSystem.getKeyboardMapping(INPUT_ACTIONS.NORTH);
   * console.log('Teclas para saltar:', jumpKeys); // ['SPACE', 'W']
   */
  getKeyboardMapping(action) {
    return this.mapping[action] && this.mapping[action].keyboard
      ? [...this.mapping[action].keyboard]
      : [];
  }

  /**
   * Obtiene todos los mapeos de teclado actuales
   * Útil para generar una pantalla de configuración de controles
   *
   * @returns {Object} Objeto con todos los mapeos de teclado
   *
   * @example
   * const allMappings = inputSystem.getAllKeyboardMappings();
   * // Mostrar en UI de configuración
   * Object.keys(allMappings).forEach(action => {
   *   console.log(`${action}: ${allMappings[action].join(', ')}`);
   * });
   */
  getAllKeyboardMappings() {
    const keyboardMappings = {};
    Object.keys(this.mapping).forEach((action) => {
      keyboardMappings[action] = this.getKeyboardMapping(action);
    });
    return keyboardMappings;
  }
}
