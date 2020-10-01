class Player {
    constructor(x, y, b) {
        // Player position
        this.x = x;
        this.y = y;

        // Store position player began at
        this.startX = x;
        this.startY = y;

        // Player car width and height
        this.w = 100;
        this.h = 30;

        // Set player speed values
        this.speedMultiplier = 0.2;
        this.velocity = 0;
        this.acceleration = 0;
        this.maxAccel = 0.5;

        // Create pendulum to sit atop player car
        this.pendulum = new Pendulum(0, -this.h / 2);

        // Set player's score to 0
        this.score = 0;
        this.fitness = 0;

        if (b) {
            this.brain = new Brain(b);
        } else {
            // Give player tf based "brain"
            this.brain = new Brain(5, [16], 3);
        }

        // Store direction player moved last
        this.lastMove = 0;

        this.state = "ALIVE";
    }

    update() {
        this.controlPlayer();

        // Increase velocity by acceleration and position by velocity
        this.velocity += this.acceleration;
        this.x += this.velocity;

        // Affect pendulum
        this.pendulum.gravity();
        this.pendulum.updatePosition();
    }

    draw() {
        // Draw player car
        noStroke();
        fill(0, 50);
        rectMode(CENTER);
        rect(this.x, this.y, this.w, this.h);
        fill(255, 255);
        ellipse(this.x - 10, this.y, 12, 20);
        ellipse(this.x + 10, this.y, 12, 20);
        fill("#00b3ef");
        ellipse(this.x - 8, this.y - 3, 5, 5);
        ellipse(this.x + 12, this.y - 3, 5, 5);

        // Draw pendulum
        this.pendulum.draw(this.x, this.y);
    }

    getState() {
        // Return if pendulum has toppled
        if (this.state == "ALIVE" && this.pendulum.isDead()) {
            this.state = "DEAD";
        }

        return this.state;
    }

    setState(s) {
        this.state = s;
    }

    move(d) {
        if (this.x + this.w / 2 < width) {
            // Add force in direction specified by "d"
            // -1 for left, 1 for right, 0 for don't move
            this.addForce(d);
            // Add force to pendulum in opposite direction and 30x smaller
            this.pendulum.addForce(-this.velocity / 30);
            // Update last move
            this.lastMove = d;
        } else {
            this.x = width - this.w / 2;
            this.acceleration = 0;
            this.velocity = -1;
        }

        if (this.x - this.w / 2 > 0) {
            // Add force in direction specified by "d"
            // -1 for left, 1 for right, 0 for don't move
            this.addForce(d);
            // Add force to pendulum in opposite direction and 30x smaller
            this.pendulum.addForce(-this.velocity / 30);
            // Update last move
            this.lastMove = d;
        } else {
            this.x = 0 + this.w / 2;
            this.acceleration = 0;
            this.velocity = 1;
        }
    }

    addForce(d) {
        // Slow car if no key pressed ("friction")
        if (d == 0) {
            this.velocity *= 0.85;
        }

        // Reduce speed by multiplier
        let newForce = d * this.speedMultiplier;

        // Only apply acceleration if not at arbitrary limit
        if (Math.abs(this.acceleration) < this.maxAccel) {
            this.acceleration = newForce;
        }
        if (d != 0) {
            this.score += 10;
        }
    }

    getScore() {
        // Return player score for updating UI
        return this.score;
    }

    controlPlayer() {
        // Gather inputs for NN into array
        let xs = [
            this.x / width,
            this.acceleration,
            this.velocity,
            this.pendulum.angle,
            this.pendulum.fallSpeed,
        ];

        // Send inputs to ML to get desired player direction
        let options = this.brain.getMovement([xs]);

        // Get index of "best" direction
        let direction = options.indexOf(Math.max(...options));
        // Subract 1 to align with [-1, 0, 1]
        direction -= 1;

        // Move player according to "best" direction
        this.move(direction);
    }

    addFitness(n) {
        this.fitness += n;
    }

    getFitness() {
        // Add score to fitness
        this.addFitness(this.score);

        // Return fitness^2 to emphasise higher values
        return Math.pow(this.fitness, 2);
    }

    copyBrain() {
        return this.brain.copy();
    }

    disposeBrain() {
        // Free up memory created by tf tensors
        this.brain.dispose();
    }
}
