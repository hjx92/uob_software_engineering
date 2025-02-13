var screenHeight = 400;
var screenWidth  = 600;
var xGrid        = 11;
var yGrid        = 6;

function setup() {
  
  createCanvas(screenWidth, screenHeight);
  rectMode(CENTER);
  angleMode(DEGREES); // shall we use radians?
  
  tanks       = [];
  projectiles = [];
  
  gameMap     = new map();
  
  for (let i = 0; i < 2; i++) {
    tanks.push(new tank(i));
  }
}

function draw() {
  
  background(150);
  
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].move();
  }
  
  for (let i = 0; i < tanks.length; i++){
    tanks[i].move(i);
    for (let p = 0; p < projectiles.length; p++) {
      if(!tanks[i].destroyed &&
         tanks[i].detectHit(projectiles[p].positionX, projectiles[p].positionY)) {
        tanks[i].hit(i);
        projectiles.splice(p, 1);
        if(tanks[i].hitPoints <= 0) {
          tanks[i].destroy(i);
        }
      }
    }
  }
  
  gameMap.draw();
  
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].draw();
  }
  
  for (let i = 0; i < 2; i++) {
    tanks[i].draw(i);
  }
}

function keyPressed() {
  
  if (event.code === 'KeyQ'  && !tanks[0].destroyed) {
    projectiles.push(new projectile(0));
  }
  if (event.code === 'Space' && !tanks[1].destroyed) {
    projectiles.push(new projectile(1));
  }
}

class tank {
  
  constructor(playerNumber) {
    
    this.hitPoints   = 5;
    this.width       = 20;
    this.height      = 30;
    this.rotation    = Math.random() * 360;
    this.speedFactor = 2;
    this.pivotFactor = 2;
    this.destroyed   = false;
    this.debris      = [];
    
    this.colourRed   = playerNumber == 0 ? 255 : 0;
    this.colourGreen = 0;
    this.colourBlue  = playerNumber == 0 ? 0 : 255;
    
    let randX        = Math.random() * (screenWidth / 2) * 0.8;
    this.positionX   = playerNumber == 0 ? (screenWidth / 2) - randX : randX + (screenWidth / 2);
    this.positionY   = (Math.random() * screenHeight * 0.7) + (screenHeight * 0.1);
    
    this.incrementX  = sin(this.rotation) * this.speedFactor;
    this.incrementY  = cos(this.rotation) * this.speedFactor;
    
    this.calculateCorners();
    
  }
  
  calculateCorners() {
    
    let hW = this.width / 2;
    let hH = this.height / 2;
    let oX = this.positionX;
    let oY = this.positionY;
    let cosFunc = cos(this.rotation);
    let sinFunc = sin(this.rotation);
    
    // rotating corners around centre of rect
    // x' = x * cos(theta) - y * sin(theta) + x offset
    // y' = y * cos(theta) - x * sin(theta) + y offset
    
    this.aX = (((-hW * cosFunc) - (-hH * sinFunc))) + oX;
    this.aY = (((-hH * cosFunc) + (-hW * sinFunc))) + oY;
    this.bX = ((( hW * cosFunc) - (-hH * sinFunc))) + oX;
    this.bY = (((-hH * cosFunc) + ( hW * sinFunc))) + oY;
    this.cX = ((( hW * cosFunc) - ( hH * sinFunc))) + oX;
    this.cY = ((( hH * cosFunc) + ( hW * sinFunc))) + oY;
    this.dX = (((-hW * cosFunc) - ( hH * sinFunc))) + oX;
    this.dY = ((( hH * cosFunc) + (-hW * sinFunc))) + oY;
    
  }
  
  draw(playerNumber) {
    
    if (this.destroyed) {
      for (let i = 0; i < this.debris.length; i++) {
        this.debris[i].move();
        this.debris[i].draw();
      }
    } else {
      fill(this.colourRed, this.colourGreen, this.colourBlue);

      push();
      translate(this.positionX, this.positionY);
      rotate(this.rotation);
      rect(0, 0, this.width, this.height);
      pop();

      let hitPointDisplayX = !playerNumber ? 40 : screenWidth - 40;
      let hitPointDisplayY = screenHeight * 0.9;
      for(let i = 0; i < this.hitPoints; i++) {
        rect(hitPointDisplayX, hitPointDisplayY, 5, 20);
        !playerNumber ? hitPointDisplayX += 10 : hitPointDisplayX -= 10;
      }
    }
  }
  
  move(playerNumber) {
    
    // foward move, back move, counter-clockwise pivot, and clockwise pivot
    // in that order - key codes are not self-documenting...
    
    if(keyIsDown(playerNumber == 0 ? 87 : 38)) {
        this.positionX    += this.incrementX;
        this.positionY    -= this.incrementY;
    } if(keyIsDown(playerNumber == 0 ? 83 : 40)) {
        this.positionX    -= this.incrementX;
        this.positionY    += this.incrementY;
    } if(keyIsDown(playerNumber == 0 ? 65 : 37)) {
        this.rotation      = (this.rotation - this.pivotFactor) % 360;
        this.incrementX    = sin(this.rotation) * this.speedFactor;
        this.incrementY    = cos(this.rotation) * this.speedFactor;
    } if(keyIsDown(playerNumber == 0 ? 68 : 39)) {
        this.rotation      = (this.rotation + this.pivotFactor) % 360;
        this.incrementX    = sin(this.rotation) * this.speedFactor;
        this.incrementY    = cos(this.rotation) * this.speedFactor;
    }
    
    this.calculateCorners();
  }
  
  detectHit(pX, pY) {
    
    // don't fully understand the math behind this,
    // formula found on StackExchange...
    
    if ((this.bX - this.aX) * (pY - this.aY) - 
        (pX - this.aX) * (this.bY - this.aY) >= 0 &&
        (this.cX - this.bX) * (pY - this.bY) - 
        (pX - this.bX) * (this.cY - this.bY) >= 0 &&
        (this.dX - this.cX) * (pY - this.cY) - 
        (pX - this.cX) * (this.dY - this.cY) >= 0 &&
        (this.aX - this.dX) * (pY - this.dY) - 
        (pX - this.dX) * (this.aY - this.dY) >= 0) {
      return true;
    } else return false;
  }
  
  hit(playerNumber) {
    
    this.colourRed    += playerNumber == 0 ? 0 : 15 * this.hitPoints;
    this.colourGreen  += 15 * this.hitPoints;
    this.colourBlue   += playerNumber == 0 ? 15 * this.hitPoints : 0;
    
    this.hitPoints--;
    
  }
  
  destroy(playerNumber) {
    this.destroyed = true;
    for (let i = 0; i < 500; i++) {
      this.debris.push(new particle(playerNumber));
    }
  }
}

class projectile {
  
  constructor(playerNumber) {
    
    this.angle       = tanks[playerNumber].rotation;
    this.speedFactor = tanks[playerNumber].speedFactor * 2;
    
    this.incrementX  = sin(this.angle) * this.speedFactor;
    this.incrementY  = cos(this.angle) * this.speedFactor;
    this.positionX   = tanks[playerNumber].positionX + (sin(this.angle) * ((tanks[playerNumber].width / 2) + this.speedFactor));
    this.positionY   = tanks[playerNumber].positionY - (cos(this.angle) * ((tanks[playerNumber].height / 2) + this.speedFactor));
  }
  
  move() {
    
    this.positionX += this.incrementX;
    this.positionY -= this.incrementY;
    
    // Highly CRAPPY bouncing mechanism that simply checks
    // if a projectile is within a seven pixel range of a possible
    // wall location, and then checks the gameMap grid to see if a
    // relevant wall exists. Convoluted code block in each to protect
    // against accidentally checking out-of-bounds gameMap grids, but
    // it still sometimes crashes...
    
    let xTest = (this.positionX - 25) % 50;
    let yTest = (this.positionY - 25) % 50;
    
    if (xTest <= 3) {
      
      let xWall = Math.floor((this.positionX - 25) / 50);
      let yWall = Math.floor((this.positionY - 25) / 50);
      
      if (xWall < 0) {
        xWall = 0;
      } if (xWall > xGrid) {
        xWall = xGrid;
      } if (yWall < 0) {
        yWall = 0;
      } if (yWall > yGrid) {
        yWall = yGrid;
      }
      
      if (gameMap.verticalWalls[xWall][yWall].exists) {
        this.incrementX = -this.incrementX;
      }
      
    } else if (xTest >= 47) {
      
      let xWall = Math.floor((this.positionX - 25) / 50) + 1;
      let yWall = Math.floor((this.positionY - 25) / 50);
      
      if (xWall < 0) {
        xWall = 0;
      } if (xWall > xGrid) {
        xWall = xGrid;
      } if (yWall < 0) {
        yWall = 0;
      } if (yWall > yGrid) {
        yWall = yGrid;
      }
      
      if (gameMap.verticalWalls[xWall][yWall].exists) {
        this.incrementX = -this.incrementX;
      }
    }
    
    if (yTest <= 3) {
      
      let yWall = Math.floor((this.positionY - 25) / 50);
      let xWall = Math.floor((this.positionX - 25) / 50);
      
      if (xWall < 0) {
        xWall = 0;
      } if (xWall > xGrid) {
        xWall = xGrid;
      } if (yWall < 0) {
        yWall += 1;
      } if (yWall > yGrid) {
        yWall -= 1;
      }
      
      if (gameMap.horizontalWalls[xWall][yWall].exists) {
        this.incrementY = -this.incrementY;
      }
      
    } else if (yTest >= 47) {
      
      let yWall = Math.floor((this.positionY - 25) / 50) + 1;
      let xWall = Math.floor((this.positionX - 25) / 50);
      
      if (xWall < 0) {
        xWall += 1;
      } if (xWall > xGrid) {
        xWall -= 1;
      } if (yWall < 0) {
        yWall += 1;
      } if (yWall > yGrid) {
        yWall -= 1;
      }
      
      if (gameMap.horizontalWalls[xWall][yWall].exists) {
        this.incrementY = -this.incrementY;
      }
    }
  }
  
  draw() {
    
    fill(0);
    circle(this.positionX, this.positionY, 5);
  }
  
}

class particle {
  
  constructor(playerNumber) {
    
    this.size        = Math.random() * 15;
    this.speedFactor = (Math.random() * 20) + 5;
    this.angle       = Math.random() * 360;
    
    this.positionX   = tanks[playerNumber].positionX;
    this.positionY   = tanks[playerNumber].positionY;
    this.incrementX  = sin(this.angle) * this.speedFactor;
    this.incrementY  = cos(this.angle) * this.speedFactor;
    
    let randomColour = Math.random() * 100;
    
    this.colourRed   = playerNumber == 0 ? 255 : randomColour;
    this.colourGreen = randomColour;
    this.colourBlue  = playerNumber == 0 ? randomColour : 255;
  }
  
  move() {
    
    this.positionX += this.incrementX;
    this.positionY += this.incrementY;
  }
  
  draw() {
    
    fill(this.colourRed, this.colourGreen, this.colourBlue);
    circle(this.positionX, this.positionY, this.size);
  }
}

class map {
  
  constructor() {
    this.tiles = [];
    for (let x = 0; x < xGrid; x++) {
      this.tiles.push([]);
      for (let y = 0; y < yGrid; y++) {
        this.tiles[x].push(new floorTile(x, y));
      }
    }
    
    this.verticalWalls = [];
    for (let x = 0; x <= xGrid; x++) {
      this.verticalWalls.push([]);
      for (let y = 0; y < yGrid; y++) {
        this.verticalWalls[x].push(new wall(x, y, 0));
      }
    }
    
    this.horizontalWalls = [];
    for (let x = 0; x < xGrid; x++) {
      this.horizontalWalls.push([]);
      for (let y = 0; y <= yGrid; y++) {
        this.horizontalWalls[x].push(new wall(x, y, 1));
      }
    }
  }
  
  draw() {
    
    for (let x = 0; x < this.tiles.length; x++) {
      for (let y = 0; y < this.tiles[x].length; y++) {
        this.tiles[x][y].draw();
      }
    }
    
    for (let x = 0; x < this.horizontalWalls.length; x++) {
      for (let y = 0; y < this.horizontalWalls[x].length; y++) {
        this.horizontalWalls[x][y].draw();
      }
    }
    
    for (let x = 0; x < this.verticalWalls.length; x++) {
      for (let y = 0; y < this.verticalWalls[x].length; y++) {
        this.verticalWalls[x][y].draw();
      }
    }
  }
}

class wall {
  
  constructor(x, y, horizontal) {
    
    // hideously convoluted constructor...
    
    if (horizontal) {
      this.width         = 50;
      this.height        = 5;
      this.positionX     = 50 + (50 * x);
      this.positionY     = 25 + (50 * y);
      if (y == 0 || y == yGrid) {
        this.exists      = true;
      } else if (Math.random() < 0.2) {
        this.exists      = true;
      } else this.exists = false;
    } else {
      this.width         = 5;
      this.height        = 50;
      this.positionX     = 25 + (50 * x);
      this.positionY     = 50 + (50 * y);
      if (x == 0 || x == xGrid) {
        this.exists      = true;
      } else if (Math.random() < 0.1) {
        this.exists      = true;
      } else this.exists = false;
    }
  }
  
  draw() {
    if(this.exists) {
      fill(0);
      rect(this.positionX, this.positionY, this.width, this.height);
    }
  }
}

class floorTile {
  
  constructor(x, y) {
    
    this.width     = 50;
    this.height    = 50;
    this.standing  = true;
    
    this.positionX = 50 + (this.width * x);
    this.positionY = 50 + (this.height * y);
    
    // creates alternating "chessboard" pattern for tiles
    
    if (x % 2 == 0) {
      if (y % 2 == 0) {
        this.colour = 240;
      } else this.colour = 220;
    } else {
      if (y % 2 == 0) {
        this.colour = 220;
      } else this.colour = 240;
    }
  }
  
  draw() {
    
    if (this.standing) {
      fill(this.colour);
      rect(this.positionX, this.positionY, this.width, this.height);
    }
  }
}

class gameState {
  
}