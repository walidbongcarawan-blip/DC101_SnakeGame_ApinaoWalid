const canvas = document.getElementById("gameBoard");
const ctx = canvas.getContext("2d");

const box = 16;
let snake, food, direction, score, speed = 160, game;
let paused = false, gameStarted = false;

const eatSound = document.getElementById("eatSound");
const gameOverSound = document.getElementById("gameOverSound");
const bgMusic = document.getElementById("bgMusic");

let masterVolume = 0.5, audioUnlocked = false;

// AUDIO
function unlockAudio() {
    if (audioUnlocked) return;
    eatSound.volume = gameOverSound.volume = bgMusic.volume = masterVolume;
    eatSound.play().then(()=>eatSound.pause());
    gameOverSound.play().then(()=>gameOverSound.pause());
    bgMusic.play().then(()=>bgMusic.pause());
    document.getElementById("soundScreen").style.display = "none";
    audioUnlocked = true;
}

function toggleMusic() {
    if (!audioUnlocked) return;
    bgMusic.paused ? bgMusic.play() : bgMusic.pause();
}

function setVolume(v) {
    masterVolume = v / 100;
    eatSound.volume = gameOverSound.volume = bgMusic.volume = masterVolume;
}

// SETTINGS
function openSettings() {
    document.getElementById("settingsMenu").style.display = "flex";
}
function closeSettings() {
    document.getElementById("settingsMenu").style.display = "none";
}
function setSpeed(v) {
    speed = v;
    if (gameStarted) {
        clearInterval(game);
        game = setInterval(draw, speed);
    }
}

// START / RESTART
function startGame() {
    document.getElementById("startMenu").style.display = "none";
    gameStarted = true;
    initGame();
}
function restartFromGameOver() {
    document.getElementById("gameOverScreen").style.display = "none";
    gameStarted = true;
    initGame();
}

// THEMES
const themes = ["theme-dark","theme-neon","theme-light"];
let themeIndex = 0;
function changeTheme() {
    document.body.className = themes[++themeIndex % themes.length];
}

// SKINS
const skins = {
    classic:"#00f260", neon:"#00ffff", purple:"#b026ff", fire:"#ff6a00"
};
let currentSkin = skins.classic;
function changeSkin() {
    currentSkin = skins[document.getElementById("skinSelector").value];
}

// SCORE
let highScore = localStorage.getItem("highScore") || 0;
const highScoreEl = document.getElementById("highScore");
highScoreEl.textContent = "High Score: " + highScore;

function updateScore() {
    document.getElementById("score").textContent = "Score: " + score;
}

// CONTROLS
document.addEventListener("keydown", e => {
    if (!gameStarted) return;
    if (e.key.includes("Arrow")) direction = e.key.replace("Arrow","").toUpperCase();
    if (e.key === " ") paused = !paused;
});

// INIT
function initGame() {
    snake = [{x:10*box,y:10*box}];
    food = randomFood();
    direction = "RIGHT";
    score = 0;
    paused = false;
    updateScore();
    clearInterval(game);
    game = setInterval(draw, speed);
}

function randomFood() {
    return { x:Math.floor(Math.random()*20)*box,
             y:Math.floor(Math.random()*20)*box };
}

// GAME LOOP
function draw() {
    if (paused) return;

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    snake.forEach((p,i)=>{
        ctx.fillStyle=currentSkin;
        ctx.globalAlpha=1-i*0.03;
        ctx.fillRect(p.x,p.y,box,box);
    });
    ctx.globalAlpha=1;

    ctx.fillStyle="red";
    ctx.fillRect(food.x,food.y,box,box);

    let head={...snake[0]};
    if(direction==="LEFT")head.x-=box;
    if(direction==="RIGHT")head.x+=box;
    if(direction==="UP")head.y-=box;
    if(direction==="DOWN")head.y+=box;

    head.x=(head.x+canvas.width)%canvas.width;
    head.y=(head.y+canvas.height)%canvas.height;

    if(head.x===food.x && head.y===food.y){
        eatSound.play();
        score++;
        updateScore();
        food=randomFood();
    } else snake.pop();

    if(snake.some(p=>p.x===head.x&&p.y===head.y)){
        gameOver();
        return;
    }
    snake.unshift(head);
}

function gameOver() {
    gameOverSound.play();
    clearInterval(game);
    document.getElementById("finalScore").textContent = "Score: " + score;

    if(score > highScore){
        highScore = score;
        localStorage.setItem("highScore", highScore);
        highScoreEl.textContent = "High Score: " + highScore;
        highScoreEl.style.animation = "pop 0.6s ease";
        setTimeout(()=>highScoreEl.style.animation="",600);
    }

    document.getElementById("gameOverScreen").style.display = "flex";
    gameStarted = false;
}

function restartGame() {
    document.getElementById("startMenu").style.display = "flex";
    gameStarted = false;
}
