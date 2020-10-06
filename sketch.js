let canvas;

let scoreDisplay;
let bestScoreDisplay;
let generationDisplay;

function setup() {
    // Make and style UI
    setUpElements();

    // Create and initialise game;
    Game.runGame();
}

function draw() {
    // Run the game logic loop
    Game.gameLoop(scoreDisplay, bestScoreDisplay, generationDisplay);
}

function setUpElements() {
    // Create canvas and align
    canvas = createCanvas(900, 300);
    canvas.parent("game");
    canvas.style("display", "block");
    canvas.style("margin", "auto");

    // Create score display and format font
    scoreDisplay = createP("Score: ");
    scoreDisplay.parent("game");
    scoreDisplay.style("font-family", "arial");
    scoreDisplay.style("font-size", "2em");
    scoreDisplay.style("margin", "10px 100px");

    // Create generation number display and format font
    bestScoreDisplay = createP("Generation: ");
    bestScoreDisplay.parent("game");
    bestScoreDisplay.style("font-family", "arial");
    bestScoreDisplay.style("font-size", "2em");
    bestScoreDisplay.style("margin", "10px 100px");

    // Create best score display and format font
    generationDisplay = createP("Best Score: ");
    generationDisplay.parent("game");
    generationDisplay.style("font-family", "arial");
    generationDisplay.style("font-size", "2em");
    generationDisplay.style("margin", "10px 100px");

    // Set background to black
    background("0");
}

function keyPressed() {
    // Show num of tensors
    if (key == "t") {
        console.info("Tensors: " + tf.memory().numTensors);
    }
    if (key == "s") {
        console.info("Saving best attempt!");
        Game.saveBest();
    }
    if (key == "l") {
        console.info("Loading saved model!");
        Game.loadModel();
    }
}
