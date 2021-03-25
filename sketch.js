function setup() {
    createCanvas(400, 400);
}

function draw() {
    background(220);

    textAlign(CENTER)
    drawSprites();

    text("click to test that sprite library is working", width / 2, height / 2);
}

function mousePressed() {
    var sprite = createSprite (mouseX, mouseY, 30, 30)

    sprite.velocity.x = 2;
}