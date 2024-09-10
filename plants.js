
function isPointInsideRectangle(x, y, rectX, rectY, rectWidth, rectHeight, rectAngle) {
    // Convert the point and rectangle coordinates to a local coordinate system centered at the rectangle's origin, rotated by -rectAngle
    const cosAngle = Math.cos(-rectAngle);
    const sinAngle = Math.sin(-rectAngle);
  
    const localX = (x - rectX) * cosAngle - (y - rectY) * sinAngle;
    const localY = (x - rectX) * sinAngle + (y - rectY) * cosAngle;
  
    // Check if the point is within the rectangle's bounds in the local coordinate system
    return Math.abs(localX) <= rectWidth / 2 && Math.abs(localY) <= rectHeight / 2;
  }



var drawRequests = [];

function sortDrawDepth() {
    drawRequests.sort(function (a, b) {
        return b.depth - a.depth;
    });
}


class DrawRequest {
    constructor(obj, depth, parameter = null) {
      this.obj = obj;
      this.depth = depth;
      this.parameter = parameter;
    }
  
    draw(ctx) {
      this.obj.drawRequest(ctx, this.parameter);
  
    }
  }

class IdMachine{
    static id = 0;
    static getNewId(){
        this.id++;
        return this.id;
    }
}

class PlantPart{
    constructor(x, y, xRat, yRat, ang, plant){

        this.id = IdMachine.getNewId();

        // Variables used by the parent object only
        this.parentOffXRat = xRat;
        this.parentOffYRat = yRat;
        this.parentOffAng = ang;

        // Variables relative to self
        this.parentResX = x;
        this.parentResY = y;
        this.parentResAng = this.parentOffAng;

        this.offX = 0;
        this.offY = 0;
        this.offAng = 0;

        // Resulting variables
        this.x = x;
        this.y = y;
        this.depth = 0;
        this.ang = ang;

        this.angDegree = rad2deg(ang);
        
        this.type = 0;

        this.matureState = 0;
        this.matureSpd = 1;

        this.grownWidth = 10
        this.grownHeight = 200;
        this.startWidth = 1;
        this.startHeight = 1;

        this.width = this.startWidth;
        this.height = this.startHeight;
        this.color = new Color(0, 255, 0);


        this.trunkGen = 0;

        // Movement Variables
        this.angPhase = 0;
        this.angSpd = 0;
        this.angDamp = 0.03;
        this.angMove = 0;


    }

    updateParams(dt, plant){
        this.x = this.offX + this.parentResX;
        this.y = this.offY + this.parentResY;
        this.ang = this.offAng + this.parentResAng + this.angMove;
        this.angDegree = rad2deg(this.ang);

        this.angPhase += 0.01;
        this.angSpd += 0.0001*dt*(Math.sin(this.angPhase + this.trunkGen/2))

        this.angSpd += -dt*this.angMove/100;
        this.angSpd *= Math.pow(1-this.angDamp, dt);
        this.angMove += this.angSpd;

        this.matureState += dt*this.matureSpd/plant.options.matureTime;
        this.matureState = clamp(this.matureState, 0, 1.1);
    }

    update(dt, plant){
        this.updateParams(dt, plant);



        this.width  = this.startWidth + this.grownWidth*this.matureState;
        this.height = this.startHeight + this.grownHeight*this.matureState;
    }



    draw(ctx){
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.ang);
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.fillRect(-1,-1, this.width+2, this.height+2);
        ctx.fillStyle = this.color.toCSS();
        ctx.fillRect(0,0, this.width, this.height);
       
        ctx.restore();
    }

    pushDrawList() {
        drawRequests.push(new DrawRequest(this, this.depth, 0))
    }
    
    drawRequest(ctx, parameter) {
        this.draw(ctx);
    }
}




class PlantEnd extends PlantPart{
    constructor(x, y, xRat, yRat, ang, spr, sprImg, sprOffX, sprOffY, plant){
        super(x, y, xRat, yRat, ang, plant);
        this.sprite = spr;
        this.spriteImg = sprImg;
        this.sprOffX = sprOffX;
        this.sprOffY = sprOffY;
        this.sprScl = 1;
    }

    draw(ctx){
        this.sprite.drawExt(this.x, this.y, this.spriteImg, this.matureState*this.sprScl, this.matureState*this.sprScl, this.ang, this.sprOffX, this.sprOffY);
    }
}

class PlantBerry extends PlantEnd{
    constructor(x, y, xRat, yRat, ang, plant){
        super(x, y, xRat, yRat, ang, sprites[SPR.PLANTS], 0, 9, 2, plant);
        this.type = 2;
        this.sprScl = 2;
        this.depth = -1;

        this.angSpd = 0;

        this.matureSpd = 0.25;
    }

    update(dt, plant){
        this.updateParams(dt, plant);

        this.angSpd += dt*(-this.ang)/200;
        this.offAng += this.angSpd*dt;
        this.angSpd *= Math.pow(0.98, dt);
    }
}

class PlantFlower extends PlantEnd{
    constructor(x, y, xRat, yRat, ang, plant){
        super(x, y, xRat, yRat, ang, sprites[SPR.PLANTS], 1, 8, 8, plant);
        this.type = 2;
        this.sprScl = 2;
        this.depth = -1;

        this.angSpd = 0;

        this.matureSpd = 0.25;
    }

    update(dt, plant){
        this.updateParams(dt, plant);

        this.angSpd += dt*(-this.ang)/200;
        this.offAng += this.angSpd*dt;
        this.angSpd *= Math.pow(0.98, dt);
    }
}

class PlantTrunk extends PlantPart{
    constructor(x, y, xRat, yRat, ang, trunkGen, plant){
        super(x, y, xRat, yRat, ang, plant);
       

        this.children = [];

        this.type = 0;

        this.canHaveFruit = chance(plant.options.haveFruitChance);
        this.hasFruit = false;

        this.trunkGen = trunkGen;

        this.grownWidth = 10
        this.grownHeight = 100;
        this.startWidth = 1;
        this.startHeight = 1;

        this.width = this.startWidth;
        this.height = this.startHeight;
        this.color = new Color(0, 255, 0);

        this.growTickAlarm = new Alarm(0, 5);
    }

    pointInside(x,y){
        return isPointInsideRectangle(x, y, this.x, this.y, this.width, this.height, this.angle);
    }

    newTrunkChance(plant){
        return plant.options.trunkGrowChance - plant.options.trunkGrowChanceChildImpact*this.children.length;
    }

    createBranch(plant){
        if(chance(this.newTrunkChance(plant)) && this.trunkGen < plant.options.trunkGenMax){
            if(chance(plant.options.trunkBifurcateProb + plant.options.trunkBifurcateProbGenImpact*this.trunkGen)){
                var xx = 0;
                var yy = this.height;
                var spreadAng = plant.options.trunkBifurcateAngSpread;
                var axisAng = randRange(-plant.options.trunkChildAngSpread, plant.options.trunkChildAngSpread);

                var branch1 = new PlantTrunk(xx, yy, xx/this.width, yy/this.height, axisAng - spreadAng/2, this.trunkGen+1, plant);
                var branch2 = new PlantTrunk(xx, yy, xx/this.width, yy/this.height, axisAng + spreadAng/2, this.trunkGen+1, plant);
                
                plant.allParts.push(branch1);
                this.setChildParams(branch1);
                this.children.push(branch1);
                plant.allParts.push(branch2);
                this.setChildParams(branch2);
                this.children.push(branch2);
            } else {
                var dir = (chance(0.5) ? 1 : -1);
                var xx = 0;
                var yy = this.height;
                var ang = randRange(Math.PI/25, Math.PI/4)*dir

                var branch = new PlantTrunk(xx, yy, xx/this.width, yy/this.height, ang, this.trunkGen+1, plant);

                branch.canHaveFruit = chance(plant.options.haveFruitChance);
                plant.allParts.push(branch);
                this.setChildParams(branch);
                this.children.push(branch);
            }
        } else {
            if(!this.hasFruit){
                if(chance(this.trunkGen/4) && chance(0.2) && this.canHaveFruit){
                    this.hasFruit = true;
                    var xx = randRange(-this.width/2, this.width/2);
                    var yy = randRange(this.height*0.9, this.height);

                    var branch;
                    if(chance(0.5)){
                        branch = new PlantBerry(xx, yy, xx/this.width, yy/this.height, randRange(-Math.PI/8, Math.PI/8), plant);
                    } else {
                        branch = new PlantFlower(xx, yy, xx/this.width, yy/this.height, randRange(-Math.PI/8, Math.PI/8), plant);
                    }

                    plant.allParts.push(branch);
                    this.setChildParams(branch);
                    this.children.push(branch);
                }
            }
        }

    }


    update(dt, plant){
        this.updateParams(dt, plant);

        this.width  = this.startWidth + (this.grownWidth - plant.options.trunkGenWidImpact*this.trunkGen)*this.matureState;
        this.height = this.startHeight + (this.grownHeight - plant.options.trunkGenHeiImpact*this.trunkGen)*this.matureState;

        this.growTickAlarm.update(dt);
        if(this.growTickAlarm.finished){
            this.growTickAlarm.restart();
            this.createBranch(plant);
        }

        this.updateChildren(dt, plant);
    }

    setChildParams(child){
        child.parentResX = this.x + Math.cos(this.ang)*child.parentOffXRat*this.width - Math.sin(this.ang)*child.parentOffYRat*this.height;
        child.parentResY = this.y + Math.cos(this.ang)*child.parentOffYRat*this.height + Math.sin(this.ang)*child.parentOffXRat*this.width;
        child.parentResAng = this.ang + child.parentOffAng;
    }

    updateChildren(dt, plant){
        for(var i = 0; i < this.children.length; i++){
            var child = this.children[i];
            this.setChildParams(child);

            child.update(dt, plant);
        }
    }


    draw(ctx){
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.ang);
        // ctx.fillStyle = "rgb(255,255,255)";
        // ctx.fillRect(-1 -this.width/2,-1, this.width+2, this.height+2);
        ctx.fillStyle = this.color.toCSS();
       
        ctx.fillRect(-this.width/2,0, this.width, this.height);
        ctx.restore();
    }


    pushDrawList(){
        drawRequests.push(new DrawRequest(this, this.depth, 0));
        for(var i = 0; i < this.children.length; i++){
            var child = this.children[i];
            child.pushDrawList();
        }
    }
}

class ValueContainer{
    constructor(initVal, maxVal = initVal, minVal = initVal){
        this.val = initVal;
        this.maxVal = maxVal;
        this.minVal = minVal;
        
        this.variationAmp = 0;
    }

    get(){
        return randRange(this.minVal, this.maxVal) + randRange(-this.variationAmp, this.variationAmp);
    }
}

class PlantOptions{
    constructor(){
        this.trunkGenMax = 8;
        this.trunkMaxWid = 10;
        this.trunkGenWidImpact = 1;
        this.trunkMaxHei = 50;
        this.trunkGenHeiImpact = 8;

    
        this.trunkGrowChance = 0.4;
        this.trunkGrowChanceChildImpact = 0.2;

        this.trunkBifurcateProb = 0;
        this.trunkBifurcateProbGenImpact = 0.2;

        this.trunkBifurcateAngSpread = Math.PI/4;
        this.trunkChildAngSpread = Math.PI/3;



        this.haveFruitChance = 0.01; 

        this.matureTime = 10;
    }
}



class Plant{
    constructor(x, y, ang){
        this.x = x;
        this.y = y;
        this.ang = ang;

        this.options = new PlantOptions();
        

        this.parts = [new PlantTrunk(this.x, this.y, 1, 1, this.ang, 0, this)];

        this.allParts = [this.parts[0]];

        this.age = 0;

        this.creatingBranch = 0;
    }


    update(dt){
        for(var i = 0 ; i < this.parts.length; i++){
            var part = this.parts[i];
            part.update(dt, this);
        }

    }

    createRandomBranch(branchNum){
        this.creatingBranch = branchNum;
        for(var i = 0 ; i < this.parts.length; i++){
            var part = this.parts[i];
            part.createRandomBranch(this);
        }
        this.creatingBranch = 0;
    }

    pushDrawList(){
        for(var i = 0 ; i < this.parts.length; i++){
            var part = this.parts[i];
            part.pushDrawList();
        }
    }
}


class PlantManager{
    constructor(){
        this.plants = [];
        this.restartBut = new SpriteButton(-100, roomHeight*0.5 - 50, 100, 100, sprites[SPR.RESTART]);
    }

    restart(){
        this.plants = [];
        this.plants.push(new Plant(roomWidth/2, roomHeight, Math.PI));
    }

    update(dt){
        for(var i = 0 ; i < this.plants.length; i++){
            this.plants[i].update(dt);
        }
        this.restartBut.update(input.mouseX, input.mouseY, input.mouseState[0][0], input.mouseState[0][1]);
        if(this.restartBut.clicked){
            this.restart();
        }
    }
    pushDrawList(){
        for(var i = 0 ; i < this.plants.length; i++){
            this.plants[i].pushDrawList();
        }
    }
}