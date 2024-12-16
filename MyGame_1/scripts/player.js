import { Standing,Running,Jumping,Punching,Shooting,Shielding,Hit,Dead,states } from "./playerStates.js";
import { Commands, delegateInput, inputStates } from "./input.js";
import { Projectile, Punch, Shield } from "./abilities.js";

export const playerTypes = {
    fire : 'fire'
}

export class Player{  
    constructor(game,playerType,isPlayer1){
        this.game = game;
        this.playerType = playerType;
        this.width = 70; 
        this.height = 150;

        // name
        let playerNumber;
        if(isPlayer1) playerNumber = this.game.player1state;
        else playerNumber = this.game.player2state;
        let keys = Object.keys(inputStates);
        this.name = keys.find(key => inputStates[key] === playerNumber);
        // animation
        this.offsetY = 60;
        this.offsetX = 60;
        this.imageWidth = 192; 
        this.imageHeight = 220;
        this.image;                                        
        this.imageCharacter1;
        this.imageCharacter2;
        this.imageProjectile;
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 37;
        this.changeImageDirection = false;
        this.fps = 8;
        this.frameInterval = 1000/this.fps;
        this.frameTimer = 0;
        
        // location
        this.y = this.game.height-this.height - this.game.groundMargin;
        this.direction = 1;
        if(isPlayer1){
            this.x = 20;
        }
        else{
            this.x = this.game.width - 20;
            this.direction = -1;
            this.changeImageDirection = true;
        }
        
        // movement attributes
        this.weight = 2;
        this.vy = 0;
        this.speed = 0;
        this.maxSpeed = 10;

        // character attributes
        this.maxHealth = 100;
        this.maxEnergy = 1000;
        this.health = this.maxHealth;
        this.energy = this.maxEnergy;

        // actions
        this.attacks = [];
        this.punch = new Punch(this.game,this);
        this.punch.isActive = false;
        this.shield = new Shield(this.game,this);
        this.punchTimer = 0;
        this.projectileTimer = 0;
        this.shieldTimer = 0;
        this.isLoadedPunch = false;
        this.isLoadedProjectile = false;
        
        // state
        this.states = [new Standing(this.game,this),new Running(this.game,this),
            new Jumping(this.game,this),new Punching(this.game,this),new Shooting(this.game,this),
            new Shielding(this.game,this),new Hit(this.game,this),new Dead(this.game,this)];
       
        // AI
        this.AIupdateDelegate = new delegateInput();
        this.AIcalculateRewardDelegate = new delegateInput();
        this.AIupdateRegulator = 0;
    }

    update(input,deltaTime){
        if(this.AIupdateRegulator >= 10){ // Prevents the ai from being overwhelmed with information
            this.AIupdateDelegate.runDelegate();
            this.AIupdateRegulator = 0;
        }
        else this.AIupdateRegulator++;

        this.currentState.handleInput(input);

        if(this.energy<this.maxEnergy) this.energy++;

        //horizontal movment
        this.x += this.speed*this.direction;
        if(input.includes(Commands.RUNRIGHT)) {
            if(this.direction === -1) {
                this.changeImageDirection = true;
                this.direction = 1;
            }
            else this.changeImageDirection = false;
            
        }
        else if(input.includes(Commands.RUNLEFT)) {
            if(this.direction === 1) {
                this.changeImageDirection = true;
                this.direction = -1;
            }
            else this.changeImageDirection = false;
        }
        else this.speed = 0;

        // horizontal boundaries
        if(this.x<0) this.x = 0;
        if(this.x>this.game.width-this.width) this.x = this.game.width-this.width;

        //vertical movment
        this.y += this.vy;
        if(!this.onGround()) this.vy += this.weight;
        else this.vy = 0;

        // vertical boundaries
        if(this.y > this.game.height-this.height-this.game.groundMargin)
            this.y = this.game.height-this.height-this.game.groundMargin;

        
        // handle attacks
        this.attacks.forEach(attack => {
        attack.update()
        });
        this.attacks = this.attacks.filter(attack => attack.isActive);
        
        // handle attack delays
        if(this.isLoadedPunch && this.punchTimer < this.game.gameTime - Punch.DELAY){
            this.executePunch(true);
            this.isLoadedPunch = false;
        }
        else if(this.punch.isActive && this.punchTimer < this.game.gameTime - Punch.DELAY - Punch.DURATION)
            this.executePunch(false);

        if(this.isLoadedProjectile && this.projectileTimer < this.game.gameTime - Projectile.DELAY){
            this.executeShoot();
            this.isLoadedProjectile = false;
        }
       

        // handle shield
        this.shield.update();
        
        if(this.shield.isActive && this.shieldTimer < this.game.gameTime - Shield.DURATION){
            this.shieldTimer = this.game.gameTime;
            this.energy -= this.punch.energyCost;
            this.shield.color = 'blue';
        }

        // sprite animation
        if(this.frameTimer > this.frameInterval){
            this.frameTimer = 0;
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        }
        else{
            this.frameTimer += deltaTime;
        }
        
    }

    draw(context){
        if(this.game.debug) context.strokeRect(this.x,this.y,this.width,this.height);

        if(this.direction === -1){  
            context.save(); 
            context.scale(-1, 1);    

            const newX = this.x + this.imageWidth; 
            
            context.drawImage(
                this.image,
                this.frameX * this.imageWidth, 
                this.frameY * this.imageHeight,
                this.imageWidth, 
                this.imageHeight,
                -newX + this.offsetX, 
                this.y - this.offsetY, 
                this.imageWidth, this.imageHeight
            );
        
            context.restore(); 
 
        }
        else{
            context.drawImage(
                this.image,
                this.frameX*this.imageWidth,
                this.frameY*this.imageHeight,
                this.imageWidth,
                this.imageHeight,
                this.x-this.offsetX,
                this.y-this.offsetY,
                this.imageWidth,
                this.imageHeight);
        }

        this.attacks.forEach(attack => {
            attack.draw(context);
           });
        this.punch.draw(context);
        this.shield.draw(context);
    }

    onGround(){
        return this.y >= this.game.height - this.height - this.game.groundMargin;
    }
    setState(state,speed){
        this.currentState = this.states[state];
        if(speed<=this.maxSpeed) this.speed = speed;     
        this.currentState.enter();
    }
    launchPunch(){
        this.punchTimer = this.game.gameTime;
        this.isLoadedPunch = true;
    }
    launchShoot(){
        this.projectileTimer = this.game.gameTime;
        this.isLoadedProjectile = true;
    }
    executePunch(isActive){
        if(isActive){
            this.punch.update();
            this.punch.isActive = true;
            this.attacks.push(this.punch);
            this.energy -= this.punch.energyCost;
        }
        else this.punch.isActive = false;
    }
    executeShoot(){      
            let projectile = new Projectile(this.game, this);
            this.attacks.push(projectile);
            this.energy -= projectile.energyCost;
    }
    executeShield(isActive){
        if(isActive){
            this.shield.isActive = true;
        }
        else this.shield.isActive = false;
    }
    gotHit(attack){
        if(this.shield.isActive){
            this.energy -= attack.power*10;
            this.shield.color = 'red';
        }
        else{
            if(this.health <= attack.power){
                this.setState(states.DEAD,0) 
                this.game.finishGame();
            }
            else
            this.setState(states.HIT,0) 

            this.health -= attack.power;
        }
        
        this.AIcalculateRewardDelegate.runDelegate(attack);
    }
    isActionAble(actionClass){
        
        let isAttackActionAble = true;
        if(actionClass === Punch) isAttackActionAble = !this.isLoadedPunch;
        else if(actionClass === Projectile) isAttackActionAble = !this.isLoadedProjectile;
        
        return this.energy >= actionClass.ENERGY_COST && isAttackActionAble; 
    }

    initImage(){
        this.currentState = this.states[0];
        this.currentState.enter();
    }

}


export class imageSelector{   
    
    static init(player1,player2){
        this.player1_string = '';
        this.player2_string = '';
        if(player1.playerType===player2.playerType){
            this.player1_string = '_yellow';
            this.player2_string = '_blue';
        }
        else{
            // for adding more player characters
        }
        player1.imageCharacter1 = document.getElementById(player1.playerType + '_player' + this.player1_string + '_1');
        player1.imageCharacter2 = document.getElementById(player1.playerType + '_player' + this.player1_string + '_2');
        player1.imageProjectile = document.getElementById(player1.playerType + '_projectile' + this.player1_string);

        player2.imageCharacter1 = document.getElementById(player2.playerType + '_player' + this.player2_string + '_1');
        player2.imageCharacter2 = document.getElementById(player2.playerType + '_player' + this.player2_string + '_2');
        player2.imageProjectile = document.getElementById(player2.playerType + '_projectile' + this.player2_string);

        player1.initImage();
        player2.initImage();
    }
}