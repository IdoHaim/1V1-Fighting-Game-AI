import { Commands } from "./input.js";

export class AI_trainer{
    constructor(game,trainerPlayer) {
        this.game = game;
        this.yourPlayer = trainerPlayer;
        this.enemyPlayer;
        this.input;
        if(trainerPlayer===game.player1){
            this.enemyPlayer = game.player2;
            this.input = game.inputPlayer_1;
        }
        else{
            this.enemyPlayer = game.player1;
            this.input = game.inputPlayer_2;
        }

        this.actions = Object.values(Commands);
        this.yourPlayer.AIupdateDelegate.addFunction(() => this.update());
    }
   update(){ 
        if(this.game.Ai.isDataSaved){ // restard the game when its over and the data was saved
            this.game.goToMainMenu();
        }
        
        // handle decision making
        let action = null;

        // check possible threats
        let closestThreat = this.game.width;
        this.enemyPlayer.attacks.forEach(attack => { 
            let distance = Math.abs(attack.x + attack.width/2 - this.yourPlayer.x + this.yourPlayer.width/2);
            if(distance<closestThreat) closestThreat = distance;
        });
 
        if(closestThreat <= this.yourPlayer.width + this.yourPlayer.offsetX){            
            action = this.chooseRandomAction(Commands.SHIELD,null,0.7); // making some of the shielding attempts fail on purpose
        }
        else if(Math.abs(this.yourPlayer.x - this.enemyPlayer.x) > this.yourPlayer.punch.width){
            if(this.chooseRandomAction(true,false,0.8)){ // make the trainer play slower

                // getting closer to the enemy or shooting him
                if(this.yourPlayer.x - this.enemyPlayer.x < 0){
                    action = this.chooseRandomAction(Commands.RUNRIGHT,Commands.SHOOT,0.99);
                }
                else{
                    action = this.chooseRandomAction(Commands.RUNLEFT,Commands.SHOOT,0.99);
                }
            }
        }
        else{
            // changing direction towards the enemy
            if(this.yourPlayer.direction === -1 && this.yourPlayer.x - this.enemyPlayer.x < 0){
               action = Commands.RUNRIGHT;
            }
            else if(this.yourPlayer.direction === 1 && this.yourPlayer.x - this.enemyPlayer.x > 0){
                action = Commands.RUNRIGHT;
            }
            // punch when the direction is towards the enemy
            else{
                action = this.chooseRandomAction(Commands.PUNCH,null,0.7);
            }
        }

        this.input.AICommand(action);
    }

    chooseRandomAction(action1,action2,odds) { 
        if (Math.random() < odds) {
            return action1;
        } else {
            return action2;
        }
    }
}
