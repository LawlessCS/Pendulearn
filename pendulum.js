class Pendulum {
    constructor(xOff, yOff) {
        // X and Y offsets from player position
        this.xOff = xOff;
        this.yOff = yOff;

        // Length of "stalk" of pendulum
        this.length = 75;
        // Angle the "stalk" sticks up from
        // 0 = straight up
        this.angle = random() < 0.5 ? random(-20, -5) : random(5, 20);

        // Size of ball at end
        this.size = 24;

        this.fallSpeed = 0;
    }

    draw(playerX, playerY) {
        // Get start point of pendulum
        // from player position and offsets
        let startX = playerX + this.xOff;
        let startY = playerY + this.yOff;

        // Set angle mode to degrees for ease of use
        angleMode(DEGREES);
        // Convert from polar to cartesian coordinates
        let endX = startX + this.length * cos(this.angle - 90);
        let endY = startY + this.length * sin(this.angle - 90);

        // Draw pendulum "stalk"
        noFill();
        strokeWeight(6);
        stroke(0, 50);
        line(startX, startY, endX, endY);

        // Draw pendulum ball
        noStroke();
        fill(0, 50);
        ellipse(endX, endY, this.size, this.size);
    }

    updatePosition() {
        // Add fallSpeed to angle to adjust pitch of pendulum
        this.angle += this.fallSpeed;
    }

    gravity() {
        // Gravity stronger the further out pendulum sticks
        let gravity = Math.pow(this.angle / 750, 1);

        this.addForce(gravity);
    }

    addForce(d) {
        // Increase falling speed if not at arbitrary max
        if (abs(this.fallSpeed + d) < 8) {
            this.fallSpeed += d;
        }
    }

    isDead() {
        // Pendulum is dead when it's angle > 90 either way
        return abs(this.angle) >= 90;
    }
}
