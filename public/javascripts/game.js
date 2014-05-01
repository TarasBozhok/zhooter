
var canvasW = 1000,
    canvasH = 700,
    enemyMaxSpeed = 6,
    enemyMinSpeed = 2;

var sfx = {
    sound1: "sfx/sound.wav"
};

var sound = new Audio(sfx.sound1);

var avatars = {
    plane: 'images/plane.png',
    enemy: 'images/game_sprite.png',
    background: 'images/night-sky.jpg',
    intro: 'images/title.png',
    win: 'images/win.jpg'
};

var keys = {};


function Game(ctx) {
    var that = this,
        INTERVAL = 50;

    this.currentState = null;
    this.introState = null;
    this.gamePlayState = null;
    new GamePlayState(ctx);

    this.init = function() {
        setInterval(that.render, INTERVAL);
        this.reset();
    };

    this.reset = function() {
        ctx.fillRect(0, 0, canvasW, canvasH);
        that.introState = new IntroState(ctx, that);
        that.currentState = that.introState;
        that.gameEndState = null;
        that.introState.timeout = 0;
        setTimeout(that.introState.fireTimeout, 500);
    };

    this.render = function() {
        that.currentState.update();
        that.currentState.draw();
    };

    this.startGame = function() {
        that.gamePlayState = new GamePlayState(ctx, that);
        that.currentState = that.gamePlayState;
        that.introState = null;
        keys = {};
    };

    this.endGame = function() {
        that.gameEndState = new GameEndState(ctx, that);
        that.currentState = that.gameEndState;
        that.gamePlayState = null;
        setTimeout(that.gameEndState.fireTimeout, 1500);
    };

};


function IntroState(ctx, game) {
    var that = this;
    this.game = game;
    this.image = new Image();
    this.image.src = avatars.intro;
    this.timeout = 0;


    this.draw = function() {
        ctx.drawImage(this.image, 0, 0, canvasW, canvasH);
    };

    this.fireTimeout = function() {
        that.timeout = 1;
    };

    this.update = function() {
        if (Object.keys(keys).length && this.timeout) {
            that.game.startGame();
        }
    }
}


function GamePlayState(ctx, game) {
    this.game = game;

    var that = this,
        LEFT = 37,
        RIGHT = 39,
        UP = 38,
        DOWN = 40,
        FIRE = 32,
        avatarBullets = [],
        enemyBullets = [],
        enemies = [];

    var avatar = new Avatar(ctx);
    var enemy = new Enemy(ctx);
    var enemy2 = new Enemy(ctx);
    var enemy3 = new Enemy(ctx);
    var bg = new Background(ctx);
    var score = new Score(ctx);
    enemy2.x -= 80;
    enemy3.x -= 160;
    enemies.push(enemy, enemy2, enemy3);

    this.draw = function() {
        ctx.clearRect(0, 0, canvasW, canvasH);
        that.render();

        bg.draw();
        avatar.draw();
        enemy.draw();
        enemy2.draw();
        enemy3.draw();
        score.draw();
        for (var i=0; i<avatarBullets.length; i++) {
            if (avatarBullets[i] && avatarBullets[i].life < 30) {
                avatarBullets[i].life++;
                avatarBullets[i].draw(avatar.y);
            } else {
                delete avatarBullets[i];
            }
        }
    };

    this.update = function() {

        if (score.score >= 10) {
            this.game.endGame();
        }

        if (keys[UP]) {
            avatar.y -= 5;
        }
        if (keys[DOWN]) {
            avatar.y +=5;
        }
        if (keys[FIRE]) {
            this.fireBullet();
        }
        if (avatar.x >= canvasW) {
            avatar.x = 0;
        }
        if (avatar.y >= canvasH || avatar.y < 0) {
            avatar.y = 0;
        }
        for (var i=0; i<enemies.length; i++) {
            if (enemies[i].x >= canvasW) enemies[i].x = 0;
            if (enemies[i].y >= canvasH-50) enemies[i].enemyDirection = -1;
            if (enemies[i].y <= 0) enemies[i].enemyDirection = 1;

            enemies[i].y += enemies[i].speed * enemies[i].enemyDirection;
        }

    };

    this.render = function() {
        for (var i=0; i<avatarBullets.length; i++) {
            for (var j=0; j<enemies.length; j++) {
                if (avatarBullets[i] && avatarBullets[i].y>enemies[j].y-45 && avatarBullets[i].y<enemies[j].y+5 && avatarBullets[i].x>enemies[j].x-45 && avatarBullets[i].x<enemies[j].x) {
                    score.score++;
                    delete avatarBullets[i];
                }
            }
        }
        for (var k=0; k<enemies.length; k++) {
            if (enemies[k].bullet.y>avatar.y && enemies[k].bullet.y<avatar.y+50 && enemies[k].bullet.x < 100) {
                enemies[k].bullet.lifeTime = 0;
                score.score -= 5;
            }
        }
    };

    this.fireBullet = function() {
        avatarBullets.push(new AvatarBullet(ctx, avatar.y));
        sound.currentTime = 0;
        sound.play();
    };
}

function GameEndState(ctx, game) {
    var that = this;
    this.game = game;
    this.image = new Image();
    this.image.src = avatars.win;
    this.timeout = 0;

    this.fireTimeout = function() {
        that.timeout = 1;
    };

    this.update = function() {
        if (this.timeout) {
            this.game.reset();
        }
    };
    this.draw = function() {
        ctx.drawImage(this.image, 0, 0, canvasW, canvasH);
    };

}

function Avatar(ctx) {
    var that = this;

    this.x = 0;
    this.y = 0;

    this.image = new Image();
    this.image.src = avatars.plane;

    this.image.addEventListener('load', function() {
        that.image.loaded = true;
    });

    this.draw = function() {
        ctx.drawImage(this.image, this.x, this.y);
    };

}

function Background(ctx) {
    this.image = new Image();
    this.image.src = avatars.background;
    this.frameW = 20;
    this.currentFrame = 0;

    this.draw = function() {
        ctx.drawImage(this.image, this.frameW*this.getCurrentFrame(), 0, canvasW, canvasH, 0, 0, canvasW, canvasH);
    };

    this.getCurrentFrame = function() {
        if (this.frameW*this.currentFrame > this.image.width-canvasW) {
            this.currentFrame = 0;
        }
        return this.currentFrame++;
    };
}

function Enemy(ctx) {
    this.image = new Image();
    this.image.src = avatars.enemy;
    this.currentFrame = 0;
    this.frameW = 27;
    this.frameH = 35;
    this.speed = Math.floor(Math.random() * (enemyMaxSpeed - enemyMinSpeed + 1)) + enemyMinSpeed;
    this.x = canvasW - 100;
    this.enemyDirection = Math.floor(Math.random()*2) ? -1 : 1;                                                           //random enemy direction
    this.y = Math.floor(Math.random() * (canvasH - 10 + 1)) + 10;
    this.bullet = new EnemyBullet(ctx, this);

    this.draw = function() {
        ctx.drawImage(this.image, this.frameW*this.getCurrentFrame(), 0, this.frameW, this.frameH, this.x, this.y, 35, 40);
        this.bullet.render();
    };

    this.getCurrentFrame = function() {
        if (this.currentFrame == 5) {
            this.currentFrame = 0;
        }
        return this.currentFrame++;
    };
}

function AvatarBullet(ctx, avatarPos) {
    this.x = 80;
    this.life = 0;
    this.y = avatarPos;

    this.draw = function() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.getCurrentPos(), this.y+45, 20, 3);
    };

    this.getCurrentPos = function() {
        return this.x += 30;
    }
}

function EnemyBullet(ctx, enemy) {
    this.enemy = enemy;
    this.x = canvasW - 100;
    this.lifeTime = 50;
    this.y = this.enemy.y;

    this.draw = function() {
        ctx.fillStyle = 'silver';
        ctx.fillRect(this.x, this.y+20, 15, 3);
    };

    this.render = function() {
        this.lifeTime--;
        if (this.lifeTime <= 0) {
            this.lifeTime = 50;
            this.x = this.enemy.x;
            this.y = this.enemy.y;
        }
        this.x -= 20;
        this.draw();
    };
}

function Score(ctx) {
    this.score = 0;

    this.draw = function() {
        ctx.save();
        ctx.font = "italic 25pt Arial";
        ctx.fillStyle = 'black';
        ctx.fillText("Score: "+ this.score, 220, 50);
        ctx.restore();
    }
}

document.onkeydown = function(evt) {
    keys[evt.keyCode] = true;
    return false;
};

document.onkeyup = function(evt) {
    delete keys[evt.keyCode];
    return false;
};

window.onload = function() {
    var canvas = document.getElementById('canvas');

    var game = new Game(canvas.getContext('2d'));
    game.init();
};

