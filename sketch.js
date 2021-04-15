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
var totalRooms = 11;
var collected = []
var totalCollected = 0;
var talkedToWeirdNPC = false;
var eventTrigger = false;

var img = []
var sound;

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
    clickablesManager.draw();

    // No avatar for Splash screen or Instructions screen
    if( adventureManager.getStateName() !== "Splash" &&
        adventureManager.getStateName() !== "Intro" ) {

        // responds to keydowns
        moveSprite();

        // this is a function of p5.js, not of this sketch
        drawSprite(playerSprite);

        displayCount();
    }

    drawLayers()
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
    adventureManager.clickablePressed(this.name);
}



//-------------- SUBCLASSES / YOUR DRAW CODE CAN GO HERE ---------------//

function pickedUpItem() {
    if( talkedToWeirdNPC === false ) {
        console.log("OVERLAP REALLLY")
        print( "turning them on");
        sound.play()

        talkedToWeirdNPC = true;
        print("talked to weidy");
    }
}

function drawLayers() {
    if (adventureManager.getStateName() === "ParkEntrance" ||
        adventureManager.getStateName() === "ParkCenter" ) {
        image(img[0],0,0)
    }


}

function displayCount() {
    fill(0,0,0,200)
    rect(75,25, 250,100)
    fill(255)
    textSize(20)
    text("truths collected: " + totalCollected + " / 5", 100, 50)
    text("ID collected: " + collected[1] + " / 1", 100, 100)
}

function noEntry() {
    playerSprite.position.x = width/2;
    playerSprite.position.y = height/2;
}


// Instructions screen has a backgrounnd image, loaded from the adventureStates table
// It is sublcassed from PNGRoom, which means all the loading, unloading and drawing of that
// class can be used. We call super() to call the super class's function as needed
class IntroScreen extends PNGRoom {
    // preload is where we define OUR variables
    preload() {
        // These are out variables in the InstructionsScreen class
        this.textBoxWidth = (width/6)*4;
        this.textBoxHeight = (height/6)*4;

        // hard-coded, but this could be loaded from a file if we wanted to be more elegant
        // this.instructionsText = "Hi Stephanie You Got This You Can Do This Project I Believe In YOU!!!";
        this.instructionsText = "Use arrow keys to move around and explore. \n\n WARNING: still very much rough. Interactions and Text have not been fully implemented...";
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
        textAlign(CENTER);
        textSize(30);

        // Draw text in a box
        text(this.instructionsText, width/6, height/6, this.textBoxWidth, this.textBoxHeight );
    }
}

class PickupItem extends PNGRoom {
    // preload() gets called once upon startup
    // We load ONE animation and create 20 NPCs
    //
    preload() {
        // this is our image, we will load when we enter the room
        this.talkBubble = null;
        this.talkedToNPC = false;  // only draw when we run into it
        talkedToWeirdNPC = false;

        // NPC position
        this.drawX = 100;
        this.drawY = 500;

        this.roomID = 0;

        // load the animation just one time
        this.weirdNPCSprite = createSprite( this.drawX, this.drawY, 10, 10);
        this.weirdNPCSprite.addAnimation('regular',  loadAnimation('assets/paper.png'));
    }

    load() {
        // pass to superclass
        super.load();

        clickables[0].visible = false;
    }

    // clears up memory
    unload() {
        super.unload();

        talkedToWeirdNPC = false;
        print("unloading AHA room");
    }

    // pass draw function to superclass, then draw sprites, then check for overlap
    draw() {
        // PNG room draw
        super.draw();

        this.roomID = adventureManager.getCurrentStateNum();
        // console.log("current id?:" + adventureManager.getCurrentStateNum())


        // draws all the sprites in the group
        //this.weirdNPCSprite.draw();
        if (collected[this.roomID] === 0) {
            drawSprite(this.weirdNPCSprite)
            playerSprite.overlap(this.weirdNPCSprite, pickedUpItem);
        }
        // draws all the sprites in the group -
        //drawSprites(this.weirdNPCgroup);//.draw();

        // checks for overlap with ANY sprite in the group, if this happens
        // talk() function gets called

        if( talkedToWeirdNPC === true && collected[this.roomID] === 0) {
            totalCollected += this.roomID === 1 ? 0 : 1;
            collected[this.roomID] = 1;
            console.log(this.roomID)
        }

    }
}

// Instructions screen has a backgrounnd image, loaded from the adventureStates table
// It is sublcassed from PNGRoom, which means all the loading, unloading and drawing of that
// class can be used. We call super() to call the super class's function as needed
class YardScreen extends PickupItem {
    // preload() gets called once upon startup
    // We load ONE animation and create 20 NPCs
    //
    preload() {
        super.preload();
        // this is our image, we will load when we enter the room
        this.talkBubble = null;
        this.talkedToNPC = false;  // only draw when we run into it
        talkedToWeirdNPC = false;

        // NPC position
        this.drawX = width - 100;
        this.drawY = height/2 + 100;

        // load the animation just one time
        this.weirdNPCSprite = createSprite( this.drawX, this.drawY, 10, 10);
        this.weirdNPCSprite.addAnimation('regular',  loadAnimation('assets/paper.png'));
    }

    load() {
        // pass to superclass
        super.load();

        // this.talkBubble = loadImage('assets/talkBubble.png');
        if (adventureManager.getCurrentStateNum() === 1) {
            playerSprite.position.x = 425;
            playerSprite.position.y = 250;
        }

        // turn off buttons
        // for( let i = 0; i <= 1; i++ ) {
        //     clickables[i].visible = false;
        // }
        // clickables[0].visible = false;
    }

    // clears up memory
    unload() {
        super.unload();

        this.talkBubble = null;
        talkedToWeirdNPC = false;
        print("unloading AHA room");
    }

    // pass draw function to superclass, then draw sprites, then check for overlap
    draw() {
        // PNG room draw
        super.draw();
        fill(255)
        textSize(20)
        text("Press [a] to enter house again", width - 400, 50)

    }
}

class BedScreen extends PickupItem {
    // preload() gets called once upon startup
    // We load ONE animation and create 20 NPCs
    //
    preload() {
        super.preload();
        // this is our image, we will load when we enter the room

        // NPC position
        this.drawX = 350;
        this.drawY = 200;

        // load the animation just one time
        this.weirdNPCSprite = createSprite( this.drawX, this.drawY, 10, 10);
        this.weirdNPCSprite.addAnimation('regular',  loadAnimation('assets/id_card.png'));
    }

    load() {
        // pass to superclass
        super.load();
        playerSprite.position.x = width/2;
        playerSprite.position.y = height/2;
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

class RoadBlock extends PNGRoom {
    preload() {

        // this is our image, we will load when we enter the room
        this.NPCAnimation = loadAnimation('assets/avatars/ScoutSpriteRest-01.png', 'assets/avatars/ScoutSpriteRest-04.png');

        // this is a type from p5play, so we can do operations on all sprites
        // at once
        this.NPCgroup = new Group;

        // change this number for more or less
        this.numNPCs = 5;

        // is an array of sprites, note we keep this array because
        // later I will add movement to all of them
        this.NPCSprites = [];

        // this will place them randomly in the room
        for (let i = 0; i < this.numNPCs; i++) {
            // random x and random y poisiton for each sprite
            let randX = (450) + (95 * i);
            let randY = height - 100;

            // create the sprite
            this.NPCSprites[i] = createSprite(randX, randY, 10, 10);

            // add the animation to it (important to load the animation just one time)
            this.NPCSprites[i].addAnimation('regular', this.NPCAnimation);

            // add to the group
            // this.NPCgroup.add(this.NPCSprites[i]);
        }
    }

    // pass draw function to superclass, then draw sprites, then check for overlap
    draw() {
        // PNG room draw
        super.draw();

        // draws all the sprites in the group
        // this.NPCgroup.draw();
        for(let i = 0; i < this.numNPCs - totalCollected; i ++) {
            drawSprite(this.NPCSprites[i])
            playerSprite.overlap(this.NPCSprites[i], noEntry);
        }
    }
}

class PollScreen extends PNGRoom {
    // preload() gets called once upon startup
    // We load ONE animation and create 20 NPCs
    //
    preload() {

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
        fill(255,255,255,200)
        rect(180,100, 900, 500)
        fill(0)
        textSize(40)
        textAlign(CENTER)
        if (totalCollected >= 5 && collected[1] === 1) {
            text("Congrats you can vote!", width/2, height/2);
        } else if (totalCollected < 5) {
            text("It looks like you're having doubts\ncollect more truths", width/2, height/2);
        } else if (collected[1] !== 1) {
            text("You can't vote here without an ID.\nWhere did we put it...", width/2, height/2);
        }
        textAlign(LEFT)
    }
}