/***********************************************************************************
 MoodyMaze
 by Scott Kildall

 Uses the p5.2DAdventure.js class

 ------------------------------------------------------------------------------------
 To use:
 Add this line to the index.html

 <script src="p5.2DAdventure.js"></script>
 ***********************************************************************************/

// adventure manager global
var adventureManager;

// p5.play
var playerSprite;
var playerAnimation;

// Clickables: the manager class
var clickablesManager;    // the manager class
var clickables;           // an array of clickable objects

// indexes into the clickable array (constants)
const playGameIndex = 0;
var conversationIndex = 0;
var totalRooms = 12;
var collected = [];
var collectedNPC = [];
var totalCollected = 0;
var totalNPCCollected = 0;

// all the event toggles
var pickedUpAnItem = false;
var talkedToNPC = false;
var eventTrigger = false;
var startTrigger = false;
var currentEvent = false;
var showInventory = false;
var eventCalendar = false;
var currentCalendarEvent = false;
var firstSceneEvent = false;
var collectablesVisible = false;
var startConvo = false;
var inEvent = false;
var wakeEvent = true;
var hideArch = false;

// extras
var img = [];
var sound;

var textBox = {
    panel: null,
    dialogue: null
}

// Allocate Adventure Manager with states table and interaction tables
function preload() {
    clickablesManager = new ClickableManager('data/clickableLayout.csv');
    adventureManager = new AdventureManager('data/adventureStates.csv', 'data/interactionTable.csv', 'data/clickableLayout.csv');
}

// Setup the adventure manager
function setup() {
    createCanvas(1280, 720);

    // setup the clickables = this will allocate the array
    clickables = clickablesManager.setup();

    // create a sprite and add the 3 animations
    playerSprite = createSprite(width/2, height/2, 80, 80);

    // every animation needs a descriptor, since we aren't switching animations, this string value doesn't matter
    playerSprite.addAnimation('regular', loadAnimation('assets/avatars/ScoutSpriteRest-01.png', 'assets/avatars/ScoutSpriteRest-04.png'));
    playerSprite.addAnimation('moving', loadAnimation('assets/avatars/ScoutSprite-01.png', 'assets/avatars/ScoutSprite-04.png'));


    // use this to track movement from toom to room in adventureManager.draw()
    adventureManager.setPlayerSprite(playerSprite);

    // this is optional but will manage turning visibility of buttons on/off
    // based on the state name in the clickableLayout
    adventureManager.setClickableManager(clickablesManager);

    // This will load the images, go through state and interation tables, etc
    adventureManager.setup();

    img[0] = loadImage('assets/arch.png');
    sound = loadSound('assets/sounds/PickupItem.mp3');

    for (var i = 0; i < totalRooms; i++) {
        collected[i] = 0;
    }

    for (var i = 0; i < 4; i++) {
        collectedNPC[i] = 0;
    }
    console.log(collected)
    // call OUR function to setup additional information about the p5.clickables
    // that are not in the array
    setupClickables();
}

// Adventure manager handles it all!
function draw() {
    // draws background rooms and handles movement from one to another
    adventureManager.draw();
    // draw the p5.clickables, in front of the mazes but behind the sprites

    // No avatar for Splash screen or Instructions screen
    if( adventureManager.getStateName() !== "Splash" &&
        adventureManager.getStateName() !== "Intro" ) {

        if(!firstSceneEvent && (adventureManager.getStateName() !== "Start"
        && adventureManager.getStateName() !== "ParkBottom")) {
            textAlign(CENTER)

            textSize(30)
            text("follow to polls\n  v  ", width/2, height - 75)

            textAlign(LEFT)
        }
        // responds to keydowns
        if(!inEvent){
            moveSprite();
        }
        // this is a function of p5.js, not of this sketch
        drawSprite(playerSprite);
        // show inventory
        if (showInventory) {
            displayCount();
        }
        clickables[2].visible = true;
    }

    drawLayers()
    clickablesManager.draw();
}

// pass to adventure manager, this do the draw / undraw events
function keyPressed() {
    // toggle fullscreen mode
    if( key === 'f') {
        fs = fullscreen();
        fullscreen(!fs);
        return;
    }

    // dispatch key events for adventure manager to move from state to
    // state or do special actions - this can be disabled for NPC conversations
    // or text entry

    // dispatch to elsewhere
    adventureManager.keyPressed(key);
}

function mouseReleased() {
    adventureManager.mouseReleased();
}

//-------------- YOUR SPRITE MOVEMENT CODE HERE  ---------------//
function moveSprite() {
    if(keyIsDown(RIGHT_ARROW)) {
        playerSprite.changeAnimation('moving');
        playerSprite.velocity.x = 10;
        return;
    }
    else if(keyIsDown(LEFT_ARROW)) {
        playerSprite.changeAnimation('moving');
        playerSprite.velocity.x = -10;
        return;
    }
    else {
        playerSprite.changeAnimation('regular');
        playerSprite.velocity.x = 0;
    }

    if(keyIsDown(DOWN_ARROW)){
        playerSprite.changeAnimation('moving');
        playerSprite.velocity.y = 10;
    }
    else if(keyIsDown(UP_ARROW)) {
        playerSprite.changeAnimation('moving');
        playerSprite.velocity.y = -10;
    }
    else {
        playerSprite.changeAnimation('regular');
        playerSprite.velocity.y = 0;
    }
}

//-------------- CLICKABLE CODE  ---------------//

function setupClickables() {
    // All clickables to have same effects
    for( let i = 0; i < clickables.length; i++ ) {
        clickables[i].onHover = clickableButtonHover;
        clickables[i].onOutside = clickableButtonOnOutside;
        clickables[i].onPress = clickableButtonPressed;
    }
}

// tint when mouse is over
clickableButtonHover = function () {
    this.color = "#AA33AA";
    this.noTint = false;
    this.tint = "#FF0000";
}

// color a light gray if off
clickableButtonOnOutside = function () {
    // backto our gray color
    this.color = "#AAAAAA";
}

clickableButtonPressed = function() {
    // these clickables are ones that change your state
    // so they route to the adventure manager to do this
    console.log(this.name)
    if (this.name === "Inventory") {
        showInventory = showInventory == false ? true : false;
    }
    else if (this.name === "Talk") {
        console.log("clicked")
        startConvo = true;
    }
    else if (this.name === "Next" || this.name === "Answer2") {
        conversationIndex += 1;
        eventCalendar = false;
    }
    else if (this.name === "Answer1") {
        conversationIndex = 0;
        startConvo = false;
    }
    else if (this.name === "NotDone") {
        currentEvent = true;
    }
    adventureManager.clickablePressed(this.name);
}



//-------------- HELPER FUNCTIONS / YOUR DRAW CODE CAN GO HERE ---------------//
// viewedCalendar():
function viewedCalendar() {
    console.log("OVERLAP REALLLY")
    !eventCalendar ? displayTopText("[x] to interact") : null;
    if(keyIsPressed && key === 'x' && currentCalendarEvent == false) {
        currentCalendarEvent = true;
    } else if(keyIsPressed && key === 'b' && currentCalendarEvent == true){
        eventCalendar = true;
        currentCalendarEvent = false;
    }
}

// pickedUpItem():
function pickedUpItem() {
    if( pickedUpAnItem === false ) {
        console.log("OVERLAP REALLLY")
        displayTopText("[x] to interact")
        if(keyIsPressed && key === 'x' && currentEvent == false) {
            currentEvent = true;
        } else if(keyIsPressed && key === 'b' && currentEvent == true){
            pickedUpAnItem = true;
            currentEvent = false;
        }
    }
}

// talkNPC():
function talkNPC() {
    if( talkedToNPC === false ) {
        sound.play()
        talkedToNPC = true;
        clickables[3].visible = true;
    }
}

// drawLayers():
function drawLayers() {
    if ((adventureManager.getStateName() === "ParkEntrance" ||
        adventureManager.getStateName() === "ParkCenter" ) && !hideArch) {
        image(img[0],0,0)
    }
    if (textBox.panel != null && textBox.dialogue != null){
        fill(0)
        displayDialogue()
    }
}

// displayCount():
function displayCount() {
    fill(0,0,0,200)
    rect(75,25, 250,150)
    fill(255)
    textSize(20)
    text("truths collected: " + totalCollected + " / 5", 100, 50)
    text("voters encouraged: " + totalNPCCollected + " / 3", 100, 100)
    // text("ID collected: " + collected[2] + " / 1", 100, 150)
}

// displayTruthText():
function displayTruthText(truth, myth) {
    textAlign(LEFT)
    textSize(25)
    noStroke();
    rectMode(CENTER);
    fill("#E6CCAA")
    rect(width/2,height/2, 650, 500);
    fill(92, 30, 9)
    text( myth , width / 2, height / 2 + 70, 500, 500);
    fill(97, 51, 37)
    text( truth + "\n\n press [b] to collect", width / 2, height / 2 + 175, 500, 500);
    rectMode(CORNER)
}

// displayTopText():
// displays text to the top of the window
function displayTopText(txt) {
    fill(0,0,0,100)
    rect(0,20, width, 40);
    textSize(27)
    textAlign(CENTER)
    fill(255)
    text(txt, width/2, 50)
    textAlign(LEFT)
}

// displayDialogue():
// displays dialogue box at the for front of the sketch
function displayDialogue() {
    textAlign(CENTER);
    textSize(25);
    fill(97, 51, 37)
    image(textBox.panel, 0, 0);
    text(textBox.dialogue, width/2 + 20, height/2 - 40)
    fill(0)
    textAlign(LEFT);
}

// noEntry():
// mock "collision" knock back when player sprite
// overlaps blocker sprites
function noEntry() {
    playerSprite.position.x = width/2;
    playerSprite.position.y = height/2;
}

// checkStatus():
// checks for the player status in collecting items in game
function checkStatus() {
    if (totalCollected < 3) {
        return "It looks like the area is still pretty blocked...\nContinue?"
    }
    else if (totalCollected <= 4) {
        return "The area looks a bit more decent...\nContinue?"
    }
    else {
        return "The road block has been cleared! We can now vote!!\nContinue?"
    }
}

//-------------- INTRO SUBCLASSES / YOUR DRAW CODE CAN GO HERE ---------------//
class IntroScreen extends PNGRoom {
    // preload is where we define OUR variables
    preload() {
        // These are out variables in the InstructionsScreen class
        this.textBoxWidth = (width/6)*4;
        this.textBoxHeight = (height/6)*4;

        this.instructionsText = "INSTRUCTIONS:\n\nUse the arrow keys on your keyboard to move around and explore.\n\nClick on the Inventory Button to check your stock";
    }

    // call the PNGRoom superclass's draw function to draw the background image
    // and draw our instructions on top of this
    draw() {
        // tint down background image so text is more readable
        tint(128);

        // this calls PNGRoom.draw()
        super.draw();

        // text draw settings
        fill(255);
        textAlign(LEFT);
        textSize(30);

        // Draw text in a box
        text(this.instructionsText, width/6, height/6, this.textBoxWidth, this.textBoxHeight );
    }
}

//-------------- ITEM PICKUP EVENT SUBCLASSES / YOUR DRAW CODE CAN GO HERE ---------------//
class PickupItem extends PNGRoom {
    // preload() gets called once upon startup
    // We load ONE animation and create 20 NPCs
    preload() {
        // this is our image, we will load when we enter the room
        this.talkBubble = null;
        this.talkedToNPC = false;  // only draw when we run into it
        pickedUpAnItem = false;
        currentEvent = false;

        // NPC position
        this.drawX = 100;
        this.drawY = 500;

        this.roomID = 0;
        this.truths = loadStrings('assets/truths.txt');
        this.myths = loadStrings('assets/myths.txt');
        // load the animation just one time
        this.weirdNPCSprite = createSprite( this.drawX, this.drawY, 10, 10);
        this.weirdNPCSprite.addAnimation('regular',  loadAnimation('assets/objects/paper.png'));
    }

    load() {
        // pass to superclass
        super.load();
        clickables[0].visible = false;
        console.log(this.myths)
    }

    // clears up memory
    unload() {
        super.unload();

        pickedUpAnItem = false;
        currentEvent = false;
        print("unloading AHA room");
    }

    // pass draw function to superclass, then draw sprites, then check for overlap
    draw() {
        // PNG room draw
        super.draw();

        this.roomID = adventureManager.getCurrentStateNum();

        // draws all the sprites in the group
        //this.weirdNPCSprite.draw();
        if (collected[this.roomID] === 0 && collectablesVisible === true) {
            drawSprite(this.weirdNPCSprite)
            playerSprite.overlap(this.weirdNPCSprite, pickedUpItem);
        }

        if( pickedUpAnItem === true && collected[this.roomID] === 0) {
            sound.play()
            totalCollected += this.roomID === 2 ? 0 : 1;
            collected[this.roomID] = 1;
            console.log(this.roomID)
        }

        if (currentEvent) {
            var index = totalCollected - collectedNPC[3]
            console.log(index)
            displayTruthText(this.truths[index],this.myths[index]);
        }

    }
}

class YardScreen extends PickupItem {
    // preload() gets called once upon startup
    // We load ONE animation and create 20 NPCs
    //
    preload() {
        super.preload();
        // this is our image, we will load when we enter the room
        this.talkBubble = null;
        this.talkedToNPC = false;  // only draw when we run into it
        pickedUpAnItem = false;

        // NPC position
        this.drawX = width - 100;
        this.drawY = height/2 + 100;

        // load the animation just one time
        this.weirdNPCSprite = createSprite( this.drawX, this.drawY, 10, 10);
        this.weirdNPCSprite.addAnimation('regular',  loadAnimation('assets/objects/paper.png'));
    }

    load() {
        // pass to superclass
        super.load();
        if (adventureManager.getCurrentStateNum() === 2) {
            playerSprite.position.x = 425;
            playerSprite.position.y = 250;
        }
    }

    // clears up memory
    unload() {
        super.unload();
        this.talkBubble = null;
        pickedUpAnItem = false;
    }

    // pass draw function to superclass, then draw sprites, then check for overlap
    draw() {
        // PNG room draw
        super.draw();
        fill(255)
        textSize(20)
        if (playerSprite.position.x >= 325 && playerSprite.position.x <= 525 &&
            playerSprite.position.y >= 150 && playerSprite.position.y <= 350) {
            displayTopText("Press [a] to enter house")
        }
    }
}

class BedScreen extends PickupItem {
    // preload() gets called once upon startup
    // We load ONE animation and create 20 NPCs
    //
    preload() {
        super.preload();
        // this is our image, we will load when we enter the room
        this.openingScreen = true;
        this.talkBubble = null;
        // NPC position
        this.drawX = 350;
        this.drawY = 200;

        // load the animation just one time
        this.weirdNPCSprite = createSprite( this.drawX, this.drawY, 10, 10);
        this.weirdNPCSprite.addAnimation('regular',  loadAnimation('assets/id_card.png'));
        this.cues = ["*yawn*", "man I slept like a log", "What day even is it?\nI should probably check my\n[CALENDAR].."]
        this.secondCues = ["Oh that's right it's election day!!!\nLet's head to the polls!\n\nhit [a] to leave house"]
        this.calendarSprite = createSprite( 720, 125, 10, 10);
        this.calendarSprite.addAnimation('regular',  loadAnimation('assets/objects/calendar.png'));
    }

    load() {
        // pass to superclass
        super.load();
        conversationIndex = 0;
        this.talkBubble = loadImage("assets/objects/scout_card.png")
        this.calendarImg = loadImage("assets/objects/calendar_focus.png")
        playerSprite.position.x = width/2;
        playerSprite.position.y = height/2;
    }

    // clears up memory
    unload() {
        super.unload();
        conversationIndex = 0;
        wakeEvent = false
        textBox.dialogue = null;
        textBox.panel = null;
    }

    // pass draw function to superclass, then draw sprites, then check for overlap
    draw() {
        // PNG room draw
        super.draw();

        if (collected[this.roomID] === 0) {
            drawSprite(this.weirdNPCSprite)
            playerSprite.overlap(this.weirdNPCSprite, pickedUpItem);
        }
        // these are all dialogue panels
        if(conversationIndex < this.cues.length && wakeEvent) {
            textBox.dialogue = this.cues[conversationIndex];
            textBox.panel = this.talkBubble;
            clickables[6].visible = true;
        } else if (conversationIndex < 1  && eventCalendar){
            textBox.dialogue = this.secondCues[conversationIndex];
            textBox.panel = this.talkBubble;
            clickables[6].visible = true;
        }
        else {
            textBox.dialogue = null;
            textBox.panel = null;
            clickables[6].visible = false;
            wakeEvent = false;
        }

        // calendar sprite handler
        drawSprite(this.calendarSprite)
        playerSprite.overlap(this.calendarSprite, viewedCalendar);
        // displays calendar related scenario
        if (currentCalendarEvent) {
            image(this.calendarImg, 0, 0)
            textBox.dialogue = " ";
            textBox.panel = this.calendarImg
            textAlign(CENTER)
            text("[b] to go back",width/2, height - 200)
            textAlign(LEFT)
        } else if (eventCalendar){
            displayTopText("[a] to leave house")
            conversationIndex = 0;
        }
    }
}

//-------------- POLLING END EVENT SUBCLASSES / YOUR DRAW CODE CAN GO HERE ---------------//
class RoadBlock extends PNGRoom {
    preload() {

        // this is our image, we will load when we enter the room
        this.NPCAnimation = loadAnimation('assets/NPC/block_sprite_01.png', 'assets/NPC/block_sprite_09.png');

        this.talkBubble = null;

        // change this number for more or less
        this.numNPCs = 5;

        // is an array of sprites, note we keep this array because
        // later I will add movement to all of them
        this.NPCSprites = [];
        this.voterSprites = [];

        // this will place them randomly in the room
        for (let i = 0; i < this.numNPCs; i++) {
            // random x and random y poisiton for each sprite
            let randX = (450) + (95 * i);
            let randY = height - 100;

            // create the sprite
            this.NPCSprites[i] = createSprite(randX, randY, 10, 10);

            // add the animation to it (important to load the animation just one time)
            this.NPCSprites[i].addAnimation('regular', this.NPCAnimation);
        }

        this.voterSprites[0] = createSprite(980, 220, 10, 10);
        this.voterSprites[0].addAnimation('regular',loadAnimation('assets/NPC/park_en_01.png','assets/NPC/park_en_04.png'));
        this.voterSprites[1] = createSprite(200, 100, 10, 10);
        this.voterSprites[1].addAnimation('regular',loadAnimation('assets/NPC/park_cen_01.png','assets/NPC/park_cen_04.png'));
        this.voterSprites[2] = createSprite(800, 340, 10, 10);
        this.voterSprites[2].addAnimation('regular',loadAnimation('assets/NPC/park_man_01.png','assets/NPC/park_man_04.png'));

        this.txt = ["There are obstacles blocking the polls!!!\nMaybe we can find a way to free the entrance!",
        "Explore the park and neighborhood\nto find the truths of voting!\nInteract with people and papers nearby."]
    }

    load() {
        super.load()
        this.talkBubble = loadImage("assets/objects/scout_card.png");
        this.altBubble = loadImage("assets/objects/blank_card.png")
    }

    unload() {
        super.unload();
        firstSceneEvent = true;
        collectablesVisible = true;
        conversationIndex = 0;
        this.txt = null
        textBox.panel = null;
        textBox.dialogue = null;
        clickables[7].visible = false;
        clickables[8].visible = false;
        currentEvent = false;
    }

    // pass draw function to superclass, then draw sprites, then check for overlap
    draw() {
        // PNG room draw
        super.draw();

        if (firstSceneEvent === false) {
            if (conversationIndex === 0) {
                textBox.panel = this.talkBubble;
            } else {
                textBox.panel = this.altBubble;
            }
            textBox.dialogue = this.txt[conversationIndex];
            clickables[6].visible = true;
            if (conversationIndex > 1){
                clickables[6].visible = false;
                textBox.panel = null;
                textBox.dialogue = null;
            }
        }

        // draws all the sprites in the group
        // this.NPCgroup.draw();
        for(let i = 0; i < this.numNPCs - totalCollected; i ++) {
            drawSprite(this.NPCSprites[i])
            playerSprite.overlap(this.NPCSprites[i], noEntry);
        }

        for(let i = 0; i < 3; i ++) {
            if(collectedNPC[i] === 1){
                drawSprite(this.voterSprites[i])
            }
        }
        console.log(playerSprite.position.x)
        if(playerSprite.position.y >= 350 &&
            playerSprite.position.x >= 450 &&
            playerSprite.position.x <= 900 && !currentEvent){
            textBox.dialogue = checkStatus();
            textBox.panel = this.altBubble;
            clickables[7].visible = true;
            clickables[8].visible = true;
        }
        else if (currentEvent) {
            textBox.dialogue = null;
            textBox.panel = null;
            clickables[7].visible = false;
            clickables[8].visible = false;
        }
    }
}

class PollScreen extends PNGRoom {
    // preload() gets called once upon startup
    // We load ONE animation and create 20 NPCs
    //
    preload() {
        this.bgOne = loadImage("assets/poll_end_v1.png");
        this.bgTwo = loadImage("assets/poll_end_v2.png");

    }

    load() {
        // pass to superclass
        super.load();
        textAlign(CENTER)
    }

    // clears up memory
    unload() {
        super.unload();
        textAlign(LEFT)
    }

    // pass draw function to superclass, then draw sprites, then check for overlap
    draw() {
        // PNG room draw
        super.draw();
        playerSprite.visible = false;
        fill(255)
        textSize(40)
        textAlign(CENTER)

        if (totalCollected >= 5) {
            image(this.bgOne, 0, 0)
            text("Congratulations!\nYou were able to vote despite everything!\nVoter turnout was high and the party you voted for won the election!!", width/2, height/2 + 50);
        } else if (totalCollected < 5 && totalCollected >= 3) {
            image(this.bgOne, 0, 0)
            text("You were able to make it in despite the slight challenges.\nHowever; there was a small turnout of voters at your polling place...\nThe results were not in your favor...", width/2, height/2 + 50);
        }
        else {
            image(this.bgTwo, 0, 0)
            text("The polling place was still blocked when you tried to get it.\nDiscouraged, you went straight back home...\nYou did not vote", width/2, height/2 + 50);
        }

        textAlign(LEFT)
    }
}

//-------------- ALL NPC SUBCLASSES / YOUR DRAW CODE CAN GO HERE ---------------//
class NPCScreen extends PNGRoom{
    // preload() gets called once upon startup
    // We load ONE animation and create 20 NPCs
    //
    preload() {
        super.preload()
        talkedToNPC = false;
        this.id = 0;
        this.paperSprite = createSprite( this.drawX, this.drawY, 10, 10);
        this.paperSprite.addAnimation('regular',  loadAnimation('assets/objects/paper.png'));

        this.NPCSprite = createSprite( width/2, height/2, 10, 10);
        this.NPCSprite.addAnimation('regular',  loadAnimation('assets/NPC/park_man_01.png', 'assets/NPC/park_man_04.png'));
    }

    load() {
        // pass to superclass
        super.load();
        startConvo = false;
        clickables[3].visible = false;
        pickedUpAnItem = false
    }

    // clears up memory
    unload() {
        super.unload();
        talkedToNPC = false;
        startConvo = false;
        clickables[3].visible = false;
        pickedUpAnItem = false;
        hideArch = false;
    }

    // pass draw function to superclass, then draw sprites, then check for overlap
    draw() {
        // PNG room draw
        super.draw();
        if(firstSceneEvent && collectedNPC[this.id] === 0){
            drawSprite(this.NPCSprite)
            playerSprite.overlap(this.NPCSprite, talkNPC);
        }
        if (totalNPCCollected === 3 && collectedNPC[3] === 0) {
            drawSprite(this.paperSprite)
            playerSprite.overlap(this.paperSprite, pickedUpItem);
        }
        if( pickedUpAnItem === true && collectedNPC[3] === 0) {
            sound.play()
            totalCollected += 1;
            collectedNPC[3] = 1;
            console.log(this.roomID)
        }

        if (currentEvent) {
            hideArch = true;
            displayTruthText("Truth: It may not seem like it in the grand scheme " +
                "of things. But there have been various cases where races were determined from a " +
                "single vote difference. So yes, every vote does matter. ","Myth: \"My Vote Doesn’t Matter\"");
        } else {
            hideArch = false;
        }
    }
}

class NPCEntrance extends NPCScreen {
    preload() {
        super.preload();

        // NPC position
        this.drawX = 130;
        this.drawY = 500;

        this.id = 0;

        // load the animation just one time
        this.paperSprite = createSprite( this.drawX, this.drawY, 10, 10);
        this.paperSprite.addAnimation('regular',  loadAnimation('assets/objects/paper.png'));

        this.cues = null
        this.bubble = null

        this.NPCSprite = createSprite( this.drawX, this.drawY, 10, 10);
        this.NPCSprite.addAnimation('regular',  loadAnimation('assets/NPC/park_en_01.png', 'assets/NPC/park_en_04.png'));

    }

    load() {
        // pass to superclass
        super.load();
        this.bubble = loadImage("assets/objects/front_girl_card.png")
        this.ourBubble = loadImage("assets/objects/scout_card.png")
        this.cues = [["Oh voting? Well we're not a swing state\nso I don't see how my vote really\nmatters anyways",this.bubble],
            ["...",this.ourBubble],["Still...\nIt's better to actively vote knowing\nyou did something instead of nothing at all.", this.ourBubble],
        ["You're right.\nI have the right to vote\nI should be using it!",this.bubble]]

    }

    // clears up memory
    unload() {
        super.unload();
        this.bubble = null;
        this.cues = null;
        conversationIndex = 0;
        textBox.dialogue = null;
        textBox.panel = null;
    }

    // pass draw function to superclass, then draw sprites, then check for overlap
    draw() {
        // PNG room draw
        super.draw();
        if (startConvo && conversationIndex < this.cues.length) {
            if(conversationIndex == 1) {
                clickables[4].visible = true;
                clickables[5].visible = true;
                clickables[6].visible = false;
            }
            else {
                clickables[4].visible = false;
                clickables[5].visible = false;
                clickables[3].visible = false;
                clickables[6].visible = true;
            }
            textBox.dialogue = this.cues[conversationIndex][0];
            textBox.panel = this.cues[conversationIndex][1];
        }
        else {
            startConvo = false
            textBox.dialogue = null;
            textBox.panel = null;
            clickables[6].visible = false;
            clickables[4].visible = false;
            clickables[5].visible = false;
        }

        if(conversationIndex === this.cues.length && collectedNPC[this.id] == 0) {
            sound.play()
            collectedNPC[this.id] = 1;
            totalNPCCollected += 1;
            console.log("SUCCESSFUL CONVO")
            console.log(collectedNPC)
        }
    }
}

class NPCCenter extends NPCEntrance {
    preload() {
        super.preload();
        // this is our image, we will load when we enter the room

        // NPC position
        this.drawX = 1030;
        this.drawY = 560;

        this.id = 1;
        // incase this is the last NPC setting the "drop" item with the same draw coordinates
        this.paperSprite = createSprite( this.drawX, this.drawY, 10, 10);
        this.paperSprite.addAnimation('regular',  loadAnimation('assets/objects/paper.png'));
        // load the animation just one time
        this.NPCSprite = createSprite( this.drawX, this.drawY, 10, 10);
        this.NPCSprite.addAnimation('regular',  loadAnimation('assets/NPC/park_cen_01.png', 'assets/NPC/park_cen_04.png'));

    }

    load() {
        // pass to superclass
        super.load();
        this.bubble = loadImage("assets/objects/center_girl_card.png")
        this.ourBubble = loadImage("assets/objects/scout_card.png")
        this.cues = [["Oh votings going on today?\n...I'm not that interested in politics...",this.bubble],
            ["...",this.ourBubble],["Even though you're comfortable\nwith how policies favor you. There are people\n" +
            "who would greatly benefit from this election\nif you voted!!", this.ourBubble],
        ["...wow,\nI hadn't thought about it that way...\nI need to get the polls ASAP!!!", this.bubble]]
    }

    // clears up memory
    unload() {
        super.unload();
    }

    // pass draw function to superclass, then draw sprites, then check for overlap
    draw() {
        // PNG room draw
        super.draw();
    }
}

class NPCRight extends NPCEntrance {
    preload() {
        super.preload();
        // this is our image, we will load when we enter the room

        // NPC position
        this.drawX = width / 2;
        this.drawY = height / 2;
        // set for this NPC id
        this.id = 2;
        // incase this is the last NPC setting the "drop" item with the same draw coordinates
        this.paperSprite = createSprite( this.drawX, this.drawY, 10, 10);
        this.paperSprite.addAnimation('regular',  loadAnimation('assets/objects/paper.png'));
        // load the animation just one time
        this.NPCSprite = createSprite( this.drawX, this.drawY, 10, 10);
        this.NPCSprite.addAnimation('regular',  loadAnimation('assets/NPC/park_man_01.png', 'assets/NPC/park_man_04.png'));
    }

    load() {
        // pass to superclass
        super.load();
        this.bubble = loadImage("assets/objects/park_man_card.png")
        this.ourBubble = loadImage("assets/objects/scout_card.png")
        this.cues = [["Voting?\nYeah I don't like either canidate\nI'm just gonna write Kanye",this.bubble],
            ["...",this.ourBubble], ["You're really just straying from the votes dude", this.ourBubble],
        ["Yeah, saying it out loud\nmakes it sound ridiculous,\nI'm gonna go properly vote now", this.bubble]]
    }

    // clears up memory
    unload() {
        super.unload();
    }

    // pass draw function to superclass, then draw sprites, then check for overlap
    draw() {
        // PNG room draw
        super.draw();
    }
}
