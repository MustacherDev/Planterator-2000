var path = "Sounds/";

Howler.autoUnlock = true;


/// SOUND AND TEXTURES LOADER

// Loading Sounds
var sounds = [];
var soundsState = [];

var winSounds = [];

const SND = Object.freeze(new Enum(

    "TOTAL"
));

const sndPaths = [
  
];

const WINSND = Object.freeze(new Enum(
  
  "TOTAL"
));

const winSndPaths = [
 
];



for(var i = 0 ; i < sndPaths.length; i++){
  sounds.push(new Howl({src:["Sounds/" + sndPaths[i]]}));
}

function playSound(soundId){
  return sounds[soundId].play();
}

function pauseSound(soundId){
  sounds[soundId].pause();
}

function stopSound(soundId){
  sounds[soundId].stop();
}

for(var i = 0 ; i < winSndPaths.length; i++){
  winSounds.push(new Audio("Sounds/Win/" + winSndPaths[i]));
}





const SPR = Object.freeze(new Enum(
    "PLANTS",
    "GRASSTILE",
    "SCREENFRAMETILE",
    "RESTART",
    "TOTAL"
));

var imgPaths = [
  "plants.png",
  "grassTile.png",
  "screenFrameTile.png",
  "restart.png"
];

var need2Load = imgPaths.length;
var dataLoaded = 0;
var allDataIsLoaded = false;
var spritesLoaded = false;

var sprites = [];
var images  = [];


function loadSprites() {
    if (!spritesLoaded) {
      console.log("loading Sprites");

        for (var i = 0; i < images.length; i++) {
            sprites.push(createSprite(images[i]));
        }

        sprites[SPR.PLANTS].setSubimg(16,16);
        sprites[SPR.GRASSTILE].setSubimg(16,16);
        sprites[SPR.SCREENFRAMETILE].setSubimg(64,64);
        spritesLoaded = true;
    }
}

function checkImages() {
    for (var i = 0; i < images.length; i++) {
        if (!images[i].complete) {
            return false;
        }
    }
    return true;
}

function testLoad() {
    dataLoaded++;
    if (dataLoaded >= need2Load) {
        allDataIsLoaded = true;
        loadSprites();
    }
}


path = "Sprites/";

for(var i = 0 ; i < imgPaths.length; i++){
  images.push(new Image());
  images[i].onLoad = testLoad;

  images[i].src = path+imgPaths[i];
}
