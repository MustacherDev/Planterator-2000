
var plantMan;

function stateInit(){

  ctx.save();

  ctx.translate(canvasOffsetX, canvasOffsetY);
  ctx.scale(canvasSclX, canvasSclY);
  ctx.translate(camX, camY);

  ctx.fillStyle = "rgb(255,255,255)";

  ctx.font = "Arial 40px";
  ctx.fillText("PLANT GENERATOR", roomWidth/2, roomHeight/2);
  ctx.fillText("CLICK TO START", roomWidth/2, roomHeight*0.5 + 20);

  ctx.restore();

  if (input.mouseState[0][1] && (allDataIsLoaded || checkImages())) {
     loadSprites();
     executingState = stateMenu;
     plantMan = new PlantManager();
     plantMan.restart();
     screenBorder = new ScreenBorder();
     backMan = new BackgroundManager();
 }
}




class ScreenBorder{
  constructor(){
    this.x = 0;
    this.y = 0;
    this.hTileNum = 3;
    this.vTileNum = 3;
    this.width = roomWidth;
    this.height = roomHeight;
    this.tileWid = this.width/this.hTileNum;
    this.tileHei = this.height/this.vTileNum;

    this.xScl = this.tileWid/sprites[SPR.SCREENFRAMETILE].width;
    this.yScl = this.tileHei/sprites[SPR.SCREENFRAMETILE].height;;
  }

  tileNumHelp = function (tile, tileMax, imgMin) {
    if (tile == 0) {
      return imgMin;
    } else if (tile == tileMax - 1) {
      return imgMin + 2;
    }

    return imgMin + 1;
  }


  tileNumHelpFull = function (tileX, tileY, tileXMax, tileYMax) {
    var img = 0;
    var rotation = 0;
    if (tileYMax == 1 && tileXMax == 1) {
      img = 12;
    } else if (tileXMax == 1) {
      rotation = Math.PI / 2;
      img = this.tileNumHelp(tileY, tileYMax, 9);
    } else if (tileYMax == 1) {
      img = this.tileNumHelp(tileX, tileXMax, 9);
    } else {
      if (tileY == 0) {
        img = this.tileNumHelp(tileX, tileXMax, 0);
      } else if (tileY == tileYMax - 1) {
        img = this.tileNumHelp(tileX, tileXMax, 6);
      } else {
        img = this.tileNumHelp(tileX, tileXMax, 3);
      }
    }

    return new Vector(img, rotation);
  }
  draw(ctx){

    for (var i = 0; i < this.vTileNum; i++) {
      for (var j = 0; j < this.hTileNum; j++) {
        var xx = this.x + j * this.tileWid;
        var yy = this.y + i * this.tileHei;

        var img = 0;
        var rotation = 0;

        var imgRot = this.tileNumHelpFull(j, i, this.hTileNum, this.vTileNum);

        rotation = imgRot.y;
        img = imgRot.x;


        sprites[SPR.SCREENFRAMETILE].drawExt(xx + 32 * this.xScl, yy + 32 * this.yScl, img, this.xScl, this.yScl, rotation, 32, 32);
      }
    }
  }
}

var screenBorder;

class BackgroundManager{
  constructor(){

    this.rowStart = 0;
    this.colStart = 0;
    this.offset = 0;
    this.tileSize = 250;
    this.tileScl  = this.tileSize/sprites[SPR.GRASSTILE].width;
    this.tileXNum = window.innerWidth/this.tileSize;
    this.tileYNum = window.innerHeight/this.tileSize;

    this.imgs = [];
    for(var i = 0; i < this.tileYNum+1; i++){
      var subList = [];
      for(var j = 0; j < this.tileXNum+1; j++){
        subList.push(this.calculateSubImg(i, j));
      }
      this.imgs.push(subList);
    }
  }

  calculateSubImg(row, col){
    return Math.floor((Math.sin(row*2.1616+col*Math.SQRT2*2)+1)*0.5 + 0.25);
  }

  update(dt){

    this.offset += 0.00125*dt;
    if(this.offset > 1){
      this.offset -= 1;
     
      for(var i = 0; i < this.tileXNum+1; i++){
        var xx = i + Math.floor(this.colStart/(this.tileXNum+1))*(this.tileXNum+1);
        var yy = Math.floor((this.rowStart) % (this.tileYNum+1));
        this.imgs[yy][i] = this.calculateSubImg(this.colStart, xx);
      }

      for(var j = 0; j < this.tileYNum+1; j++){
        var xx = Math.floor((this.colStart) % (this.tileXNum+1));
        var yy = j + Math.floor(this.rowStart/(this.tileYNum+1))*(this.tileYNum+1);;
        this.imgs[j][xx] = this.calculateSubImg(yy, this.rowStart);
      }

      this.colStart ++;
      this.rowStart ++;

      // this.colStart = (this.colStart) % (this.tileXNum+1);
      // this.rowStart = (this.rowStart) % (this.tileYNum+1);

    
    }
  

  }

  draw(ctx){
    for(var i = 0; i < this.tileYNum+1; i++){
      for(var j = 0; j < this.tileXNum+1; j++){
  
        var xx = (j - this.offset)*this.tileSize;
        var yy = (i - this.offset)*this.tileSize;
        var imgX = Math.floor((this.colStart + j) % (this.tileXNum+1));
        var imgY = Math.floor((this.rowStart + i) % (this.tileYNum+1));
        sprites[SPR.GRASSTILE].drawExt(xx, yy, this.imgs[imgY][imgX], this.tileScl, this.tileScl, 0, 0, 0);
      }  
    }
  }
}

var backMan ;

function stateMenu(dt){

  ctx.save();


  backMan.update(dt);
  backMan.draw(ctx);

  ctx.translate(canvasOffsetX, canvasOffsetY);
  ctx.scale(canvasSclX, canvasSclY);
  ctx.translate(camX, camY);


  plantMan.restartBut.draw(ctx);


  ctx.save();
  var border = 15;
  ctx.beginPath();
  ctx.rect(border, border, roomWidth-2*border, roomHeight-2*border);
  ctx.clip();

  ctx.fillStyle = "rgba(0,0,0, 0.7)";
  ctx.fillRect(0,0,roomWidth, roomHeight);

  plantMan.update(dt);
  plantMan.pushDrawList();

  sortDrawDepth();

  for(var i = 0 ; i < drawRequests.length; i++){
    drawRequests[i].draw(ctx);
  }

  drawRequests = [];

  ctx.restore();

  screenBorder.draw(ctx);

  ctx.restore();

}


var executingState = stateInit;


var elapsedTime = 0;
var thenTimeDate = new Date();
const FRAMERATE = 60;

function step() {


  var nowTimeDate = new Date();
  elapsedTime = nowTimeDate.getTime() - thenTimeDate.getTime();

  var discountTime = 0;
  if(pageFocusChange && pageFocused){
    discountTime = nowTimeDate.getTime() - pageUnfocusedStart.getTime();
    pageFocusChange = false;
  }

  elapsedTime = Math.max(elapsedTime - discountTime, 0);


  thenTimeDate = new Date(nowTimeDate);
  var dt = elapsedTime/(1000/FRAMERATE);

  canvas.style.cursor = 'default';


  ctx.fillStyle = "rgb(10, 10, 10)";
  ctx.fillRect(0,0, canvas.width, canvas.height);


  executingState(dt);

  // Input Handling
  input.update();




  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
