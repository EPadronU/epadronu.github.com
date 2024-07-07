/* ********** Constants ********** */
const MAX_BALLS_QTY = 25;

/* ********** Classes ********** */
class Drawable {
  static degrees360InRadians = 2 * Math.PI;

  constructor(id, x, y, xVelocity, yVelocity, color, size) {
    this.id = id,
      this.x = x;
    this.y = y;
    this.xVelocity = xVelocity;
    this.yVelocity = yVelocity;
    this.color = color;
    this.size = size;
  }

  equalsTo(other) {
    if (!(other instanceof Drawable)) {
      throw new TypeError("An instance of Drawable was expected");
    }

    return this.id === other.id;
  }

  draw(ctx) {
    if (!(ctx instanceof CanvasRenderingContext2D)) {
      throw new TypeError("An instance of CanvasRenderingContext2D was expected");
    }
  }

  update(xLimit, yLimit, drawables) {
    if (typeof xLimit !== "number") {
      throw new TypeError("A number was expected as the `xLimit`");
    }

    if (xLimit < 100) {
      throw new RangeError("A number greater than `100` was expected as the `xLimit`");
    }

    if (typeof yLimit !== "number") {
      throw new TypeError("A number was expected as the `yLimit`");
    }

    if (yLimit < 100) {
      throw new RangeError("A number greater than `100` was expected as the `yLimit`");
    }

    if (!(drawables instanceof Array)) {
      throw new TypeError("An instance of Array was expected as the `drawables`");
    }

    if (!drawables.every(drawable => drawable instanceof Drawable)) {
      throw new TypeError("An Array of instances of Drawable was expected as the `drawables`");
    }
  }
}

class Ball extends Drawable {
  constructor(id, x, y, xVelocity, yVelocity, color, size, exists = true) {
    super(id, x, y, xVelocity, yVelocity, color, size);

    this.exists = exists;
  }

  draw(ctx) {
    super.draw(ctx);

    if (!this.exists) {
      return;
    }

    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, Drawable.degrees360InRadians);
    ctx.fill();
  }

  update(xLimit, yLimit, drawables) {
    super.update(xLimit, yLimit, drawables);

    if (!this.exists) {
      return;
    }

    /* Move the drawable */
    this.x += this.xVelocity;
    this.y += this.yVelocity;

    /* Bounce off of the canvas's boundaries and gain velocity */
    if ((this.x + this.size) >= xLimit) {
      this.x = xLimit - this.size;

      this.xVelocity = -(this.xVelocity + 1);
    }

    if ((this.x - this.size) <= 0) {
      this.x = this.size;

      this.xVelocity = -(this.xVelocity - 1);
    }

    if ((this.y + this.size) >= yLimit) {
      this.y = yLimit - this.size;

      this.yVelocity = -(this.yVelocity + 1);
    }

    if ((this.y - this.size) <= 0) {
      this.y = this.size;

      this.yVelocity = -(this.yVelocity - 1);
    }

    /* Bounce when hitting another drawable objects  */
    for (const drawable of drawables) {
      if (!drawable.equalsTo(this) && drawable.exists && drawable.isOverlappingWith(this)) {
        const massRatio = Math.round(drawable.size / this.size);

        // Take in account mass differences and lost of energy due to collition
        this.xVelocity += drawable.xVelocity * massRatio - Math.sign(this.xVelocity);
        this.yVelocity += drawable.yVelocity * massRatio - Math.sign(this.xVelocity);

        const overlappingSpace = Math.abs(
          Math.hypot(this.x - drawable.x, this.y - drawable.y) - (this.size + drawable.size));

        this.x += -Math.sign(this.xVelocity) * overlappingSpace;
        this.y += -Math.sign(this.yVelocity) * overlappingSpace;

        this.xVelocity = -this.xVelocity
        this.yVelocity = -this.yVelocity

        this.color = randomRGB();
      }
    }

    /* Keep the velocities in the (-7, 7) range */
    this.xVelocity = Math.abs(this.xVelocity) > 7 ? Math.sign(this.xVelocity) * 7 : this.xVelocity;
    this.yVelocity = Math.abs(this.yVelocity) > 7 ? Math.sign(this.yVelocity) * 7 : this.yVelocity;
  }

  isOverlappingWith(other) {
    if (!(other instanceof Drawable)) {
      throw new TypeError("An instance of Drawable was expected");
    }

    return Math.hypot(this.x - other.x, this.y - other.y) < (this.size + other.size);
  }
}

class EvilCircle extends Drawable {
  #mouseEventHandler = event => this.#onMouseMove(event);
  #keydownEventHandler = event => this.#onKeydown(event);
  #keyupEventHandler = event => this.#onKeyup(event);

  constructor(x, y, xVelocity = 10, yVelocity = 10, color = "white", size = 10, teethQuantity = 10, rotationSpeed = 0.1) {
    super(uuidv4(), x, y, 0, 0, color, size);

    this.xReferenceVelocity = xVelocity;
    this.yReferenceVelocity = yVelocity;
    this.teethQuantity = teethQuantity;
    this.rotationSpeed = rotationSpeed;
    this.rotationAngle = 0;
  }

  #onKeydown({ key }) {
    switch (key) {
      case "w":
      case "ArrowUp":
        this.yVelocity = -this.yReferenceVelocity;
        break;
      case "s":
      case "ArrowDown":
        this.yVelocity = this.yReferenceVelocity;
        break;
      case "a":
      case "ArrowLeft":
        this.xVelocity = -this.xReferenceVelocity;
        break;
      case "d":
      case "ArrowRight":
        this.xVelocity = this.xReferenceVelocity;
        break;
    }
  }

  #onKeyup({ key }) {
    switch (key) {
      case "w":
      case "ArrowUp":
      case "s":
      case "ArrowDown":
        this.yVelocity = 0;
        break;
      case "a":
      case "ArrowLeft":
      case "d":
      case "ArrowRight":
        this.xVelocity = 0;
        break;
    }
  }

  #onMouseMove({ pageX, pageY }) {
    this.x = pageX;
    this.y = pageY;
  }

  #drawBlackHole(ctx) {
    // Create a radial gradient for the black hole effect
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);

    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(0.7, "yellow");
    gradient.addColorStop(0.8, "red");
    gradient.addColorStop(0.9, this.color);

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(this.x, this.y, this.size, 0, Drawable.degrees360InRadians);
    ctx.fill();
  }

  #drawSawBlade(ctx) {
    // Save current context state
    ctx.save();

    // Translate to the center of the blade
    ctx.translate(this.x, this.y);

    // Rotate the path of the blade
    ctx.rotate(this.rotationAngle);

    // Draw the blade
    ctx.beginPath();
    ctx.moveTo(this.size, 0);

    for (let i = 1; i <= this.teethQuantity * 2 + 1; i++) {
      const angle = Math.PI / this.teethQuantity * i;

      const r = (i % 2 === 0) ? this.size * 0.6 : this.size;

      const nextX = Math.cos(angle) * r;

      const nextY = Math.sin(angle) * r;

      ctx.lineTo(nextX, nextY);
    }

    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();

    // Draw the center hole
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 0.4, 0, Drawable.degrees360InRadians);
    ctx.fillStyle = "black";
    ctx.fill();

    // Restore the context to its original state
    ctx.restore();

    // Increment rotation angle for the next frame
    this.rotationAngle += this.rotationSpeed;
  }

  update(xLimit, yLimit, drawables) {
    super.update(xLimit, yLimit, drawables);

    /* Move the drawable */
    this.x += this.xVelocity;
    this.y += this.yVelocity;

    /* Keep inside the canvas's boundaries */
    if ((this.x + this.size) >= xLimit) {
      this.x = xLimit - this.size;
    }

    if ((this.x - this.size) <= 0) {
      this.x = this.size;
    }

    if ((this.y + this.size) >= yLimit) {
      this.y = yLimit - this.size;
    }

    if ((this.y - this.size) <= 0) {
      this.y = this.size;
    }

    for (const drawable of drawables) {
      if (drawable.isOverlappingWith(this)) {
        drawable.exists = false;
      }
    }
  }

  enableControl() {
    window.addEventListener("mousemove", this.#mouseEventHandler);
    window.addEventListener("keydown", this.#keydownEventHandler);
    window.addEventListener("keyup", this.#keyupEventHandler);
  }

  disableControl() {
    window.removeEventListener("mousemove", this.#mouseEventHandler)
    window.removeEventListener("keydown", this.#keydownEventHandler);
    window.removeEventListener("keyup", this.#keyupEventHandler);
  }

  draw(ctx) {
    super.draw(ctx);

    this.#drawSawBlade(ctx);
  }
}

/* ********** Functions ********** */
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

function random(min, max) {
  if (typeof min !== "number") {
    throw new TypeError("A number was expected as `min`");
  }

  if (typeof max !== "number") {
    throw new TypeError("A number was expected as `max`");
  }

  if (min > max) {
    throw new Error("`min` must be less than or equals to `max`");
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomRGB() {
  return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
}

function animationLoop(ctx, color, width, height, drawables, evilCircle, ballCount) {
  if (!(ctx instanceof CanvasRenderingContext2D)) {
    throw new TypeError("An instance of CanvasRenderingContext2D was expected as `ctx`");
  }

  if (typeof color !== "string") {
    throw new TypeError("A string was expected as `color`");
  }

  if (typeof width !== "number") {
    throw new TypeError("A number was expected as `width`");
  }

  if (typeof height !== "number") {
    throw new TypeError("A number was expected as `height`");
  }

  if (!(drawables instanceof Array)) {
    throw new TypeError("An instance of Array was expected as the `drawables`");
  }

  if (!(evilCircle instanceof EvilCircle)) {
    throw new TypeError("An instance of EvilCircle was expected as the `evilCircle`");
  }

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  evilCircle.draw(ctx);

  evilCircle.update(width, height, drawables);

  // To be improved with a reusable array to avoid cronstructing so many objects
  const oldState = drawables.map(it => new Ball(
    it.id, it.x, it.y, it.xVelocity, it.yVelocity, it.color, it.size, it.exists));

  for (const drawable of drawables) {
    drawable.draw(ctx);

    drawable.update(width, height, oldState);
  }

  const aliveBalls = drawables.filter(drawable => drawable.exists).length;

  ballCount.textContent = aliveBalls;

  if (aliveBalls === 0) {
    drawables.forEach(drawable => drawable.exists = true);
  }

  requestAnimationFrame(() => animationLoop(ctx, color, width, height, drawables, evilCircle, ballCount));
}

/* ********** Main ********** */
const ballCountSpan = document.querySelector("#ball-count span");

const canvas = document.querySelector("canvas");

const ctx = canvas.getContext("2d");

const width = (canvas.width = window.innerWidth);

const height = (canvas.height = window.innerHeight);

const balls = [];

while (balls.length < MAX_BALLS_QTY) {
  const size = random(10, 20);

  const newBall = new Ball(
    uuidv4(),
    random(0 + size, width - size),
    random(0 + size, height - size),
    random(-7, 7),
    random(-7, 7),
    randomRGB(),
    size
  )

  if (!balls.some(ball => newBall.isOverlappingWith(ball))) {
    balls.push(newBall);
  }
}

const evilCircle = new EvilCircle(width / 2, height / 2);

evilCircle.enableControl();

animationLoop(ctx, "rgb(0 0 0 / 75%)", width, height, balls, evilCircle, ballCountSpan);
