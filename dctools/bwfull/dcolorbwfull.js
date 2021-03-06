/* Written in p5.js (https://p5js.org/)
 * Under Creative Commons License
 * https://creativecommons.org/licenses/by-sa/4.0/
 * Written by Juan Carlos Ponce Campuzano, 12-Nov-2018
 */

// Last update 21-Nov-2019

// --Control variables--
let clts = {

  lvlCurv: 'Modulus',

  //sharp = 1/3;
  nContour: 10,

  displayXY: false,
  size: 2.5,
  centerX: 0,
  centerY: 0,

  Save: function() {
    save('plotfz.png');
  },

  canvasSize: 'Square'

};

let input, domC;

function setup() {
  createCanvas(470, 470);
  colorMode(HSB, 1);
  smooth();
  pixelDensity(1);
  noLoop();

  uiControls();
}

function draw() {

  background(255);

  //domainColoring( function, |Re z|, center x, center y, canvasSize text, axis boolean);
  domC = new domainColoring(input.value(), clts.size, clts.centerX, clts.centerY, clts.canvasSize, clts.displayXY);

  domC.plotter();

}

// --Coloring the pixels--
// First I need to define the functions to color each pixel

let funPhase = (x, y) => (PI - atan2(y, -x)) / (2 * PI);

function funRe(x, y) {
  realComp = x;
  let bwRe;
  if (((round(clts.nContour / 5) * realComp - floor(round(clts.nContour / 5) * realComp))) < 0.5) {
    bwRe = 1;
  } else {
    bwRe = -1;
  }
  return bwRe;
}

function funIm(x, y) {
  imComp = y;
  let bwIm;
  if (((round(clts.nContour / 5) * imComp - floor(round(clts.nContour / 5) * imComp))) < 0.5) {
    bwIm = 1;
  } else {
    bwIm = -1;
  }
  return bwIm;
}

function sat(x, y) {
  let satAux = log(sqrt(x * x + y * y)) / log(2);
  let bw;
  if (((round(clts.nContour / 7) * satAux - floor(round(clts.nContour / 7) * satAux))) < 0.5) {
    bw = 1;
  } else {
    bw = -1;
  }
  return bw;
}

function val(x, y) {
  let valAux = round(clts.nContour) * funPhase(x, y);
  let bwval;
  if (((valAux - floor(valAux))) < 0.5) {
    bwval = 1;
  } else {
    bwval = -1;
  }
  return bwval;
}

let funColor = (x, y) => sat(x, y);

//Class for domain coloring
class domainColoring {

  constructor(fn, size, cX, cY, canvasSize, axis) {
    this.fn = fn;
    this.size = size;
    this.cX = cX;
    this.cY = cY;
    this.canvasSize = canvasSize;
    this.axis = axis;
  }

  plotter() {

    let z = trimN(this.fn);
    let parsed = complex_expression(z); //Define function

    // Establish a range of values on the complex plane

    // It all starts with the width, try higher or lower values
    let w = this.size * 2;
    let h = (w * height) / width;

    // Start at negative half the width and height
    let xmin = -w / 2 + this.cX;
    let ymin = -h / 2 - this.cY;

    // Make sure we can write to the pixels[] array.
    // Only need to do this once since we don't do any other drawing.
    loadPixels();

    // x goes from xmin to xmax
    let xmax = xmin + w;
    // y goes from ymin to ymax
    let ymax = ymin + h;

    // Calculate amount we increment x,y for each pixel
    let dx = (xmax - xmin) / (width);
    let dy = (ymax - ymin) / (height);
    let xr, yr;

    // Start y
    let y = ymin;
    for (let j = 0; j < height; j++) {
      // Start x
      let x = xmin;
      for (let i = 0; i < width; i++) {

        let vz = {
          r: x,
          i: -y
        }; //Here we need minus since the y-axis in canvas is upside down

        let w = parsed.fn(vz); //Evaluate function

        // We color each pixel based on some cool function
        // Gosh, we could make fancy colors here if we wanted

        let xv = w.r;
        let yv = w.i;

        if (xv < 0.5) {
          xr = xv;
          xr = 1;
        } else {
          xr = -1;
        }
        if (yv < 0.5) {
          yr = yv;
          yr = 1;
        } else {
          yr = -1;
        }


        let h = funColor(xv, yv);

        //let b = sat(x, y);
        set(i, j, color(1, 0, h));

        x += dx;
      }
      y += dy;
    }

    updatePixels();

    if (this.axis == true) {
      this.grid();
    }

  } //ends plot

  grid() {
    stroke(1, 1, 1);
    strokeWeight(2);
    line(0, height / 2, width, height / 2); //x-axis
    line(width / 2, 0, width / 2, height); //y-axis


    let w = this.size;
    let h = (w * height) / width;

    let txtsize;
    let txtStroke;

    if (this.canvasSize == 'Square' && w >= 1) {
      txtsize = 17;
      txtStroke = 3;
    } else if (this.canvasSize == 'Square' && w < 1) {
      txtsize = 13;
      txtStroke = 3;
    } else if (this.canvasSize == 'Landscape') {
      txtsize = 18;
      txtStroke = 4;
    } else if (this.canvasSize == 'Full-Screen') {
      txtsize = 20;
      txtStroke = 4;
    }

    strokeWeight(txtStroke);
    textSize(txtsize);

    fill(1);
    text('(' + this.cX + ',' + this.cY + ')', width / 2 + 2, height / 2 + 15);

    let valxPos, valxNeg, valyPos, valyNeg, dec;

    if (1 <= w) {
      dec = 10.0;
    } else if (0.01 <= w && w < 1) {
      dec = 1000.0;
    } else if (0.001 <= w && w < 0.01) {
      dec = 10000.0;
    }
    if (0.0001 <= w && w < 0.001) {
      dec = 100000.0;
    } else if (0.00001 <= w && w < 0.0001) {
      dec = 1000000.0;
    }
    let r = 5; //radius
    let sr = 4 //position of numbers


    for (let i = w / 4; i <= w; i += w / 4) {

      valxPos = map(i, 0, w, width / 2, width);
      valxNeg = map(i, 0, w, width / 2, 0);
      ellipse(valxPos, height / 2, r, r); //pos x
      ellipse(valxNeg, height / 2, r, r); //neg x
      text('' + str(round((i + this.cX) * dec) / dec), valxPos, height / 2 - sr + 19); //X-Positive
      text('' + str(round((this.cX - i) * dec) / dec), valxNeg, height / 2 - sr + 19); //X-negative

    }

    for (let j = h / 4; j <= h; j += h / 4) {

      valyPos = map(j, 0, h, height / 2, 0);
      valyNeg = map(j, 0, h, height / 2, height);
      ellipse(width / 2, valyPos, r, r); //pos y
      ellipse(width / 2, valyNeg, r, r); //neg y
      text('' + str(round((j + this.cY) * dec) / dec) + 'i', width / 2 - sr + 9, valyPos); //Y-Positive
      text('' + str(round((this.cY - j) * dec) / dec) + 'i', width / 2 - sr + 9, valyNeg); //Y-negative

    }


  } //ends grid

}



// Auxiliary functions
function uiControls() {
  // create gui (dat.gui)
  let gui = new dat.GUI({
    width: 360
  });
  gui.add(clts, 'lvlCurv', ['Phase', 'Modulus', 'Phase/Modulus', 'Real-component', 'Imaginary-component', 'Re/Im']).name("Mode:").onChange(mySelectOption);

  gui.add(clts, 'nContour', 4, 30).step(2).name("Level curves").onChange(keyPressed);
  gui.add(clts, 'size', 0.00001, 15).name("|Re z| <").onChange(keyPressed);
  gui.add(clts, 'Save').name("Save (png)");

  gui.add(clts, 'displayXY').name("Axes").onChange(redraw);
  gui.add(clts, 'centerX').name("Center x =").onChange(keyPressed);
  gui.add(clts, 'centerY').name("Center y =").onChange(keyPressed);
  gui.add(clts, 'canvasSize', ['Square', 'Landscape', 'Full-Screen']).name("Size: ").onChange(screenSize);
  gui.close();


  input = createInput('z+1/z');
  //input.size(200, 20);
  input.addClass('body');
  input.addClass('container');
  input.addClass('full-width');
  input.addClass('dark-translucent');
  input.addClass('input-control');
  //input.addClass('equation-input');
  input.attribute('placeholder', 'Input complex expression, e.g. 1/(z^2 + iz)^2 - log(z)');
  input.style('color: #ffffff');
}

function trimN(s) {
  if (s.trim) {
    return s.trim();
  }
  return s.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function mySelectOption() {
  if (clts.lvlCurv == 'Phase') {
    funColor = (x, y) => val(x, y);
  } else if (clts.lvlCurv == 'Modulus') {
    funColor = (x, y) => sat(x, y);
  } else if (clts.lvlCurv == 'Phase/Modulus') {
    funColor = (x, y) => val(x, y) * sat(x, y);
  } else if (clts.lvlCurv == 'Real-component') {
    funColor = (x, y) => funRe(x, y);
  } else if (clts.lvlCurv == 'Imaginary-component') {
    funColor = (x, y) => funIm(x, y);
  } else if (clts.lvlCurv == 'Re/Im') {
    funColor = (x, y) => funRe(x, y) * funIm(x, y);
  }
  redraw();
}

function screenSize() {
  if (clts.canvasSize == 'Square') {
    resizeCanvas(470, 470);
  } else if (clts.canvasSize == 'Landscape') {
    resizeCanvas(750, 550);
  } else if (clts.canvasSize == 'Full-Screen') {
    resizeCanvas(windowWidth, windowHeight);
  }
}


function keyPressed() {
  if (keyCode === ENTER) {
    redraw();
  }
}
