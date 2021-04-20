# InteractProjectTwo
 
## Project 2: Social Justice Game
#### by Stephanie Grasso
April 20, 2021


### Overview
Video game that aims to educate the player on their proper Voter Rights inorder to encourage them to vote in the next election. User is able to control player sprite and collect items and talk to NPCs under the theme voter rights. Uses the p5.play library to accomplish a web based approach to game development. 


### Technical Details

Program implements a P5.Adventure.js library which handles state changes specified within a the interaction table given in, `interactionTable.csv`. States are registered by means of the `adventureStates.csv` file which contains information on each state and how it should be implemented. Using this libraries features, the program is able to handle statechanges between rooms to create a map-like layout for the game. Each room is rendered as either a direct child of the PNGRoom class or as a subclass underneath it. Under these subclasses in `sketch.js` the program is able to allow the game to implement features such as NPC interaction and item collection. 

### Adobe XD link
[Here](https://xd.adobe.com/view/43b28322-1225-46fb-8b5a-7ef27f8b742b-16e1/)

### Live Site link
[Here](http://xarts.usfca.edu/~sngrasso/ProjectTwo/)

### Files
`sketch.js` - main javascript file containing majority of code creating the primary visuals

`index.html` - main html file. Includes light styling.

`assets` - includes all asset files used within the game.

`data` - this is where all the .csv files (excluding collisions) are held