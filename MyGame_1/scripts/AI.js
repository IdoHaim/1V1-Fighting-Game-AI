import { Commands } from "./input.js";
import { Dead, Hit, Shielding } from "./playerStates.js";
import { states } from "./playerStates.js";

export class QLearningWithFunctionApprox {
    constructor(game,AIPlayer) {
        this.game = game;
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
        this.explorationDecay = 0.99999999; 
        this.maxWeightValue = 1e7; 
        this.minWeightValue = -1e7;

        this.isDataSaved = false;
        this.loadAIData(); // Load saved AI data on initialization
        
        this.yourPlayer.AIcalculateRewardDelegate.addFunction(() => this.gotHit()); // got hit event
        this.enemyPlayer.AIcalculateRewardDelegate.addFunction(() => this.enemyHit()); // enemy hit event
        this.yourPlayer.AIupdateDelegate.addFunction(() => this.update()); // update ai
    }

    saveAIData() {
        const aiData = {
            weights: this.weights,
            explorationRate: this.explorationRate,
            features: this.features,
            previousAction: this.previousAction,
            previousFeatures: this.previousFeatures,
            explorationRate: this.explorationRate
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
    
            console.log('loaded! \n',aiData);
        }
    }


    /*
    This function returns every value in the array in the range of 100 to -100.
    I used it to get smaller weight values, but it's unnecessary because I already
    made adjustments in predictQValue to do the same thing.
    This action is not in use, but I still kept it to have more examples.
     */
    getStateFeaturesPrecentegeValues() {     // NOT IN USE 
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
        ];

        // limits the features values to 100
        let newArray = new Array((array.length)/2).fill(0);
        for (let i = 0; i < array.length; i += 2) {
            newArray[i/2] = array[i] / array[i+1] * 100;
        }

        this.previousFeatures = this.features;
        this.features = newArray;
    }

    getStateFeatures() {      
        let closestThreat = this.game.width;
        this.enemyPlayer.attacks.forEach(attack => {
            let distance = Math.abs(attack.x + attack.width/2 - this.yourPlayer.x + this.yourPlayer.width/2);
            if(distance<closestThreat) closestThreat = distance;
        });
        let array = [  
            this.yourPlayer.y,  // your location
            this.yourPlayer.x, 
            this.yourPlayer.direction,  
            this.enemyPlayer.x,  // enemy location
            this.enemyPlayer.y, 
            this.enemyPlayer.direction,
            Math.abs(this.yourPlayer.x - this.enemyPlayer.x),  // distance
            Math.abs(this.yourPlayer.y - this.enemyPlayer.y),  // height differences
            this.yourPlayer.health, 
            this.yourPlayer.energy, 
            this.enemyPlayer.health, 
            this.enemyPlayer.energy, 
            states[this.enemyPlayer.currentState.state],  
            closestThreat  // distance from enemy's closest threat
        ];

        this.previousFeatures = this.features;
        this.features = array;
    }
 
    predictQValue(action,features) { 
        if (!this.weights[action]) {
            this.weights[action] = new Array(features.length).fill(0);
        }

        let qValue = 0;
        for (let i = 0; i < features.length; i++) {
            qValue += this.weights[action][i] * features[i] / this.maxWeightValue;
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
            return 2; 
        } else {
            return -1; 
        }        
    }
    enemyHit(){
        let reward = 0;
        let previousFeatures = [];
        let action;
        if(this.enemyPlayer.currentState === Hit) reward = 10;
        else if(this.enemyPlayer.currentState === Dead) reward = 20;
        else if(this.enemyPlayer.currentState === Shielding) reward = 4;

        if(this.featuresTable.has(this.yourPlayer.punch.AIid)){          
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
    gotHit(){
        let reward = 0;       
        if(this.yourPlayer.currentState === Hit) reward = -10;
        else if(this.yourPlayer.currentState === Dead) reward = -20;
        else if(this.yourPlayer.currentState === Shielding) reward = 10;

            this.updateWeights(this.previousFeatures,
                this.previousAction,                 
                reward,                        
                this.features);                 
    }

    update(){
       this.getStateFeatures()
       let action = this.chooseAction();
       if(action === Commands.PUNCH){
        this.featuresTable.set(this.game.gameTime,this.features);
        this.yourPlayer.punch.AIid = this.game.gameTime;
       }
       else if(action === Commands.SHOOT){
        this.updateWeights(this.previousFeatures,
            Commands.SHOOT,                 
            this.calculateShootReward(),                        
            this.features);            
       }
       else if((action === Commands.RUNRIGHT && this.yourPlayer.x - this.enemyPlayer.x < -this.yourPlayer.punch.width)||
       (action === Commands.RUNLEFT && this.yourPlayer.x - this.enemyPlayer.x > this.yourPlayer.punch.width)){
        this.updateWeights(this.previousFeatures,    // rewarding the ai for getting closer to the enemy
            action,                 
            1,                        
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
