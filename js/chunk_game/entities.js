export class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.markedForDeletion = false;
    }
    update(dt) { }
    draw(ctx) { }
}

export class Drop extends Entity {
    constructor(x, content, type) {
        super(x, -50); // Start above screen
        this.content = content; // Text or Emoji
        this.type = type; // 'image' or 'text'
        this.vy = 2; // Vertical Speed (Pixels per frame roughly)
        this.radius = 30;
        this.color = this.getRandomColor();
        this.scale = 1;
    }

    getRandomColor() {
        // Just for prototype: Random nice colors
        const colors = ['#FF5252', '#448AFF', '#69F0AE', '#FFD740'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(dt) {
        this.y += this.vy; // Simple gravity/falling

        // Remove if off screen
        if (this.y > window.innerHeight + 50) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Cute Cloud/Bubble Shape
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white'; // White cloud base
        ctx.fill();

        // Inner tint based on grammar color
        ctx.beginPath();
        ctx.arc(0, 0, this.radius - 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.2; // Soft tint
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Border
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Shine/Reflection
        ctx.beginPath();
        ctx.arc(-10, -10, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();

        // Content (Emoji)
        ctx.font = '36px Arial'; // Larger emoji
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'black';
        ctx.fillText(this.content, 0, 2); // Slight offset

        ctx.restore();
    }
}

export class Particle extends Entity {
    constructor(x, y, color) {
        super(x, y);
        this.color = color;
        // Random velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.life = 1.0; // 100% opacity start
        this.decay = Math.random() * 0.03 + 0.02; // How fast it fades
        this.radius = Math.random() * 4 + 2;
    }

    update(dt) {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;

        if (this.life <= 0) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
