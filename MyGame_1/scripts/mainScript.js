import { Background } from "./background.js";
import { MainMenu,PauseMenu} from "./menus.js"
import { InputHandler,InputController,inputStates } from "./input.js";
import { Player, imageSelector, playerTypes } from "./player.js";
import { UI } from "./UI.js";


window.addEventListener('load', function() {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 1600;
  canvas.height = 800;
  
    
    class Game {
      constructor(width, height) {
        this.width = width;
        this.height = height;
        this.groundMargin = 70;
        this.background = new Background(this);
        this.player1 = new Player(this, playerTypes.fire, true);
        this.player2 = new Player(this, playerTypes.fire, false);
        imageSelector.init(this.player1, this.player2);
        this.input = new InputHandler(this);
        this.inputPlayer_1 = new InputController(this, inputStates.PLAYER_1);
        this.inputPlayer_2// = new InputController(this, inputStates.PLAYER_2);
        this.Ai;
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
  
  const game = new Game(canvas.width, canvas.height);
  const mainMenu = new MainMenu(game);
  
  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!game.gameStarted) {
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
