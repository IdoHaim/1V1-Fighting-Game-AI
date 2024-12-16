import { Projectile, Punch ,Shield} from "./abilities.js";
import { Commands } from "./input.js";

export const states = {
    STANDING: 0,   
    RUNNING: 1,
    JUMPING: 2,    
    PUNCHING: 3,
    SHOOTING: 4,
    SHIELDING: 5,    
    HIT: 6,
    DEAD: 7
}

const playerSpeeds = {
    NoSpeed: 0,
    LowSpeed: 2,
    MediumSpeed: 5,
    HighSpeed: 8
}


class State{
    constructor(state,game,player){
        this.state = state;
        this.game = game;
        this.player = player;
        this.isChanged = true;
    }
}


export class Standing extends State { // normal speed = 0
    constructor(game,player){
        super('STANDING');
        this.game = game;
        this.player = player;
        this.isChanged = true;
    }
    enter(){
        this.isChanged = true;
        this.player.image = this.player.imageCharacter1;
        this.player.frameX = 0;
        this.player.maxFrame = 5;
        this.player.frameY = 0; 
    }
    handleInput(input){

        if(input.includes(Commands.RUNLEFT)||input.includes(Commands.RUNRIGHT)){
            this.player.setState(states.RUNNING,playerSpeeds.HighSpeed);
        }
        else if(input.includes(Commands.JUMP)){
            this.player.setState(states.JUMPING,playerSpeeds.NoSpeed);
        }
        else if(input.includes(Commands.PUNCH) && this.player.isActionAble(Punch)){
            this.player.setState(states.PUNCHING,playerSpeeds.NoSpeed);
        }
        else if(input.includes(Commands.SHOOT) && this.player.isActionAble(Projectile)){
            this.player.setState(states.SHOOTING,playerSpeeds.NoSpeed);
        }
        else if(input.includes(Commands.SHIELD) && this.player.isActionAble(Shield)){
            this.player.setState(states.SHIELDING,playerSpeeds.NoSpeed);
        }
        else this.isChanged = false;

    }
}

export class Running extends State { // normal speed = 3
    constructor(game,player){
        super('RUNNING');
        this.game = game;
        this.player = player;
        this.isChanged = true;
    }
    enter(){
        this.isChanged = true;
        this.player.image = this.player.imageCharacter1;
        this.player.frameX = 0;
        this.player.maxFrame = 7;
        this.player.frameY = 2;
    }
    handleInput(input){
        

        if(input.length===0){
            this.player.setState(states.STANDING,playerSpeeds.NoSpeed);
        }
        else if(input.includes(Commands.JUMP)){
            this.player.setState(states.JUMPING,playerSpeeds.HighSpeed);
        }
        else if(input.includes(Commands.PUNCH)&& this.player.isActionAble(Punch)){
            this.player.setState(states.PUNCHING,playerSpeeds.HighSpeed);
        }
        else if(input.includes(Commands.SHOOT) && this.player.isActionAble(Projectile)){
            this.player.setState(states.SHOOTING,playerSpeeds.LowSpeed);
        }
        else if(input.includes(Commands.SHIELD) && this.player.isActionAble(Shield)){
            this.player.setState(states.SHIELDING,playerSpeeds.LowSpeed);
        }
        else this.isChanged = false;

    }
}

export class Jumping extends State {
    constructor(game,player){
        super('JUMPING');
        this.game = game;
        this.player = player;
        this.isChanged = true;
    }
    enter(){
        if(this.player.onGround())this.player.vy -= 30;
        this.isChanged = true;
        this.player.image = this.player.imageCharacter1;
        this.player.frameX = 0;
        this.player.maxFrame = 7;
        this.player.frameY = 4;
    }
    handleInput(input){

        if(input.includes(Commands.PUNCH)&& this.player.isActionAble(Punch)){
            this.player.setState(states.PUNCHING,3);
        }
        else if(this.player.onGround() && !this.isChanged){
            if(input.includes(Commands.RUNLEFT)||input.includes(Commands.RUNRIGHT)){
                this.player.setState(states.RUNNING,playerSpeeds.HighSpeed);
            }
            else{
                this.player.setState(states.STANDING,playerSpeeds.NoSpeed);
            }
        }      
        else {
            this.isChanged = false;
            if(input.includes(Commands.RUNLEFT)||input.includes(Commands.RUNRIGHT)){
                this.player.speed = playerSpeeds.MediumSpeed;
            }
        }
        
    }
}

export class Punching extends State {
    constructor(game,player){
        super('PUNCHING');
        this.game = game;
        this.player = player;
        this.isChanged = true;
        this.rightHook = true;
    }
    enter(){
        this.isChanged = true;
        this.player.image = this.player.imageCharacter2;
        if(this.rightHook) {
            this.player.frameY = 0;
            this.player.maxFrame = 4;
        }
        else {
            this.player.frameY = 1;
            this.player.maxFrame = 3;
        }
        this.rightHook = !this.rightHook;
        this.player.frameX = 0;
        this.player.launchPunch();
    }
    handleInput(input){
       
        // make the character finish the animation   
        if(this.player.frameX < this.player.maxFrame || !this.player.onGround())  return;

        if(input.length===0 || input.includes(Commands.PUNCH)){
            this.player.setState(states.STANDING,playerSpeeds.NoSpeed);
        }
        else if(input.includes(Commands.RUNLEFT)||input.includes(Commands.RUNRIGHT)){
            this.player.setState(states.RUNNING,playerSpeeds.HighSpeed);
        }
        else if(input.includes(Commands.JUMP)){
            this.player.setState(states.JUMPING,playerSpeeds.NoSpeed);
        }
        else if(input.includes(Commands.SHOOT) && this.player.isActionAble(Projectile)){
            this.player.setState(states.SHOOTING,playerSpeeds.NoSpeed);
        }
        else if(input.includes(Commands.SHIELD) && this.player.isActionAble(Shield)){
            this.player.setState(states.SHIELDING,playerSpeeds.NoSpeed);
        }
        else {
            this.isChanged = false;
            return;
        }

        
    }
}

export class Shooting extends State {
    constructor(game,player){
        super('SHOOTING');
        this.game = game;
        this.player = player;
        this.isChanged = true;
    }
    enter(){
        this.isChanged = true;
        this.player.image = this.player.imageCharacter2;
        this.player.frameX = 0;
        this.player.maxFrame = 6;
        this.player.frameY = 2;
        this.player.launchShoot();
    }
    handleInput(input){

        // make the character finish the animation         
        if(this.player.frameX < this.player.maxFrame) return;


        if(input.length===0 || input.includes(Commands.SHOOT)){
            this.player.setState(states.STANDING,playerSpeeds.NoSpeed);
        }
        else if(input.includes(Commands.RUNLEFT)||input.includes(Commands.RUNRIGHT)){
            this.player.setState(states.RUNNING,playerSpeeds.HighSpeed);
        }
        else if(input.includes(Commands.JUMP)){
            this.player.setState(states.JUMPING,playerSpeeds.NoSpeed);
        }
        else if(input.includes(Commands.PUNCH)&& this.player.isActionAble(Punch)){
            this.player.setState(states.PUNCHING,playerSpeeds.NoSpeed);
        }
        else if(input.includes(Commands.SHIELD) && this.player.isActionAble(Shield)){
            this.player.setState(states.SHIELDING,playerSpeeds.NoSpeed);
        }
        else this.isChanged = false;

    }
}


export class Shielding extends State {
    constructor(game,player){
        super('SHIELDING');
        this.game = game;
        this.player = player;
        this.isChanged = true;
    }
    enter(){
        this.isChanged = true;
        this.player.shield.color = 'blue';
        this.player.executeShield(true);
    }
    handleInput(input){
        
        if(input.length===0 || !this.player.isActionAble(Shield)){
            this.player.setState(states.STANDING,playerSpeeds.NoSpeed);
        }
        else if(input.includes(Commands.JUMP)){
            this.player.setState(states.JUMPING,playerSpeeds.NoSpeed);
        }
        else if(input.includes(Commands.PUNCH) && this.player.isActionAble(Punch)){
            this.player.setState(states.PUNCHING,playerSpeeds.NoSpeed);
        }
        else if(input.includes(Commands.SHOOT) && this.player.isActionAble(Projectile)){
            this.player.setState(states.SHOOTING,playerSpeeds.NoSpeed);
        }
        else {
            this.isChanged = false;
            if(input.includes(Commands.RUNLEFT)||input.includes(Commands.RUNRIGHT)){
                this.player.speed = playerSpeeds.LowSpeed;
            }
            this.player.executeShield(true);
            return;
        }
     
        this.player.executeShield(false);
    }
}


export class Hit extends State {
    constructor(game,player){
        super('HIT');
        this.game = game;
        this.player = player;
        this.isChanged = true;
    }
    enter(){
        this.isChanged = true;
        this.player.image = this.player.imageCharacter2;
        this.player.frameX = 0;
        this.player.maxFrame = 3;
        this.player.frameY = 3;
    }
    handleInput(input){
        // make the character finish the animation       
        if(this.player.frameX >= this.player.maxFrame){
            if(this.player.onGround()) this.player.setState(states.STANDING,playerSpeeds.NoSpeed);
            else this.player.setState(states.JUMPING,playerSpeeds.NoSpeed);
        }
        else this.isChanged = false;
        
    }
}

export class Dead extends State {
    constructor(game,player){
        super('DEAD');
        this.game = game;
        this.player = player;
    }
    enter(){
        this.isChanged = true;
        this.player.image = this.player.imageCharacter2;
        this.player.frameX = 0;
        this.player.maxFrame = 7;
        this.player.frameY = 4;
        this.game.Looser = this.player;
    }
    handleInput(input){       
       
    }
}
