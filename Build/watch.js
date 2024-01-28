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
let passedLevels = 0;
const LEVELS = 4;
const STEPS = 4;

// Targets array
let targets = [8, 5, 11, 16];
let angles = [120, 75, 165, 240];

let redo = 0;
const MAX_REDO = 2;

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

function levelUp() {

}

function levelUpPass(){
    passedLevels++;
}

function stepUp(){
    redo = 0;
    if (step == STEPS - 1) {
        if (level == LEVELS - 1){
            if (correctSteps >= STEPS && passedLevels >= LEVELS - 1) {
                msg = ["MSG", "Finish", level, step, 1];
                Bluetooth.println(msg.join(","));
            }
            else {
                msg = ["MSG", "Finish", level, step, 0];
                Bluetooth.println(msg.join(","));
            }
        }
        else {
            if (correctSteps >= STEPS) {
                msg = ["MSG", "PassUp", level, step];
                Bluetooth.println(msg.join(","));
                levelUpPass();
            }
            else {
                msg = ["MSG", "FailUp", level, step];
                Bluetooth.println(msg.join(","));
            }
        }
        level++;
        angle = 0;
        draw(angle);
    }
    step = (step + 1) % STEPS;
}

function stepUpPass(){
    correctSteps++;
    msg = ["MSG", "Result", level, step, 1];
    Bluetooth.println(msg.join(","));
}

g.clear();
g.drawCircle(120, 300, 120);
let angle  = 0;
draw_handles(angle);
draw_arrow();
//const interval = setInterval(countDown, 100);

function swipeEvent() {
    console.log("Step: " + step);  
    console.log("Level: " + level);
    let i = orders[level][step];
    let target = angles[i];
    console.log("Target: " + target);
    console.log("Angle: " + angle);
    let freqs = [6000, 6500, 6850, 6920]
    let freq;
    let dur;
    let inten;
    if (target == angle) {
        dur = 200 - (level * 100);
        inten = 1.0 - (level * 0.1);
        freq = 6700 + (level * 75);
    }
    else {
        dur = 150;
        inten = 0.2;
        freq = 7000;
    }
    if (buzz) {
        Bangle.buzz(dur, inten);
    }
    Rmsg = ["MSG", "R", level, step, angle, freq / 15];
    Bluetooth.println(Rmsg.join(","));
}

Bangle.on('swipe', function(directionLR) {
    if (directionLR == 1) {
        clockwise();
        swipeEvent();
        redo = Math.min(MAX_REDO, redo + 1);
    } else if (directionLR == -1 && redo > 0) {
        counterclockwise();
        swipeEvent()
        redo = Math.max(0, redo - 1)
    }
    

});

setWatch(() => {
    msg = ["MSG", "P", "button"];
    Bluetooth.println(msg.join(","));
    if (level < LEVELS && step < STEPS) {
        let k = orders[level][step];
        let t = angles[k];
        if (t == angle) {
            stepUpPass();
        }
        else { 
            msg = ["MSG", "Result", level, step, 0];
            Bluetooth.println(msg.join(","));
        }
        stepUp();
    }
  }, BTN2, {repeat:true});

Bangle.setHRMPower(1);
Bangle.on('HRM',function(hrm) {
  let d = [
    "MSG",
    "H",
    level,
    step,
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

const LOSE_CODE = `
Bangle.setLCDPower(1);
g.clear();
g.setFontAlign(0,0);
g.setFont("Vector",80);
g.drawString("OOPS", g.getWidth()/2, g.getHeight()/2);
Bangle.setLCDPower(1);
`

const READY_CODE = `
Bangle.setLCDPower(1);
g.clear();
g.setFontAlign(0,0);
g.setFont("Vector",70);
g.drawString("READY...", g.getWidth()/2, g.getHeight()/2);
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
                    let buzz = document.getElementById("buzz").checked;
                    console.log("Buzz: " + buzz);
                    connection.write("\x03\x10if(1){" + "let buzz = " + buzz + ";" + BANGLE_CODE + "}\n",
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
        let levelStep;

        var d = line.split(",");
        if (d[1] === "R") {
            gameLevel = parseInt(d[2]);
            levelStep = parseInt(d[3]);
            var gameAngle = parseInt(d[4]);
            gameInstance.SendMessage('Game', 'Rotate', -gameAngle);
            var freq = parseInt(d[5]);
            gameInstance.SendMessage('Game', 'PlayTone', freq);
            log(gameLevel + "," + levelStep + "," + "Action,R");
        } else if (d[1] === "H") {
            gameLevel = parseInt(d[2]);
            levelStep = parseInt(d[3]);
            var hrm = parseInt(d[4]);
            log(gameLevel + "," + levelStep + ",HRM," + hrm);
        } else if (d[1] === "PassUp") {
            gameLevel = parseInt(d[2]);
            levelStep = parseInt(d[3]);
            console.log("Level " + gameLevel + " Failed. Level up.");
            gameInstance.SendMessage('Game', 'PassTo', gameLevel + 1);
        } else if (d[1] === "FailUp") {
            gameLevel = parseInt(d[2]);
            levelStep = parseInt(d[3]);
            console.log("Level " + gameLevel + " Failed. Level up.");
            gameInstance.SendMessage('Game', 'FailTo', gameLevel + 1);
        } else if (d[1] === "Result") {
            gameLevel = parseInt(d[2]);
            levelStep = parseInt(d[3]);
            const result = parseInt(d[4]);
            console.log("Result: " + result);
            log(gameLevel + "," + levelStep + ",Result," + result);
        } else if (d[1] === "P") {
            gameInstance.SendMessage('Game', 'Confirm');
        } else if (d[1] === "Finish") {
            gameLevel = parseInt(d[2]);
            levelStep = parseInt(d[3]);
            const win = parseInt(d[4]);
            console.log("WIN? " + win)
            gameInstance.SendMessage('Game', 'Finish', win);
            if (win === 1) {
                connection.write("\x03\x10if(1){" + WIN_CODE + "}\n", function () {});
            } else {
                connection.write("\x03\x10if(1){" + LOSE_CODE + "}\n", function () {});
            }
        }

        // document.getElementById("hrm").innerHTML = "HRM: " + hrm;
    }
}
