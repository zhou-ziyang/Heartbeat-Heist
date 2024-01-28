// Code to upload to Bangle.js
// var BANGLE_CODE = `
// Bangle.on('accel',function(a) {
//   var d = [
//     "A",
//     Math.round(a.x*100),
//     Math.round(a.y*100),
//     Math.round(a.z*100)
//     ];
//   Bluetooth.println(d.join(","));
// })
// `;

var BANGLE_CODE = `
Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);

const radius = 6;
const offset = 10;
const r_step = 15;
let level = 0;
let step = 0;
let correctSteps = 0;

// Targets array
let targets = [8, 5, 11, 16];
let angles = [120, 75, 165, 240];

// Orders 2D array
let orders = [
    [0, 3, 1, 2],
    [2, 3, 0, 1],
    [0, 1, 2, 3],
    [1, 3, 2, 0]
];

function draw_arrow() {
  //g.drawPoly([120, 40, 120, 70, 140, 55]);
  //g.fillPoly([120, 40, 120, 70, 140, 55]);
  //g.setColor(0,0,0)
  //g.drawPoly([110, 40, 110, 70, 130, 55]);
  //g.fillPoly([110, 40, 110, 70, 130, 55]);
  //g.setColor(255,255,255)
  g.setFontAlign(0,0);
  g.setFont("Vector",20);
  g.drawString("SWIPE ->", g.getWidth()/2, 80);
}

function draw_handle(angle) {
  let x = 140 * Math.sin(Math.PI * 2 * angle / 360) + 120;
  let y = 140 * Math.cos(Math.PI * 2 * angle / 360) + 300;
  g.fillCircle(x, y, radius);
}

function draw_handles(angle) {
  const number = 18;
  for (i = 0; i < number; i++) {
    const angle_handle = i * (360 / number) + angle;
    draw_handle(angle_handle);
  }
}

function draw(angle) {
  g.clear();
  draw_arrow();
  g.drawCircle(120, 300, 120);
  draw_handles(angle);
}

function clockwise() {
  angle = (angle + r_step + 360) % 360;
  draw(angle);
}

function counterclockwise() {
  angle = (angle - r_step + 360) % 360;
  draw(angle);
}

function stepUp(){
    step = step + 1;
    if (step > 3) {
        step = 0;
        level++;
        angle = 0;
        if (level > 3){
          msg = ["W", "win"];
          Bluetooth.println(msg.join(","));
        }
        else if (correctSteps > 3){
          msg = ["LP", level];
          Bluetooth.println(msg.join(","));
        }
        else {
          msg = ["LF", level];
          Bluetooth.println(msg.join(","));
        }
    }
}

function stepUpPass(){
    correctSteps++;
}

g.clear();
g.drawCircle(120, 300, 120);
let angle  = 0;
draw_handles(angle);
draw_arrow();
//const interval = setInterval(countDown, 100);

Bangle.on('swipe', function(directionLR) {
    if (directionLR == 1) {
        clockwise();
    } else if (directionLR == -1) {
        counterclockwise();
    }
    
    console.log("Step: " + step);  
    console.log("Level: " + level);
    let i = orders[level][step];
    let target = angles[i];
    console.log("Target: " + target);
    console.log("Angle: " + angle);
    let freq;
    let dur;
    let inten;
    if (target == angle) {
        dur = 200 - (level * 100);
        inten = 1.0 - (level * 0.1);
        freq = 2000 + (level * 1000);
    }
    else {
        dur = 150;
        inten = 0.2;
        freq = 7000;
    }
    // if (sound) {
    //   console.log("beep");
    //   Bangle.beep(dur, freq);
    // }
    Bangle.buzz(dur, inten);
    Rmsg = ["R", angle, freq / 15];
    Bluetooth.println(Rmsg.join(","));
});

setWatch(() => {
    msg = ["P", "button"];
    Bluetooth.println(msg.join(","));
    let k = orders[level][step];
    let t = angles[k];
    // let a = Math.abs(angle) - r_step
    // if (t == (Math.abs(a) % 360)) {
    //   stepUpPass();
    // }
    if (t == angle) {
      stepUpPass();
    }
    stepUp();
    //setTimeout(()=>g.clear(), 1000);
  }, BTN2, {repeat:true});

Bangle.setHRMPower(1);
Bangle.on('HRM',function(hrm) {
  let d = [
    "H",
    hrm.bpm,
    hrm.confidence
    ];
  Bluetooth.println(d.join(","))});
`

const WIN_CODE = `
Bangle.setLCDPower(1);
g.clear();
g.setFontAlign(0,0);
g.setFont("Vector",80);
g.drawString("WIN", g.getWidth()/2, g.getHeight()/2);
Bangle.setLCDPower(1);
`

// When we click the connect button...
window.onload = function () {
    var connection;
    document.getElementById("btnConnect").addEventListener("click", function () {
        // disconnect if connected already
        if (connection) {
            connection.close();
            connection = undefined;
        }
        // Connect
        Puck.connect(function (c) {
            if (!c) {
                alert("Couldn't connect!");
                return;
            }
            connection = c;
            // Handle the data we get back, and call 'onLine'
            // whenever we get a line
            var buf = "";
            connection.on("data", function (d) {
                buf += d;
                var l = buf.split("\n");
                buf = l.pop();
                l.forEach(onLine);
            });
            // First, reset the Bangle
            connection.write("reset();\n", function () {
                // Wait for it to reset itself
                setTimeout(function () {
                    // Now upload our code to it
                    // let sound = document.getElementById("sound").checked;
                    // console.log("Sound: " + sound);
                    connection.write("\x03\x10if(1){" + BANGLE_CODE + "}\n",
                        function () {
                            console.log("Ready...");
                        });
                }, 1500);
            });
        });
    });

// When we get a line of data, check it and if it's
// from the accelerometer, update it
    function onLine(line) {
        console.log(line);
        let gameLevel;

        var d = line.split(",");
        if (d.length === 3 && d[0] === "R") {
            // we have an accelerometer reading
            var gameAngle = parseInt(d[1]);
            gameInstance.SendMessage('Game', 'Rotate', -gameAngle);
            var freq = parseInt(d[2]);
            gameInstance.SendMessage('Game', 'PlayTone', freq);
        } else if (d.length === 3 && d[0] === "H") {
            // we have an accelerometer reading
            var hrm = parseInt(d[1]);
        } else if (d[0] === "LP") {
            gameLevel = parseInt(d[1]);
            console.log("Game Level: " + gameLevel);
            gameInstance.SendMessage('Game', 'PassTo', gameLevel);
        } else if (d[0] === "LF") {
            gameLevel = parseInt(d[1]);
            console.log("Game Level: " + gameLevel);
            gameInstance.SendMessage('Game', 'FailTo', gameLevel);
        } else if (d[0] === "P") {
            gameInstance.SendMessage('Game', 'Confirm');
        } else if (d[0] === "W") {
            // if (d[0] === "win") {
            gameInstance.SendMessage('Game', 'Finish', 1);
            connection.write("\x03\x10if(1){" + WIN_CODE + "}\n", function () {});
            // }
        }

        // document.getElementById("hrm").innerHTML = "HRM: " + hrm;
    }
}
