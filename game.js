const gamecvs = document.getElementById("mycanvas");
const ctx = gamecvs.getContext("2d");

let frames = 0;
const DEGREE = Math.PI/180;


// LOAD SPRITES
const sprite = new Image();
sprite.src = "img/sprite.png";



// GAME STATE

const state = {
    current: 0,
    getReady: 0,
    game: 1, 
    over: 2,
}


const startBtn = {
    x: 120,
    y: 263,
    w: 83,
    h: 29,
}


// SWITCH SCENES

// For MOUSE CLICK INTERACTIONS
gamecvs.addEventListener("click", function(evt) {
    switch(state.current) {
        case state.getReady:
            state.current = state.game;
            break;
        case state.game:
            bird.flap();
            break;
        case state.over:
            let rect = gamecvs.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;


            if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w
                && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) 
            {
                pipes.reset();
                bird.speedReset();
                score.reset();
                state.current = state.getReady;
            }
            break;
    }
});

// For SPACE key INTERACTIONS
gamecvs.addEventListener("keydown", function(evt) {
    if (evt.key === " ") {
        console.log(evt.key);
        switch(state.current) {
            case state.getReady:
                state.current = state.game;
                break;
            case state.game:
                bird.flap();
                break;
            case state.over:
                pipes.reset();
                bird.speedReset();
                score.reset();
                state.current = state.getReady;
                break;
        }
    }
});



gamecvs.focus();


// BACKGROUND

const bground = {
    sX: 0,
    sY: 0,
    w: 275,
    h: 226,
    x: 0,
    y: gamecvs.height - 226,

    draw: function() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);

    }
}

// FOREGROUNG (ground)

const fground = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: gamecvs.height - 112,
    
    dx: 2,

    draw: function() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },
    
    update: function() {
        if (state.current == state.game) { // move ground only when it is in GAME state
            this.x = (this.x - this.dx) % (this.w/2);
        } 
    }
}

// BIRD

const bird = {
    animation: [
        {sX: 276, sY: 112},
        {sX: 276, sY: 139},
        {sX: 276, sY: 164},
        {sX: 276, sY: 139}
    ],
    x: 50,
    y: 150,
    w: 34,
    h: 26,

    radius: 12,

    frame: 0,

    gravity: 0.25, // can change
    jump: 4.6, // can change
    speed: 0,
    rotation: 0,

    draw: function() {
        let bird = this.animation[this.frame];

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, -this.w/2, -this.h/2, this.w, this.h);


        ctx.restore();
    },

    flap: function() {
        this.speed = - this.jump;
    },

    update: function() {
        this.period = state.current === state.getReady ? 10 : 5;
        this.frame +=  frames % this.period === 0 ? 1 : 0;
        this.frame = this.frame % this.animation.length;

        if (state.current == state.getReady) {
            this.y = 150; // Reset position
            this.rotation = 0 * DEGREE;
        } else {
            this.speed += this.gravity;
            this.y += this.speed;

            if (this.y + this.h/2 >= gamecvs.height - fground.h) { // ground collision detection
                this.y = gamecvs.height - fground.h - this.h/2;

                if (state.current === state.game) {
                    state.current = state.over;
                }
            }

            // if the speed >= jump, bird is falling down

            if (this.speed >= this.jump) {
                this.rotation = 70 * DEGREE; // might be changed
                this.frame = 1;
            } else {
                this.rotation = -20 * DEGREE; // might be changed
            }
        }
    },

    speedReset: function() {
        this.speed = 0;
    }
}

// GET READY 

const getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: gamecvs.width/2 - 173/2,
    y: 80,

    draw: function() {
        if (state.current === state.getReady) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}

// GAME OVER

const gameOver = {
    sX: 175,
    sY: 228,
    w: 225,
    h: 202,
    x: gamecvs.width/2 - 225/2,
    y: 90,

    draw: function() {
        if (state.current === state.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}


const pipes = {
    position: [],

    top: {
        sX: 553,
        sY: 0,
    },
    bottom: {
        sX: 502,
        sY: 0, 
    },

    w: 53,
    h: 400,
    gap: 85,
    maxYPos: -150,
    dx: 2,

    draw: function() {
        for (let i = 0; i < this.position.length; i++) {
            let pipe = this.position[i];

            let topYPos = pipe.y;
            let bottomYPos = pipe.y + this.h + this.gap;

            // top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, pipe.x, topYPos, this.w, this.h);

            // bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, pipe.x, bottomYPos, this.w, this.h);

        }
    },

    update: function() {
        if (state.current !== state.game) return;

        if (frames % 100 === 0) {
            this.position.push(
                {
                x: gamecvs.width,
                y: this.maxYPos * (Math.random() + 1)
                }
            );
        }

        for (let i = 0; i < this.position.length; i++) {
            let pipe = this.position[i];

            let bottomPipeYPos = pipe.y + this.h + this.gap;

            // COLLISION DETECTION TOP PIPE

            if (bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + this.w &&
                bird.y + bird.radius > pipe.y && bird.y - bird.radius < pipe.y + this.h) {
                    state.current = state.over;
            }


            // BOTTOM PIPE DETECTION

            if (bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + this.w &&
                bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h) {
                    state.current = state.over;
            }


            // MOVE PIPES TO LEFT

            pipe.x -= this.dx;


            if (pipe.x + this.w <= 0) { // pipes go beyond canvas, delete them
                this.position.shift();

                score.value += 1;
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        }
    },

    reset: function() {
        this.position = [];
    }
}



// SCORE

const score = {

    best: parseInt(localStorage.getItem("best")) || 0,
    value: 0,

    draw: function() {
        ctx.fillStyle = "#FFFFFF";
        
        if (state.current === state.game) {
            ctx.lineWidth = 2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, gamecvs.width/2, 50);
        } else if (state.current === state.over) {

            ctx.font = "25px Teko";

            // LATEST SCORE
            
            ctx.fillText(this.value, 225, 186);


            // BEST SCORE

            ctx.fillText(this.best, 225, 228);


        }
    },

    reset: function() {
        this.value = 0;
    }

}


// MAIN GAME SCENE DRAWING


function draw() {

    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, gamecvs.width, gamecvs.height);

    bground.draw();
    pipes.draw();
    fground.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();

}

function update() {
    bird.update();
    fground.update();
    pipes.update();
}

function loop() {

    update();
    draw();
    frames++;

    requestAnimationFrame(loop);

}

loop();