var AMOUNT_DIAMONDS = 25;
GamePlayManager = {
    init: function(){
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        this.flagFirstMouseDown = false;
        this.amountDiamondsCaught = 0;
        this.endGame = false;
    },
    preload: function(){
        game.load.image('background', '/assets/images/background.png');
        game.load.spritesheet('horse', '/assets/images/horse.png', 84, 156, 2);
        game.load.spritesheet('diamonds', '/assets/images/diamonds.png', 81, 84, 4);
        game.load.spritesheet('explosion', '/assets/images/explosion.png',);
        game.load.spritesheet('shark', '/assets/images/shark.png',);
    },
    create: function(){
        game.add.sprite(0, 0, 'background');
        this.shark = game.add.sprite(500, 20, 'shark');
        this.horse = game.add.sprite(0, 0, 'horse');
        this.horse.frame = 0;
        //ubicar al centro de la pantalla
        this.horse.x = game.width/2;
        this.horse.y = game.height/2;
        //lo ubica en el 0.5 osea el centro correspondiente a la prooiedad ancor
        this.horse.anchor.setTo(0.5);
        //para rotar el sprite con angle con grados/ agregar en update para que funcione
        //this.horse.angle = 0;
        //aumenta el escalado, con cordenada x e y o sin ellas
        //this.horse.scale.setTo(1, 2);
        //opacidad del sprite 0, 0,5 , 1
        //this.horse.alpha = 0.5;
        game.input.onDown.add(this.onTap, this);

        this.diamonds = [];
        for(var i=0; i<AMOUNT_DIAMONDS; i++){
            var diamond = game.add.sprite(100,100,'diamonds');
            diamond.frame = game.rnd.integerInRange(0,3);
            diamond.scale.setTo(0.30 + game.rnd.frac());
            diamond.anchor.setTo(0.5);
            diamond.x = game.rnd.integerInRange(50, 1050);
            diamond.y = game.rnd.integerInRange(50, 600);

            this.diamonds[i] = diamond;

            var rectCurrenDiamond = this.getBoundsDiamonds(diamond);
            var rectHorse = this.getBoundsDiamonds(this.horse);

            while(this.isOverlapingOtherDiamond(i, rectCurrenDiamond) || this.isOverlapingOtherDiamond(rectHorse, rectCurrenDiamond)){
                diamond.x = game.rnd.integerInRange(50, 1050);
                diamond.y = game.rnd.integerInRange(50, 600);
                rectCurrenDiamond = this.getBoundsDiamonds(diamond);
            }
        }

        this.explosionGroup = game.add.group();

        for(var i=0; i<10; i++){
            this.explosion = this.explosionGroup.create(100,100,'explosion')
            this.explosion.tweenScale = game.add.tween(this.explosion.scale).to({
                    x: [0.4, 0.8, 0.4],
                    y: [0.4, 0.8, 0.4]
            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

            this.explosion.tweenAlpha = game.add.tween(this.explosion).to({
                    alpha: [1, 0.6, 0]
            }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

            this.explosion.anchor.setTo(0.5);
            this.explosion.kill();
        }
        
        this.currentScore = 0;
        var style ={
            font: 'bold 30pt Arial',
            fill: '#FFFFFF',
            align: 'center'
        }

        this.scoreText = game.add.text(game.width/2, 40, '0', style);
        this.scoreText.anchor.setTo(0.5);


        this.totalTime = 15;
        this.timerText = game.add.text(1000, 40, this.totalTime+'', style);
        this.timerText.anchor.setTo(0.5);

        this.timerGameOver = game.time.events.loop(Phaser.Timer.SECOND, function(){
            if(this.flagFirstMouseDown){
                this.totalTime--;
                this.timerText.text = this.totalTime+'';
                if(this.totalTime<=0){
                    game.time.events.remove(this.timerGameOver);
                    this.endGame = true;
                    this.showFinalMessage('GAME OVER');
                }
            }
        }, this);

        
    
    },
    increaseScore: function(){
        this.currentScore += 100;
        this.scoreText.text = this.currentScore;

        this.amountDiamondsCaught += 1;
        if(this.amountDiamondsCaught >= AMOUNT_DIAMONDS){
            game.time.events.remove(this.timerGameOver);
            this.endGame = true;
            this.showFinalMessage('CONGRATULATIONS :)');
        }
    },
    showFinalMessage: function(msg){
        var bgAlpha = game.add.bitmapData(game.width, game.height);
        bgAlpha.ctx.fillStyle = '#000000';
        bgAlpha.ctx.fillRect(0,0,game.width,game.height);

        var bg = game.add.sprite(0,0,bgAlpha);
        bg.alpha = 0.5;

        var style = {
            font: 'bold 60pt Arial',
            fill: '#FFFFFF',
            align: 'center'
        }

        this.textFieldFinalMsg = game.add.text(game.width/2, game.height/2, msg, style);
        this.textFieldFinalMsg.anchor.setTo(0.5);

    },
    onTap: function(){
        this.flagFirstMouseDown = true;
    },
    getBoundsDiamonds: function(currentDiamond){
        return new Phaser.Rectangle(currentDiamond.left, currentDiamond.top, currentDiamond.width, currentDiamond.height);
    },
    isRectanglesOverlapping: function(rect1, rect2){
        if(rect1.x> rect2.x+rect2.width || rect2.x> rect1.x+rect1.width){
            return false;
        }
        if(rect1.y> rect2.y+rect2.height || rect2.y> rect1.y+rect1.height){
            return false;
        }
        return true;
    },
    isOverlapingOtherDiamond: function(index, rect2){
        for(var i=0; i<index; i++){
            var rect1 = this.getBoundsDiamonds(this.diamonds[i]);
            if(this.isRectanglesOverlapping(rect1, rect2)){
                return true;
            }
        }
        return false;
    },
    getBoundsHorse: function(){
        var x0 = this.horse.x - Math.abs(this.horse.width)/4;
        var width = Math.abs(this.horse.width)/2;
        var y0 = this.horse.y - this.horse.height/2;
        var height = this.horse.height;

        return new Phaser.Rectangle(x0,y0,width,height);
    },
    update: function(){
        //this.horse.angle +=1;
        if(this.flagFirstMouseDown && !this.endGame){

            this.shark.x --;
            if(this.shark.x<-300){
                this.shark.x = 1300;
            }
            var pointerX = game.input.x;
            var pointerY = game.input.y;

            var distanciaX = pointerX - this.horse.x;
            var distanciaY = pointerY - this.horse.y;

            if(distanciaX > 0){
            this.horse.scale.setTo(1, 1);
            }else{
            this.horse.scale.setTo(-1, 1);
            }

            this.horse.x += distanciaX * 0.02;
            this.horse.y += distanciaY * 0.02;

            for(var i=0; i<AMOUNT_DIAMONDS; i++){
                var rectHorse = this.getBoundsHorse();
                var rectDiamond = 
                this.getBoundsDiamonds(this.diamonds[i]);
                if(this.diamonds[i].visible && this.isRectanglesOverlapping(rectHorse, rectDiamond)){
                    this.increaseScore();
                    this.diamonds[i].visible = false;
                    
                    var explosion = this.explosionGroup.getFirstDead();
                    if(explosion != null){
                        explosion.reset(this.diamonds[i].x, this.diamonds[i].y);
                        explosion.tweenScale.start();
                        explosion.tweenAlpha.start();

                        explosion.tweenAlpha.onComplete.add(function(currentTarget, currentTween){
                            currentTarget.kill();
                        }, this);
                    }
                    
                }
            }
        }
        //console.log('x: ' +pointerX);
        //console.log('y: ' +pointerY);
    }
}

//Instancia de juego
var game = new Phaser.Game(1136, 640, Phaser.AUTO);

//estado de la instancia
game.state.add("gameplay", GamePlayManager);
game.state.start("gameplay");
