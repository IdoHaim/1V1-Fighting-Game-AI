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
    AI : 3
}


export class InputHandler{
    constructor(game){

      this.game = game;
      this.keys = [];
      this.delegate = new delegateInput();

      window.addEventListener('keydown',e=>{
        if((e.key==='ArrowUp'||
        e.key==='ArrowLeft'||
        e.key==='ArrowRight'||
        e.key===',' ||
        e.key==='.' ||
        e.key==='/' ||
        e.key==='w' ||
        e.key==='a' ||
        e.key==='d' ||
        e.key==='v' ||
        e.key==='b' ||
        e.key==='n' 
        )&&this.keys.indexOf(e.key)===-1){
            this.keys.push(e.key);
            this.delegate.runDelegate();
        }
        else if(e.key==='Escape' && this.game.gameStarted)  {
            this.game.isPaused = !this.game.isPaused;
            this.game.pauseMenu.hide();  
        }
        else if(e.key === 'q') this.game.debug = !this.game.debug;
        
    });

    window.addEventListener('keyup',e=>{
        if(e.key==='ArrowUp'||
            e.key==='ArrowLeft'||
            e.key==='ArrowRight'||
            e.key===',' ||
            e.key==='.' ||
            e.key==='/' ||
            e.key==='w' ||
            e.key==='a' ||
            e.key==='d' ||
            e.key==='v' ||
            e.key==='b' ||
            e.key==='n' 
        ){
            this.keys.splice(this.keys.indexOf(e.key),1);
            this.delegate.runDelegate();
        }
        //console.log(e.key,this.keys);
    });
    }
  }

  export class delegateInput{
    constructor(){
        this.functionsList = []
    }
    addFunction(func){
        this.functionsList.push(func);
    }
    
    runDelegate(){
        this.functionsList.forEach(e => {
            e();
        });
    }
    
  }




  export class InputController{   
    
    constructor(game,inputState){
        this.game = game;
        this.input = this.game.input;
        this.commandsList = [];
        this.hashKeys = new Map();
        this.inputState=inputState;
        this.isAvailableForAICommands = false;
        
        this.input.delegate.addFunction(() => this.updateCommandsList());
        //this.input.delegate.addFunction(this.updateCommandsList.bind(this));      option 2

        this.init();

    }

    // check if the keys that got pressed are in this player's dictionary
    updateCommandsList(){
        this.commandsList.splice(0, this.commandsList.length); 
        this.input.keys.forEach(e => {
            if(this.hashKeys.has(e)) {
                this.commandsList.push(this.hashKeys.get(e));
            }
        })
    }
    stop(){
        this.isAvailableForAICommands = false;
        this.hashKeys.clear();       
    }

    // creating a translator from each player's keys to game's commands
    init(){
        if(this.inputState===inputStates.PLAYER_1){
            this.hashKeys.set('ArrowUp',Commands.JUMP);
            this.hashKeys.set('ArrowLeft',Commands.RUNLEFT);
            this.hashKeys.set('ArrowRight',Commands.RUNRIGHT);
            this.hashKeys.set(',',Commands.PUNCH);
            this.hashKeys.set('.',Commands.SHOOT);
            this.hashKeys.set('/',Commands.SHIELD);
        }
        else if(this.inputState===inputStates.PLAYER_2){
            this.hashKeys.set('w',Commands.JUMP);
            this.hashKeys.set('a',Commands.RUNLEFT);
            this.hashKeys.set('d',Commands.RUNRIGHT);
            this.hashKeys.set('v',Commands.PUNCH);
            this.hashKeys.set('b',Commands.SHOOT);
            this.hashKeys.set('n',Commands.SHIELD);
        }
        else{ // (this.inputState===inputStates.AI)
            this.isAvailableForAICommands = true;
        }
    }
    AICommand(command){
        if(!this.isAvailableForAICommands) return;
        this.commandsList = [command];
    }
    
  }