window.onload = startfun;

var canvas;
var context;

var centreX = window.innerWidth / 2;
var centreY = window.innerHeight / 2;

var lastTime = -1;
var firstTime = -1;

var shaderAlpha = 1;
var shader = null;
var transitionTarget = "";

function updateLoop() {
    
    centreX = window.innerWidth / 2;
    centreY = window.innerHeight / 2;
    
    if (lastTime === -1) {
        var d = new Date();
        lastTime = (d.getTime()) / 1000.;
        firstTime = lastTime;
    }
    
    var d = new Date();
    var deltaTime = (d.getTime()) / 1000. - lastTime;
    var currentTime = (d.getTime()) / 1000. - firstTime;
    lastTime = d.getTime() / 1000.;
    
    if (document.getElementById("SHADER") !== null) {
        console.log(shaderAlpha);
        shaderAlpha -= .01;
        if (shaderAlpha <0) {
            shaderAlpha=0;
            document.body.removeChild(shader);
        }
        shader.style.backgroundColor = "rgba(0,0,0,"+shaderAlpha+")";
        shader.style.display = "block";
    }

}

function startfun() {
    
    shader = document.createElement("div");
    shader.style.position = "absolute";
    shader.style.left = "0px";
    shader.style.top = "0px";
    shader.style.padding = "0px";
    shader.style.width = "" + window.innerWidth + "px";
    shader.style.height = "" + window.innerHeight + "px";
    shader.style.backgroundColor = "rgba(0, 0, 0, "+ shaderAlpha +")";
    shader.id = "SHADER";
    document.body.appendChild(shader);

	getAccInfo();

    setInterval(updateLoop, 5);
}

function getAccInfo() {
var xmlhttp = new XMLHttpRequest();
xmlhttp.open("GET", "accinfo.php", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlhttp.onreadystatechange = function() {

  if (this.readyState == 4 && this.status == 200) {
    var myObj = JSON.parse(xmlhttp.responseText);
    //alert(JSON.stringify(myObj));
    var username = myObj.username;
    var points = myObj.points;
    var email = myObj.email;
    //var friends = myObj['friends']
    var userob = document.getElementById("username");
    var pointsob = document.getElementById("points");
    var emailob = document.getElementById("email");
    userob.innerHTML = username;
    pointsob.innerHTML = points;
    emailob.innerHTML = email;
    // xmlhttp.send();
    //document.getElementById("username").innerHTML = myObj.name;
  }
};

xmlhttp.send();
    
}