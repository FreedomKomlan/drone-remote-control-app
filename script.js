const canvas = document.getElementById("ui");
const ctx = canvas.getContext("2d");

let width, height;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* ==== Joystick class ==== */
class Joystick {
    constructor(x, y, radius, id) {
        this.baseX = x;
        this.baseY = y;
        this.radius = radius;
        this.handleX = x;
        this.handleY = y;
        this.touchId = null;
        this.id = id;
        this.value = { x: 0, y: 0 };
    }

    draw() {
        // Base
        ctx.beginPath();
        ctx.arc(this.baseX, this.baseY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fill();

        // Handle
        ctx.beginPath();
        ctx.arc(this.handleX, this.handleY, this.radius / 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fill();
    }

    update(x, y) {
        const dx = x - this.baseX;
        const dy = y - this.baseY;
        const dist = Math.min(Math.hypot(dx, dy), this.radius);

        const angle = Math.atan2(dy, dx);
        this.handleX = this.baseX + Math.cos(angle) * dist;
        this.handleY = this.baseY + Math.sin(angle) * dist;

        this.value.x = +(dist * Math.cos(angle) / this.radius).toFixed(2);
        this.value.y = +(dist * Math.sin(angle) / this.radius).toFixed(2);
    }

    reset() {
        this.handleX = this.baseX;
        this.handleY = this.baseY;
        this.value = { x: 0, y: 0 };
    }
}

/* ==== Create joysticks ==== */
const leftJoy = new Joystick(width * 0.25, height * 0.65, 90, "left");
const rightJoy = new Joystick(width * 0.75, height * 0.65, 90, "right");

/* ==== Touch handling ==== */
canvas.addEventListener("touchstart", e => {
    for (const t of e.changedTouches) {
        if (distance(t.clientX, t.clientY, leftJoy.baseX, leftJoy.baseY) < leftJoy.radius)
            leftJoy.touchId = t.identifier;

        if (distance(t.clientX, t.clientY, rightJoy.baseX, rightJoy.baseY) < rightJoy.radius)
            rightJoy.touchId = t.identifier;
    }
});

canvas.addEventListener("touchmove", e => {
    for (const t of e.changedTouches) {
        if (t.identifier === leftJoy.touchId)
            leftJoy.update(t.clientX, t.clientY);

        if (t.identifier === rightJoy.touchId)
            rightJoy.update(t.clientX, t.clientY);
    }
});

canvas.addEventListener("touchend", e => {
    for (const t of e.changedTouches) {
        if (t.identifier === leftJoy.touchId) {
            leftJoy.touchId = null;
            leftJoy.reset();
        }
        if (t.identifier === rightJoy.touchId) {
            rightJoy.touchId = null;
            rightJoy.reset();
        }
    }
});

/* ==== Draw loop ==== */
function draw() {
    ctx.clearRect(0, 0, width, height);

    leftJoy.draw();
    rightJoy.draw();

    // Debug values
    ctx.fillStyle = "#fff";
    ctx.fillText(`Throttle/Yaw: ${JSON.stringify(leftJoy.value)}`, 20, 30);
    ctx.fillText(`Pitch/Roll: ${JSON.stringify(rightJoy.value)}`, 20, 50);

    requestAnimationFrame(draw);
}
draw();

/* ==== Utils ==== */
function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}