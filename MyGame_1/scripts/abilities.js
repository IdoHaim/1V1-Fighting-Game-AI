
class Ability{
    static ENERGY_COST = 0;
    static DELAY = 0;
    static DURATION = 0;

    constructor(game,sender){        
        this.sender = sender;
        this.game = game,
        this.x = this.sender.x;
        this.y = this.sender.y;
        this.energyCost = this.constructor.ENERGY_COST;
        this.width = 0;
        this.height = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isActive = true;
        
        this.AIid = 0;
    }
    update(){
          
    }
    draw(context){
       
    }

}

class Attack extends Ability{
    constructor(game,sender){
        super(game,sender)
        this.y = this.sender.y + this.sender.height/2;
        this.power = 0;
        
    }
}

export class Punch extends Attack{
    static ENERGY_COST = 50;
    static DELAY = 450;
    static DURATION = 200;

    constructor(game,sender){
        super(game,sender);       
        this.power = 5;
        this.x = this.sender.x + this.sender.width*this.sender.direction;
        this.width = this.sender.width/2;
        this.height = this.sender.height;
        this.speed = 0;
             
    }
    update(){
        if(this.sender.direction===1) this.offsetX=0;
        else this.offsetX = this.width;
        this.x = this.sender.x + this.sender.width*this.sender.direction + this.offsetX;
        this.y = this.sender.y;
    }
    draw(context){
        if(this.game.debug) context.strokeRect(this.x,this.y,this.width,this.height);
    }
}

export class Projectile extends Attack{
    static ENERGY_COST = 150;
    static DELAY = 600;
    static DURATION = 0;

    constructor(game,sender){
        super(game,sender);       
        this.power = 8;
        this.x = this.sender.x + this.sender.width/2 + (this.sender.width/2)*this.sender.direction;
        this.width = 26; 
        this.height = 18; 
        this.speed = 3 * this.sender.direction;
        this.image = sender.imageProjectile;  
        this.offsetY = -15;

        this.y += this.offsetY;
    }
    update(){
        this.x += this.speed;
        if (this.x > this.game.width || this.x <= 0) this.isActive = false;      
    }
    draw(context){
        if(this.game.debug) context.strokeRect(this.x,this.y,this.width,this.height);
        context.drawImage(this.image, this.x, this.y,this.width,this.height);
    }
}

export class Shield extends Ability{
    static ENERGY_COST = 1;
    static DELAY = 10;
    static DURATION = 300;

    constructor(game,sender){
        super(game,sender);       
        //this.energyCost = 1; // per frame?
        this.width = sender.width;
        this.height = sender.height; 
        this.isActive = false;
        this.color = 'blue';
    }
    update(){
        this.x = this.sender.x;
        this.y = this.sender.y;
        if(this.isActive){

        }
        
    }
    draw(context){
        if(this.isActive){    
        context.save();
        context.beginPath();
        context.arc(this.x + this.width/2, this.y + this.height/2, this.height/2, 0, Math.PI * 2);
        context.strokeStyle = this.color;
        context.lineWidth = 3; 
        context.stroke(); 
        context.restore();
    }
    }
}