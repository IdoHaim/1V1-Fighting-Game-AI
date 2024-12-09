export const Commands = {  
    RUNRIGHT: 0,
    RUNLEFT: 1,
    JUMP: 2,
    PUNCH: 3,
    SHOOT: 4,
    SHIELD: 5,    
}

export const inputStates = {
    PLAYER_1 : 0,
    PLAYER_2 : 1,
    AI : 2
}

export class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = [];
        this.delegate = new delegateInput();

        window.addEventListener('keydown', e => {
            if ((e.code === 'ArrowUp' ||
                e.code === 'ArrowLeft' ||
                e.code === 'ArrowRight' ||
                e.code === 'Comma' ||
                e.code === 'Period' ||
                e.code === 'Slash' ||
                e.code === 'KeyW' ||
                e.code === 'KeyA' ||
                e.code === 'KeyD' ||
                e.code === 'KeyV' ||
                e.code === 'KeyB' ||
                e.code === 'KeyN') &&
                this.keys.indexOf(e.code) === -1) {
                this.keys.push(e.code);
                this.delegate.runDelegate();
            } else if (e.code === 'Escape' && this.game.gameStarted) {
                this.game.isPaused = !this.game.isPaused;
                this.game.pauseMenu.hide();
            } //else if (e.code === 'KeyQ') this.game.debug = !this.game.debug;   // show heat boxes
        });

        window.addEventListener('keyup', e => {
            if (e.code === 'ArrowUp' ||
                e.code === 'ArrowLeft' ||
                e.code === 'ArrowRight' ||
                e.code === 'Comma' ||
                e.code === 'Period' ||
                e.code === 'Slash' ||
                e.code === 'KeyW' ||
                e.code === 'KeyA' ||
                e.code === 'KeyD' ||
                e.code === 'KeyV' ||
                e.code === 'KeyB' ||
                e.code === 'KeyN') {
                this.keys.splice(this.keys.indexOf(e.code), 1);
                this.delegate.runDelegate();
            }
        });
    }
}

export class delegateInput {
    constructor() {
        this.functionsList = []
    }
    addFunction(func) {
        this.functionsList.push(func);
    }

    runDelegate() {
        this.functionsList.forEach(e => {
            e();
        });
    }
}

export class InputController {
    constructor(game, inputState) {
        this.game = game;
        this.input = this.game.input;
        this.commandsList = [];
        this.hashKeys = new Map();
        this.inputState = inputState;
        this.isAvailableForAICommands = false;

        this.input.delegate.addFunction(() => this.updateCommandsList());
        this.init();
    }

    updateCommandsList() {
        this.commandsList.splice(0, this.commandsList.length);
        this.input.keys.forEach(e => {
            if (this.hashKeys.has(e)) {
                this.commandsList.push(this.hashKeys.get(e));
            }
        })
    }

    stop() {
        this.isAvailableForAICommands = false;
        this.hashKeys.clear();
    }

    init() {
        if (this.inputState === inputStates.PLAYER_1) {
            this.hashKeys.set('ArrowUp', Commands.JUMP);
            this.hashKeys.set('ArrowLeft', Commands.RUNLEFT);
            this.hashKeys.set('ArrowRight', Commands.RUNRIGHT);
            this.hashKeys.set('Comma', Commands.PUNCH);
            this.hashKeys.set('Period', Commands.SHOOT);
            this.hashKeys.set('Slash', Commands.SHIELD);
        } else if (this.inputState === inputStates.PLAYER_2) {
            this.hashKeys.set('KeyW', Commands.JUMP);
            this.hashKeys.set('KeyA', Commands.RUNLEFT);
            this.hashKeys.set('KeyD', Commands.RUNRIGHT);
            this.hashKeys.set('KeyV', Commands.PUNCH);
            this.hashKeys.set('KeyB', Commands.SHOOT);
            this.hashKeys.set('KeyN', Commands.SHIELD);
        } else { // (this.inputState === inputStates.AI)
            this.isAvailableForAICommands = true;
        }
    }

    AICommand(command) {
        if (!this.isAvailableForAICommands) return;
        this.commandsList = [command];
    }
}
