//import { playerTypes } from "./player.js";      for next version
import { inputStates } from "./input.js";



export class MainMenu {
    constructor(width,height) {
      this.width = width;
      this.height = height;
      this.selectedOption = null;
      this.backgroundImage = document.getElementById('mainMenuImg');
      
      this.startButton = document.createElement("button");
      this.startButton.id = "Button1";
      this.startButton.innerHTML = "Start";

      this.startButton.addEventListener("mouseover", () => {
        this.startButton.style.backgroundColor = "darkgreen";
      });
      this.startButton.addEventListener("mouseout", () => {
        this.startButton.style.backgroundColor = "green";
      });
  

      document.body.appendChild(this.startButton);
  
    // Option 1
    this.option1Button = document.createElement("button");
    this.option1Button.id = "option1Button";
    this.option1Button.classList.add("menu-button");
    this.option1Button.innerHTML = "1 V 1";
    document.body.appendChild(this.option1Button);

    // Option 2
    this.option2Button = document.createElement("button");
    this.option2Button.id = "option2Button";
    this.option2Button.classList.add("menu-button");
    this.option2Button.innerHTML = "AI";
    document.body.appendChild(this.option2Button);

    // Events 
    this.option1Button.addEventListener("click", () => {
      this.selectButton(this.option1Button, this.option2Button);
      this.selectedOption = inputStates.PLAYER_2;
    });

    this.option2Button.addEventListener("click", () => {
      this.selectButton(this.option2Button, this.option1Button);
      this.selectedOption = inputStates.AI;       
    });
  }
    
    waitForStartButtonClick() {
      return new Promise((resolve) => {
        this.startButton.addEventListener("click", () => {
          if (this.selectedOption != null) {
            this.hide();
            resolve();
          } else {
            alert("Please select an option first!");
          }
        });
      });
    }
    async startGame() {
      await this.waitForStartButtonClick();
    }

    selectButton(selectedButton, otherButton) {
        selectedButton.classList.add("selected");
        otherButton.classList.remove("selected");
    }
  
    hide() {
      this.startButton.style.display = "none";
      this.option1Button.style.display = "none";
      this.option2Button.style.display = "none";
    }
  
    show() {
      this.startButton.style.display = "block";
      this.option1Button.style.display = "block";
      this.option2Button.style.display = "block";
    }
    
    draw(context) {
     // Main Menu Background 
     context.drawImage(this.backgroundImage, 0, 0, this.width, this.height);
   
     // Game Headline
     context.font = '80px Roboto';
     context.fillStyle = 'white';
     context.textAlign = 'center';     
     context.shadowOffsetX = 2;
     context.shadowOffsetY = 2;
     context.shadowColor = 'black';
     context.fillText('Fighting Game', this.width / 2, this.height / 4);
    }
  }
  
  export class PauseMenu {
    constructor(game) {
      this.game = game;
  
      // Resume
      this.resumeButton = document.createElement("button");
      this.resumeButton.id = "resumeButton";
      this.resumeButton.innerHTML = "Resume";
      document.body.appendChild(this.resumeButton);
  
      // Main Menu
      this.mainMenuButton = document.createElement("button");
      this.mainMenuButton.id = "mainMenuButton";
      this.mainMenuButton.innerHTML = "Main Menu";
      document.body.appendChild(this.mainMenuButton);
  
      // events
      this.resumeButton.addEventListener("click", () => {
        this.game.resumeGame();
        this.hide();
      });
  
      this.mainMenuButton.addEventListener("click", () => {
        this.game.goToMainMenu();
        this.hide();
      });
  
      this.hide(); 
    }
  
    hide() {
      this.resumeButton.style.display = "none";
      this.mainMenuButton.style.display = "none";
    }
  
    show() {
      this.resumeButton.style.display = "block";
      this.mainMenuButton.style.display = "block";
      
      // location update
      this.resumeButton.style.position = "absolute";
      this.resumeButton.style.top = `${this.game.height / 2 - 30}px`;
      this.resumeButton.style.left = "50%";
      this.resumeButton.style.transform = "translateX(-50%)";
  
      this.mainMenuButton.style.position = "absolute";
      this.mainMenuButton.style.top = `${this.game.height / 2 + 50}px`;
      this.mainMenuButton.style.left = "50%";
      this.mainMenuButton.style.transform = "translateX(-50%)";
    }
  
    draw(context) {
      // seethrough background
      this.game.background.draw(context);
      this.game.ui.draw(context);
      this.game.player1.draw(context);
      this.game.player2.draw(context);
      context.fillStyle = "rgba(0, 0, 0, 0.5)";
      context.fillRect(0, 0, this.game.width, this.game.height);
  
      // headline
      context.font = "48px Arial";
      context.fillStyle = "white";
      context.textAlign = "center";
      context.fillText("Pause", this.game.width / 2, this.game.height / 4);
  
      this.show();
    }
  }