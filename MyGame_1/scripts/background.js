class Layer {
    constructor(game,width,height,speedModifier,image){
        this.game = game;
        this.width = width;
        this.height = height;
        this.speedModifier = speedModifier;
        this.image = image;
        this.x = 0;
        this.y = 0;
    }
    update(){
    }

    draw(context){
        context.drawImage(this.image,this.x,this.y,this.width,this.height);
        context.drawImage(this.image,this.x+this.width,this.y,this.width,this.height);
    }
}

export class Background {
    constructor(game){
        this.game = game;
        this.width = this.game.width;
        this.height = this.game.height;
        this.layer1image = document.getElementById('layer1');
        this.layer2image = document.getElementById('layer2');
        
        this.layer1= new Layer(this.game,this.width,this.height,0,this.layer1image);
        this.layer2= new Layer(this.game,this.width,this.height,0,this.layer2image);
        
        this.BackgroundLayers = [this.layer1,/*this.layer2*/];
    }
    update(){
        this.BackgroundLayers.forEach(layer=>{
            layer.update();
        })
    }
    draw(context){
        this.BackgroundLayers.forEach(layer=>{
            layer.draw(context);
        })
    }
}