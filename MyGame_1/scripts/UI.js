export class UI{
    
        constructor(game){
          this.game = game;
          this.fontSize = 25;
          this.fontFamily = 'Roboto';
          this.color = 'white';
        }
        draw(context){
          context.save();
          context.fillStyle = this.color;
          context.shadowOffsetX = 2;
          context.shadowOffsetY = 2;
          context.shadowColor = 'black';
          context.font = '20px Roboto';
          const barWidth = 180; 
          const barHeight = 30; 
          const x = 20;
          const y = 30;

          // player 1
          drawPlayerHUD(context, x, y, barWidth, barHeight, 'Player 1', this.game.player1);

          // player 2 
          drawPlayerHUD(context, canvas1.width - x - barWidth, y, barWidth, barHeight, 'Player 2', this.game.player2);

          // game over messages
          if (this.game.gameOver){                     
            context.textAlign = 'center';
            let message1;
            let message2;
            if (this.game.player1.health > this.game.player2.health){           
              message1 = 'Player 1 won!';
              message2 = '';
            } else {
              message1 = 'Player 2 won!';
              message2 = '';
            }
            context.font = '70px ' + this.fontFamily;
            context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 20);
            context.font = '25px ' + this.fontFamily;
            context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 20);
          }
          context.restore();
        }
    
}

function drawPlayerHUD(context, x, y, width, height, playerName, player) {

// name
context.fillStyle = 'white';
context.textAlign = 'center';
context.font = '20px Arial';
context.fillText(playerName, x + width / 2, y - 5);

// health
context.fillStyle = 'gray';
context.fillRect(x, y + 10, width, height);
context.fillStyle = 'red'; 
const player1HelthBarWidth = (player.health / player.maxHealth) * width ;
context.fillRect(x, y + 10, player1HelthBarWidth, height);
context.fillStyle = 'white'; 
context.textAlign = 'center';
context.fillText('Health', x + width / 2, y + 10 + height / 1.5);
// energy
context.fillStyle = 'gray';
context.fillRect(x, y + 50, width, height);
context.fillStyle = ' #0066ff'; 
const player1EnergyBarWidth = (player.energy / player.maxEnergy) * width;
context.fillRect(x, y + 50, player1EnergyBarWidth, height);
context.fillStyle = 'white'; 
context.textAlign = 'center';
context.fillText('Energy', x + width / 2,y + 50 + height / 1.5);

}
