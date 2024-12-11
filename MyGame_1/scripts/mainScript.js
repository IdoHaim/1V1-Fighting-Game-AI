import { Background } from "./background.js";
import { MainMenu,PauseMenu} from "./menus.js"
import { InputHandler,InputController,inputStates } from "./input.js";
import { Player, imageSelector, playerTypes } from "./player.js";
import { UI } from "./UI.js";
import { QLearningWithFunctionApprox } from "./AI.js";
import { AI_trainer } from "./AI_trainer.js";


window.addEventListener('load', function() {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 1600;
  canvas.height = 800;

  const AI_Trainer_Mode = false;    // Change this to   true   if you want to train the AI!!!
  
    
    class Game {
      constructor(width, height, player1state, player2state) {
        this.width = width;
        this.height = height;
        this.groundMargin = 70;
        this.background = new Background(this.width,this.height);
        this.player1 = new Player(this, playerTypes.fire, true);
        this.player2 = new Player(this, playerTypes.fire, false);
        imageSelector.init(this.player1, this.player2);
        this.input = new InputHandler(this);
        this.inputPlayer_1 = new InputController(this, player1state);
        this.inputPlayer_2 = new InputController(this, player2state);

        this.Ai;
        if(player2state===inputStates.AI) 
          this.Ai = new QLearningWithFunctionApprox(this,this.player2);

        this.AiTrainer;
        if(AI_Trainer_Mode) 
          this.AiTrainer = new AI_trainer(this,this.player1);

        this.ui = new UI(this);
        this.countDownInterval = 30;
        this.debug = false;
        this.gameOver = false;
        this.gameTime = 0;
        this.Looser;
        this.stopLooserAnimatiom = false;

        this.pauseMenu = new PauseMenu(this);
        this.gameStarted = false;
        this.isPaused = false;
        
      }
    
      update(deltaTime) {
        if (this.isPaused) return;
        
        if(this.gameOver)
        {
          if(!this.Ai.isDataSaved){
            this.Ai.saveAIData();
            this.Ai.isDataSaved = true;
          }

          if(this.Looser.frameX===this.Looser.maxFrame) 
            this.stopLooserAnimatiom = true;
            
          if(this.stopLooserAnimatiom) return;  
        }

        this.gameTime += deltaTime;

        this.background.update();
        this.player1.update(this.inputPlayer_1.commandsList, deltaTime);
        this.player2.update(this.inputPlayer_2.commandsList, deltaTime);
      
    
        this.player1.attacks.forEach(attack => {
          if (this.checkCollision(attack, this.player2)) {
            this.player2.gotHit(attack);
            attack.isActive = false;
          }
        });
    
        this.player2.attacks.forEach(attack => {
          if (this.checkCollision(attack, this.player1)) {
            this.player1.gotHit(attack);
            attack.isActive = false;
          }
        });
      }
    
      
      draw(context){
        if (this.isPaused) {
          this.pauseMenu.draw(context); 
        } else {
          this.background.draw(context);
          this.ui.draw(context);
          this.player1.draw(context);
          this.player2.draw(context);
        }       
      }

    
      checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
          rect1.x + rect1.width > rect2.x &&
          rect1.y < rect2.y + rect2.height &&
          rect1.height + rect1.y > rect2.y;
      }
      startGame() {
        this.gameStarted = true;
      }     
      resumeGame() {
        this.isPaused = false;
      }
      goToMainMenu(){
        location.reload(true);
      }
      finishGame() {
        this.gameOver = true;
        this.inputPlayer_1.stop();
        this.inputPlayer_2.stop();
      }
    }
    


  /////////////////////////////////////////////////////
  
  let mainMenu = null;
  let game = null;
  

  if(AI_Trainer_Mode){ // trainer mode
    game = new Game(canvas.width, canvas.height, inputStates.TRAINER, inputStates.AI);
    game.gameStarted = true;
  }

  else{ // regular settings
    mainMenu = new MainMenu(canvas.width, canvas.height);
    mainMenu.draw(ctx);
  mainMenu.startGame().then(() => {
    game = new Game(canvas.width, canvas.height, inputStates.PLAYER_1, mainMenu.selectedOption);
    game.gameStarted = true;
});
}

  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!AI_Trainer_Mode&&(!game || !game.gameStarted)) {
      mainMenu.draw(ctx);
    }
      else if(game.isPaused){
        game.pauseMenu.draw(ctx); 
      }
    else {
      game.draw(ctx);
      game.update(deltaTime);
    }

    requestAnimationFrame(animate);
  }
  
  animate(0);
});
