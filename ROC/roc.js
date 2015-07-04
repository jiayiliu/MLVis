// Control parameters
var color1 = "blue"; // color for sample 1
var color2 = "green"; // color for sample 2

// Global variables
var n1; // number of sample 1
var n2; // number of sample 2
var xcut;  // cutting position
var distance; // distance between two samples
var sample = new Array(); // array to store samples
var rocpoints = new Array(); // array to store roc curve

var g = d3.select("#figure").select("svg");
var roc = d3.select("#ROCfigure").select("svg");
var width = setWidth();
var height = width/2;
var leftBoundary = 100;
var rightBoundary = 100;

/* ******** Main Functions ********* */
g.style("width", width).style("height",height);
generateSample();

/* ******** Updating Functions ******** */
// update figure size
$(window).resize(function(){
  // Set figure size
  width = setWidth();
  height = width/2;
  g.style("width", width).style("height", height);
  // set the left and right boundary for class
  leftBoundary = 100;
  rightBoundary = 100;
  // re-draw figure
  generateSample();
})

// Create two samples by specifying the numbers for each and the distance between them
function createSample(n1, n2, distance) {
    var cx1 = leftBoundary + (width - leftBoundary - rightBoundary - distance) / 2;
    var cx2 = width - rightBoundary - (width - leftBoundary - rightBoundary - distance) / 2;
    console.log(cx1);
    console.log(cx2);
    var cy = height/2;
    var sdr = width/4;
    var d1 = gauss2D(n1, cx1, cy, sdr, color1);
    var d2 = gauss2D(n2, cx2, cy, sdr, color2);
    return d1.concat(d2);
}

// Interaction
function generateSample() {
    n1 = document.getElementById("number1").value;
    n2 = document.getElementById("number2").value;
    distance = document.getElementById("distanceInput").value;
    xcut = document.getElementById("xcutInput").value * width /100.;
    sample = createSample(n1, n2, distance);
    // Create a plot of distribution
    g.selectAll("circle").remove();
    g.selectAll("circle").data(sample)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
        return d.x
    })
        .attr("cy", function (d) {
        return d.y
    })
        .attr("fill", function (d) {
        return d.color
    })
        .attr("stock", "black")
        .attr("r", 3);
    g.select("line").attr("x1", xcut).attr("y1", 0).attr("x2", xcut).attr("y2", height);
    //reset ROC
    rocpoints = [];
    roc.selectAll("circle").remove();
}

// ROC construction
function xcutChange(){
    xcut = document.getElementById("xcutInput").value * width / 100.;
    // change the line in distribution
    g.select("line").attr("x1", xcut).attr("y1", 0).attr("x2", xcut).attr("y2", height);
    // draw new data
    if(rocpoints.length < 50){
        rocpoints.push({y:calcSensitivityPosY(sample), x:calcSpecificityPosX(sample)});
        roc.selectAll("circle")
        .data(rocpoints).enter()
        .append("circle")
        .attr("cx",function(d){return d.x;})
        .attr("cy",function(d){return d.y;})
        .attr("r",2).attr("fill","green");
    } else {
        rocpoints.shift();
        roc.selectAll("circle").remove();
        rocpoints.push({y:calcSensitivityPosY(sample), x:calcSpecificityPosX(sample)});
        roc.selectAll("circle")
        .data(rocpoints).enter()
        .append("circle")
        .attr("cx",function(d){return d.x;})
        .attr("cy",function(d){return d.y;})
        .attr("r",2).attr("fill","green");
    }
}

// Calculate the sensitivity aka true positive
function calcSensitivityPosY(sample) {
    var tp = 0;
    for (var i = 0; i < sample.length; i++) {
        tp += sample[i].color == color1 && sample[i].x < xcut;
    }
    return 30 + (1-tp / n1)*300;
}

// calculate the specificity aka true negative
function calcSpecificityPosX(sample) {
    var tn = 0;
    for (var i = 0; i < sample.length; i++) {
        tn += sample[i].color == color2 && sample[i].x > xcut;
    }
    return (1-tn / n2)*300+30;
}

// calculate AOC - integrate the area under ROC curve
function calcAOC(sample){
    return 0; // to be implemented
}

/* ************** Helper functions **************** */
// Create two distributions
function gauss2D(n, cx, cy, sdr, color) {
    var coord = [];
    for (var i = 0; i < n; i++) {
        r = sdr * Math.random();
        theta = Math.random() * Math.PI * 2;
        coord[i] = {
            x: cx + r * Math.cos(theta),
            y: cy + r * Math.sin(theta),
            color: color
        };
    }
    return coord;
}

// set the width of svg figure
function setWidth(){
  if (400>$("#figure").width()){
    return 400;
  }
  return $("#figure").width();
}
