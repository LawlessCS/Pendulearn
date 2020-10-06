class Game {
    static runGame() {
        // Clear canvas
        this.drawBackground();
        // Create player instance
        this.populationSize = 50;
        this.generationNumber = 0;
        this.population = this.newPopulation(this.populationSize);
        this.best = {
            score: 0,
            brain: 0,
        };
        this.currentScore = 0;
	this.STEPS = 5;
    }

    static fillPopulation(model) {
        let newPop = [];

        for (let i = 0; i < this.populationSize; i++) {
            newPop.push(this.newPlayer());
        }
    }

    static newPopulation(a) {
        this.generationNumber++;
        let population = [];

        // If given number for new popSize
        if (Number.isInteger(a)) {
            for (let i = 0; i < a; i++) {
                population.push(this.newPlayer());
            }

            // If given old population to generate new one from
        } else if (a instanceof Array) {
            // Create array to store fitnesses of all players
            let allFitnesses = [];

            for (let j = 0; j < a.length; j++) {
                // Add fitness of each player to array
                allFitnesses.push(a[j].getFitness());
            }

            // Get best player from generation to use as parent
            let bestFitness = Math.max(...allFitnesses);
            let bestIndex = allFitnesses.indexOf(bestFitness);
            let bestPlayer = a[bestIndex].copyBrain();

            population.push(this.newPlayer(bestPlayer));

            // Save best player's brain and score
            let bestScore = Math.sqrt(bestFitness);
            if (bestScore > this.best.score) {
                if (this.best.brain != 0) {
                    this.best.brain.dispose();
                }
                this.best.brain = bestPlayer.copy();
                this.best.score = bestScore;
            }

            // Get total fitness of all players
            let totalFitness = allFitnesses.reduce((a, b) => a + b, 0);

            for (let i = 1; i < a.length; i++) {
                // Pick random number up to total fitness
                let randomFitnessA = floor(random(totalFitness));
                let randomFitnessB = floor(random(totalFitness));

                // Correspond random numbers to player
                let index = 0;
                let runningFitness = allFitnesses[index];

                while (randomFitnessA > runningFitness) {
                    index++;
                    runningFitness += allFitnesses[index];
                }

                index = 0;
                runningFitness = allFitnesses[index];

                let parentBrainA = a[index].copyBrain();

                while (randomFitnessB > runningFitness) {
                    index++;
                    runningFitness += allFitnesses[index];
                }

                let parentBrainB = a[index].copyBrain();

                let childBrain = parentBrainA.breed(parentBrainB);

                // Mutate child brain
                childBrain.mutate(0.02);

                // Add child to new population
                population.push(this.newPlayer(childBrain));

                // Tidy up loose tensors
                parentBrainA.dispose();
                parentBrainB.dispose();
                childBrain.dispose();
            }

            bestPlayer.dispose();
        }

        return population;
    }

    static drawBackground() {
        // Set parameters for where to draw various background elements
        let skyHeight = height * 0.7;
        let grassHeight = height * 0.05;
        let dirtHeight = height * 0.25;

        // Style drawing tools and draw rect from center
        noStroke();
        rectMode(CORNER);

        // Draw sky
        fill("#00b7eb");
        rect(0, 0, width, skyHeight);

        // Draw grass
        fill("#7ec850");
        rect(0, skyHeight, width, grassHeight);

        // Draw ground
        fill("#8b4513");
        rect(0, skyHeight + grassHeight, width, dirtHeight);
    }

    static gameLoop(scoreDisplay, bestScoreDisplay, generationDisplay) {
        // Clear canvas by drawing background
        this.drawBackground();

        for (let a = 0; a < this.STEPS; a++) {
            let deadCount = 0;

            for (let player of this.population) {
                // Get current state of player
                let playerState = player.getState();

                // If player is alive
                if (playerState == "ALIVE") {
                    // Update player data
                    player.update();

                    if (player.getScore() > this.currentScore) {
                        scoreDisplay.html("Score: " + player.getScore());
                        this.currentScore = player.getScore();
                    }

                    // If player is dead
                } else if (playerState == "DEAD") {
                    deadCount++;
                } else {
                    console.error("UNRECOGNISED PLAYER STATE - " + playerState);
                    debugger;
                }

                if (deadCount == this.population.length) {
                    let newPop = this.newPopulation(this.population);

                    for (let p of this.population) {
                        p.disposeBrain();
                    }

                    this.currentScore = 0;
                    this.population = newPop;
                }
            }
        }

        this.drawPlayers();
        bestScoreDisplay.html("Best score: " + this.best.score);
        generationDisplay.html("Generation: " + this.generationNumber);
    }

    static drawPlayers() {
        // Draw players to screen
        for (let player of this.population) {
            if (player.getState() == "ALIVE") {
                player.draw();
            }
        }
    }

    static newPlayer(brain) {
        // If brain specified, create player based on that
        if (brain) {
            return new Player(width / 2, height * 0.675, brain);
        } else {
            // Create new player specifying x and y pos
            return new Player(width / 2, height * 0.675);
        }
    }

    static async saveBest() {
        await this.best.brain.model.save(
            "downloads://best_after_" + this.generationNumber + "_gens1"
        );
    }
}
