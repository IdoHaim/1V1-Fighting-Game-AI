import { Punch } from "./abilities.js";
import { Commands } from "./input.js";
import { Dead, Hit, Shielding } from "./playerStates.js";
import { states } from "./playerStates.js";

const Rewards = {
    1: 10,
    2: 20,
    3: 40,
    4: 100,
    5: 200
}

export class QLearningWithFunctionApprox {
    constructor(game,AIPlayer) {
        this.game = game;
        this.statistics = new AI_statistics(game,AIPlayer);
        this.yourPlayer = AIPlayer;
        this.enemyPlayer;
        this.input;
        if(AIPlayer===game.player1){
            this.enemyPlayer = game.player2;
            this.input = game.inputPlayer_1;
        }
        else{
            this.enemyPlayer = game.player1;
            this.input = game.inputPlayer_2;
        }

        this.actions = Object.values(Commands);
        this.features = [];
        this.previousFeatures = [];
        this.previousAction;
        this.weights = {}; 
        this.featuresTable = new Map();   // {gameTime,features}   
        this.learningRate = 0.1;
        this.discountFactor = 0.9; 
        this.explorationRate = 1; 
        this.explorationDecay = 0.99; 
        this.maxWeightValue = 1e7; 
        this.minWeightValue = -1e7;

        this.isDataSaved = false;
        this.loadAIData(); // Load saved AI data on initialization
        
        this.yourPlayer.AIcalculateRewardDelegate.addFunction((attack) => this.gotHit(attack)); // got hit event
        this.enemyPlayer.AIcalculateRewardDelegate.addFunction((attack) => this.enemyHit(attack)); // enemy hit event
        this.yourPlayer.AIupdateDelegate.addFunction(() => this.update()); // update ai
    }

    saveAIData() {
        const aiData = {
            weights: this.weights,
            explorationRate: this.explorationRate,
            features: this.features,
            previousAction: this.previousAction,
            previousFeatures: this.previousFeatures,
            explorationRate: this.explorationRate,
            statistics: this.statistics.Save()
        };
    
        const jsonData = stringifyWithoutCircular(aiData);
    
        localStorage.setItem('aiData', jsonData);
        this.isDataSaved = true;
        console.log('saved! \n',aiData);
    }
    
    loadAIData() {
        const jsonData = localStorage.getItem('aiData');
        if (jsonData) {
            const aiData = JSON.parse(jsonData);
    
            this.weights = aiData.weights;
            this.explorationRate = aiData.explorationRate;
            this.features = aiData.features;
            this.previousAction = aiData.previousAction;
            this.previousFeatures = aiData.previousFeatures;
            this.explorationRate = aiData.explorationRate;
            this.statistics.Load(aiData. statistics);

            console.log('loaded! \n',aiData);
        }
    }

    getStateFeatures() {      
        let closestThreat = this.game.width;
        this.enemyPlayer.attacks.forEach(attack => {
            let distance = Math.abs(attack.x + attack.width/2 - this.yourPlayer.x + this.yourPlayer.width/2);
            if(distance<closestThreat) closestThreat = distance;
        });
        let array = [  // [value,max value]
            this.yourPlayer.y, this.game.height-this.game.groundMargin,  // your location
            this.yourPlayer.x, this.game.width,
            this.yourPlayer.direction,  1,     
            this.enemyPlayer.x, this.game.height-this.game.groundMargin,   // enemy location
            this.enemyPlayer.y, this.game.width,
            this.enemyPlayer.direction, 1,
            Math.abs(this.yourPlayer.x - this.enemyPlayer.x), this.game.width, // distance
            Math.abs(this.yourPlayer.y - this.enemyPlayer.y), this.game.width, // height differences
            this.yourPlayer.health, this.yourPlayer.maxHealth,
            this.yourPlayer.energy, this.yourPlayer.maxEnergy,
            this.enemyPlayer.health, this.enemyPlayer.maxHealth,
            this.enemyPlayer.energy, this.enemyPlayer.maxEnergy,
            states[this.enemyPlayer.currentState.state],  Object.keys(states).length-1,
            closestThreat, this.game.width // distance from enemy's closest threat
        ];

        // limits the features values to 1
        let newArray = new Array((array.length)/2).fill(0);
        for (let i = 0; i < array.length; i += 2) {
            newArray[i/2] = array[i] / array[i+1] ;
        }

        this.previousFeatures = this.features;
        this.features = newArray;
    }
 
    predictQValue(action,features) { 
        if (!this.weights[action]) {
            this.weights[action] = new Array(features.length).fill(0);
        }

        let qValue = 0;
        for (let i = 0; i < features.length; i++) {
            qValue += this.weights[action][i] * features[i];
        }

        return qValue;
    }

    updateWeights(features,action, reward, nextFeatures) {
        const nextBestAction = this.getBestAction(nextFeatures);
        const nextQValue = this.predictQValue(nextBestAction,nextFeatures);

        const currentQValue = this.predictQValue(action,features);

        for (let i = 0; i < features.length; i++) {
            let value = this.weights[action][i];
            if (isNaN(value)|| value === null || value === undefined) {
                this.weights[action][i] = 0; 
            }
                this.weights[action][i] += this.learningRate * (reward + this.discountFactor * nextQValue - currentQValue) * features[i];
  
                if (this.weights[action][i] > this.maxWeightValue) {
                    this.weights[action][i] = this.maxWeightValue;
                } else if (this.weights[action][i] < this.minWeightValue) {
                    this.weights[action][i] = this.minWeightValue;
                }
        
            }
            
    }

    getBestAction(features) {
        let bestAction = null;
        let maxQValue = -Infinity;

        this.actions.forEach(action => {
            const qValue = this.predictQValue(action,features);
            if (qValue > maxQValue) {
                maxQValue = qValue;
                bestAction = action;
            }            
        });

        return bestAction;
    }

    chooseAction() {
        if (Math.random() < this.explorationRate) {
            return this.actions[Math.floor(Math.random() * this.actions.length)];
        } else {
            return this.getBestAction(this.features);
        }
    }

    decayExplorationRate() {
        if(this.explorationRate>0.05) // to make the ai choose a random action once in a while
        this.explorationRate *= this.explorationDecay;
    }

    calculateShootReward() {
        const directionToEnemy = this.enemyPlayer.x -  this.yourPlayer.x;
        const isShootingTowardsEnemy = (directionToEnemy > 0 && this.yourPlayer.direction > 0) || 
                                       (directionToEnemy < 0 && this.yourPlayer.direction < 0);   
    
        if (isShootingTowardsEnemy) {
            return Rewards[2]; 
        } else {
            return -Rewards[1]; 
        }        
    }
    enemyHit(attack){
        let reward = 0;
        let previousFeatures = [];
        let action;
        if(this.enemyPlayer.currentState instanceof Hit) reward = Rewards[4];
        else if(this.enemyPlayer.currentState instanceof Dead) reward = Rewards[5];
        else if(this.enemyPlayer.currentState instanceof Shielding) reward = Rewards[3];

        if(attack instanceof Punch && this.featuresTable.has(this.yourPlayer.punch.AIid)){         
            previousFeatures = this.featuresTable.get(this.yourPlayer.punch.AIid);
            action = Commands.PUNCH;
        }
        else{ // shoot hit (you cant know in advance if a shoot will hit the enemy 
              // so the reward is being calculated based only on the direction of the shoot)
            return;
        } 

            this.updateWeights(previousFeatures,
                action,                 
                reward,                        
                this.features);                 

            this.featuresTable.delete(this.yourPlayer.punch.AIid);
    }
    gotHit(attack){
        let reward = 0;       
        if(this.yourPlayer.currentState instanceof Hit) reward = -Rewards[4];
        else if(this.yourPlayer.currentState instanceof Dead) reward = -Rewards[5];
        else if(this.yourPlayer.currentState instanceof Shielding) reward = Rewards[4];

            this.updateWeights(this.previousFeatures,
                this.previousAction,                 
                reward,                        
                this.features);                 
    }

    update(){
       this.getStateFeatures();
       let action = this.chooseAction();
       if(action === Commands.PUNCH){
        
        // save punch details for later feedback
        this.featuresTable.set(this.game.gameTime,this.features);
        this.yourPlayer.punch.AIid = this.game.gameTime;

        //punishing the ai for unnecessary punches
        if(Math.abs(this.yourPlayer.x - this.enemyPlayer.x)>this.yourPlayer.width+this.yourPlayer.offsetX){
            this.updateWeights(this.previousFeatures,    
                action,                 
                -Rewards[1],                        
                this.features);      
        }
       }
       else if(action === Commands.SHOOT){
        this.updateWeights(this.previousFeatures,
            Commands.SHOOT,                 
            this.calculateShootReward(),                        
            this.features);            
       }
       // rewarding the ai for getting closer to the enemy
       else if((action === Commands.RUNRIGHT && this.yourPlayer.x - this.enemyPlayer.x < -this.yourPlayer.punch.width)||
       (action === Commands.RUNLEFT && this.yourPlayer.x - this.enemyPlayer.x > this.yourPlayer.punch.width)){
        this.updateWeights(this.previousFeatures,    
            action,                 
            Rewards[1],                        
            this.features);            
       }

       this.input.AICommand(action);
       this.previousAction = action;
       this.decayExplorationRate();
    }
}


function stringifyWithoutCircular(obj) {
    const cache = new Set();
    const result = JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
                return;
            }
            cache.add(value);
        }
        return value;
    });
    cache.clear();
    return result;
}


// For analizing AI's learning process
// this class is very minimalistic but its flexible so you can change it 
// to make it store different kinds of data about the learning process
class AI_statistics{
    constructor(game,player){
        this.game = game;
        this.player = player;
        this.AI_Human_ScoreBoard = new ScoreBoard();
        this.AI_Trainer_ScoreBoard = new ScoreBoard();
    }
    Save(){
        let target;
        if(this.game.AiTrainer) target = this.AI_Trainer_ScoreBoard;
        else target = this.AI_Human_ScoreBoard;

        if(this.game.Looser === this.player) target.losses++;
        else target.wins++;

       return {
        AI_vs_Human : this.AI_Human_ScoreBoard,
        AI_vs_Trainer : this.AI_Trainer_ScoreBoard
        };
    }
    Load(data){
        // checks that the loaded data is compatible with this type of data.
        // add validations if you changed this class or make sure that in the
        // first use after the change the loadAIData() will not load the old data
        // into this class
        if(!data || !this.AI_Human_ScoreBoard) return;

        this.AI_Human_ScoreBoard = data.AI_vs_Human;
        this.AI_Trainer_ScoreBoard = data.AI_vs_Trainer;
    }
}
class ScoreBoard{
    constructor(){
        this.wins = 0;
        this.losses = 0;
    }
}