window.onload = main;

var timers = [];
var counter = 0;
var totpts = document.createElement("DIV");
totpts.style.position="absolute";
totpts.style.left= "92%";
totpts.style.top= "3%";
totpts.style.padding="2px 6px";
totpts.style.backgroundColor = "transparent";
var parg = document.createElement("P");
parg.style.color="green";
parg.style.fontSize="23px";
parg.style.fontFamily="Ubuntu,sans-serif";


function main() {
	parg.textContent = "$" + counter + " eP";
	totpts.appendChild(parg);
	totpts.id = "totalpoints";
	document.body.appendChild(totpts);
	var x = document.getElementsByClassName("timer");
	var i = 0;
	while (i < x.length) {
		x[i].onclick = timerFunc;
		i++;
	}
	var y = document.getElementsByClassName("options");
	for (var i = y.length - 1; i >= 0; i--) {
		y[i].onclick = toggleFields;
	}
	setInterval(updateLoop, 5);

}
function updateEcoPoints(data) {
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "TrackProgress.php",true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200) {
			//alert("you won!");
		}
	}
	xhr.send("epoints="+data);
}

function toggleFields(e) {
var params = e.target.nextElementSibling;
 if (params.style.display==="none") {
 	params.style.display="block";
 } else {
 	params.style.display="none";
 }
}

function timerFunc(e) {
	var findGoal = e.target.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling;
	if (findGoal.value === undefined) {
		findGoal = findGoal.nextElementSibling.nextElementSibling;
	}
	if (findGoal.value <= 15) {
		//alert("Please enter valid input");
	} else {
		new Timer(e.target.id);
		e.target.onclick = stopfunction;
		e.target.textContent = "Stop Timer";
	}
	

}

function Timer(id) {
	this.running = true;
	var d = new Date();
	this.itime = d.getTime()/1000.;
	timers.push(this);
	this.timeelapsed = 0;
	this.id = id;
}

function updateLoop() {
	var i = 0;
	var d = new Date();
	var currtime = d.getTime()/1000.;
	while (i < timers.length) {
		if(timers[i].running)
			timers[i].timeelapsed = currtime - timers[i].itime;
	i++;
	}
	var x = document.getElementsByClassName("counter");
	for (var i = x.length - 1; i >= 0; i--) {
		// //alert(x[i].previousElementSibling.id);
		if (x[i].previousElementSibling !== null) {
			var t = getTimerById(x[i].previousElementSibling.id);
			if (t !== null) {
				x[i].innerHTML = parseInt(t.timeelapsed / 60);
				if (parseInt(t.timeelapsed) % 60 < 10) {
					x[i].innerHTML += ":0" + (parseInt(t.timeelapsed) % 60);
				} else {
					x[i].innerHTML += ":" + (parseInt(t.timeelapsed) % 60);
				}

			}
		}
	}
}

// window.onclick = function() {
// 	if (timers.length > 0)
// 		//alert(timers[0].timeelapsed);
// }

function getTimerById(id) {
	var i = 0;
	while (i < timers.length) {
		if (timers[i].id === id) {
			return timers[i];
		} 
		i++;
	}
	return null;
}

function stopfunction(e) {
	var t = getTimerById(e.target.id);
	t.running = false;
	e.target.onclick = timerFunc;
	e.target.textContent = "Start Timer";
	var calcButton = e.target.nextElementSibling.nextElementSibling;
	// calcButton.style.visibility = "visible";
	if(t.id == "lights") {
		calcLights();
	} else if (t.id == "driving") {
		calcDriving();
	}
	else if (t.id == "computer") {
		calcComputer();
	} else if (t.id == "tv/console") {
		calcTV();
	} else if (t.id == "a/c") {
		calcAC();
	} else if (t.id == "heater") {
		calcHeater();
	} else if (t.id == "microwave") {
		calcMicrowave();
	} else if (t.id == "oven") {
		calcOven();
	} else if (t.id == "laundry") {
		calcLaundry();
	} else if (t.id == "dishwasher") {
		calcDishwasher();
	}
	// //alert(calcButton.parentElement.style.alignItems);
	// calcButton.style.marginLeft = (calcButton.parentElement.width-calcButton.clientWidth)/2 + "px";
}



function calcLights() {
	var lmao = getTimerById("lights");
	// var hrs = lmao.timeelapsed/60.;
	var lights = document.getElementById("myTextl").value;
	var epoints = 10;
	var hrs = 1;
	var calcpoints = 0;
	var goal = document.getElementById("myText1").value/60.;
	////alert(goal);
	if (hrs < goal && hrs > (0.25*goal)) {
		calcpoints = epoints;
	} else {
		var expected = 1.004 * 0.060 * lights * goal;
		var observed = 1.004 * 0.060 * lights * hrs;
		////alert("EXPECTED: " + expected + " " + "OBSERVED: " + observed);
		if (observed < (0.25 * expected)) {
			calcpoints = 0;
		} else {
			var part1 = ((5/(Math.pow(expected,2))) * Math.pow(observed-expected,2)) + 1;
			var proportion = (2/part1) - 1;
			calcpoints = proportion * epoints;
		}
	}
	//alert("YOUR POINTS: " + calcpoints);
	var pluspts = document.getElementById("lightsPoints");
	if (calcpoints > 0) {
		pluspts.style.color="green";
		pluspts.innerHTML = "+" + Math.round(calcpoints);
	} else {
		pluspts.style.color="red";
		pluspts.innerHTML = Math.round(calcpoints);
	}
	counter = Math.round(counter) + Math.round(calcpoints);
	updateEcoPoints(counter);
	parg.textContent = "$" + counter + " eP";
	//totpts.appendChild(parg);
	// //alert(pluspts.text);
	// pluspts.setAttribute("class", "garden");
	// var getenter = document.getElementById("1");
	// getenter.appendChild(pluspts);

}
function calcDriving() {
	var lmao = getTimerById("driving");
	var hrs = (document.getElementById("myText21").value)/60.;
	var epoints = 10;
	var calcpoints = 0;
	var goal = document.getElementById("myText2").value/60.;
	//alert(goal);
	if (hrs < goal && hrs > (0.25*goal)) {
		calcpoints = epoints;
	} else {
		var expected = (0.7424 * goal);
		var observed = (0.7424 * hrs);
		//alert("EXPECTED: " + expected + " " + "OBSERVED: " + observed);
		if (observed < (0.25 * expected)) {
			calcpoints = 0;
		} else {
			var part1 = ((5/(Math.pow(expected,2))) * Math.pow(observed-expected,2)) + 1;
			var proportion = (2/part1) - 1;
			calcpoints = proportion * epoints;
		}
	}
	//alert("YOUR POINTS: " + calcpoints);
	var pluspts = document.getElementById("2Points");
	if (calcpoints > 0) {
		pluspts.style.color="green";
		pluspts.innerHTML = "+" + Math.round(calcpoints);
	} else {
		pluspts.style.color="red";
		pluspts.innerHTML = Math.round(calcpoints);
	}
	counter = Math.round(counter) + Math.round(calcpoints);
	updateEcoPoints(counter);
	parg.textContent = "$" + counter + " eP";
	// updateEcoPoints(parg.textContent);
}
function calcComputer() {
	var lmao = getTimerById("computer");
	var hrs = 4;
	var epoints = 10;
	var calcpoints = 0;
	var goal = document.getElementById("myText3").value/60.;
	//alert(goal);
	if (hrs < goal && hrs > (0.25*goal)) {
		calcpoints = epoints;
	} else {
		var expected = (176 / 8760 * (8/600) * 2.2024 / 0.0167 * goal);
		var observed = (176 / 8760 * (8/600) * 2.2024 / 0.0167 * hrs);
		//alert("EXPECTED: " + expected + " " + "OBSERVED: " + observed);
		if (observed < (0.25 * expected)) {
			calcpoints = 0;
		} else {
			var part1 = ((5/(Math.pow(expected,2))) * Math.pow(observed-expected,2)) + 1;
			var proportion = (2/part1) - 1;
			calcpoints = proportion * epoints;
		}
	}
	//alert("YOUR POINTS: " + calcpoints);
	var pluspts = document.getElementById("3Points");
	if (calcpoints > 0) {
		pluspts.style.color="green";
		pluspts.innerHTML = "+" + Math.round(calcpoints);
	} else {
		pluspts.style.color="red";
		pluspts.innerHTML = Math.round(calcpoints);
	}
	counter = Math.round(counter) + Math.round(calcpoints);
	updateEcoPoints(counter);
	parg.textContent = "$" + counter + " eP";
	// updateEcoPoints(parg.textContent);

}

function calcTV() {
	var lmao = getTimerById("tv/console");
	var hrs = 4;
	var epoints = 10;
	var calcpoints = 0;
	var goal = document.getElementById("myText4").value/60.;
	//alert(goal);
	if (hrs < goal && hrs > (0.25*goal)) {
		calcpoints = epoints;
	} else {
		var expected = (0.067557 * goal);
		var observed = (0.067557 * hrs);
		//alert("EXPECTED: " + expected + " " + "OBSERVED: " + observed);
		if (observed < (0.25 * expected)) {
			calcpoints = 0;
		} else {
			var part1 = ((5/(Math.pow(expected,2))) * Math.pow(observed-expected,2)) + 1;
			var proportion = (2/part1) - 1;
			calcpoints = proportion * epoints;
		}
	}
	//alert("YOUR POINTS: " + calcpoints);
	var pluspts = document.getElementById("4Points");
	if (calcpoints > 0) {
		pluspts.style.color="green";
		pluspts.innerHTML = "+" + Math.round(calcpoints);
	} else {
		pluspts.style.color="red";
		pluspts.innerHTML = Math.round(calcpoints);
	}
	counter = Math.round(counter) + Math.round(calcpoints);
	updateEcoPoints(counter);
	parg.textContent = "$" + counter + " eP";
	// updateEcoPoints(parg.textContent);
	
}

function calcAC() {
	var lmao = getTimerById("a/c");
	var hrs = 4;
	var epoints = 10;
	var calcpoints = 0;
	var goal = document.getElementById("myText5").value/60.;
	//alert(goal);
	if (hrs < goal && hrs > (0.25*goal)) {
		calcpoints = epoints;
	} else {
		var expected = (3.514 * goal);
		var observed = (3.514 * hrs);
		//alert("EXPECTED: " + expected + " " + "OBSERVED: " + observed);
		if (observed < (0.25 * expected)) {
			calcpoints = 0;
		} else {
			var part1 = ((5/(Math.pow(expected,2))) * Math.pow(observed-expected,2)) + 1;
			var proportion = (2/part1) - 1;
			calcpoints = proportion * epoints;
		}
	}
	//alert("YOUR POINTS: " + calcpoints);
	var pluspts = document.getElementById("5Points");
	if (calcpoints > 0) {
		pluspts.style.color="green";
		pluspts.innerHTML = "+" + Math.round(calcpoints);
	} else {
		pluspts.style.color="red";
		pluspts.innerHTML = Math.round(calcpoints);
	}
	counter = Math.round(counter) + Math.round(calcpoints);
	updateEcoPoints(counter);
	parg.textContent = "$" + counter + " eP";
	// updateEcoPoints(parg.textContent);	
}

function calcHeater() {
	var lmao = getTimerById("heater");
	var hrs = 4;
	var epoints = 10;
	var calcpoints = 0;
	var goal = document.getElementById("myText6").value/60.;
	//alert(goal);
	if (hrs < goal && hrs > (0.25*goal)) {
		calcpoints = epoints;
	} else {
		var expected = (1.506 * goal);
		var observed = (1.506 * hrs);
		//alert("EXPECTED: " + expected + " " + "OBSERVED: " + observed);
		if (observed < (0.25 * expected)) {
			calcpoints = 0;
		} else {
			var part1 = ((5/(Math.pow(expected,2))) * Math.pow(observed-expected,2)) + 1;
			var proportion = (2/part1) - 1;
			calcpoints = proportion * epoints;
		}
	}
	//alert("YOUR POINTS: " + calcpoints);
	var pluspts = document.getElementById("6Points");
	if (calcpoints > 0) {
		pluspts.style.color="green";
		pluspts.innerHTML = "+" + Math.round(calcpoints);
	} else {
		pluspts.style.color="red";
		pluspts.innerHTML = Math.round(calcpoints);
	}
	counter = Math.round(counter) + Math.round(calcpoints);
	updateEcoPoints(counter);
	parg.textContent = "$" + counter + " eP";
	// updateEcoPoints(parg.textContent);
}

function calcMicrowave() {
	var lmao = getTimerById("microwave");
	var hrs = 4;
	var epoints = 10;
	var calcpoints = 0;
	var goal = document.getElementById("myText7").value/60.;
	//alert(goal);
	if (hrs < goal && hrs > (0.25*goal)) {
		calcpoints = epoints;
	} else {
		var expected = (1.2048 * goal);
		var observed = (1.2048 * hrs);
		//alert("EXPECTED: " + expected + " " + "OBSERVED: " + observed);
		if (observed < (0.25 * expected)) {
			calcpoints = 0;
		} else {
			var part1 = ((5/(Math.pow(expected,2))) * Math.pow(observed-expected,2)) + 1;
			var proportion = (2/part1) - 1;
			calcpoints = proportion * epoints;
		}
	}
	//alert("YOUR POINTS: " + calcpoints);
	var pluspts = document.getElementById("7Points");
	if (calcpoints > 0) {
		pluspts.style.color="green";
		pluspts.innerHTML = "+" + Math.round(calcpoints);
	} else {
		pluspts.style.color="red";
		pluspts.innerHTML = Math.round(calcpoints);
	}
	counter = Math.round(counter) + Math.round(calcpoints);
	updateEcoPoints(counter);
	parg.textContent = "$" + counter + " eP";
	// updateEcoPoints(parg.textContent);
}

function calcOven() {
	var lmao = getTimerById("oven");
	var hrs = 4;
	var epoints = 10;
	var calcpoints = 0;
	var goal = document.getElementById("myText8").value/60.;
	//alert(goal);
	if (hrs < goal && hrs > (0.25*goal)) {
		calcpoints = epoints;
	} else {
		var expected = (2.008 * goal);
		var observed = (2.008 * hrs);
		//alert("EXPECTED: " + expected + " " + "OBSERVED: " + observed);
		if (observed < (0.25 * expected)) {
			calcpoints = 0;
		} else {
			var part1 = ((5/(Math.pow(expected,2))) * Math.pow(observed-expected,2)) + 1;
			var proportion = (2/part1) - 1;
			calcpoints = proportion * epoints;
		}
	}
	//alert("YOUR POINTS: " + calcpoints);
	var pluspts = document.getElementById("8Points");
	if (calcpoints > 0) {
		pluspts.style.color="green";
		pluspts.innerHTML = "+" + Math.round(calcpoints);
	} else {
		pluspts.style.color="red";
		pluspts.innerHTML = Math.round(calcpoints);
	}
	counter = Math.round(counter) + Math.round(calcpoints);
	updateEcoPoints(counter);
	parg.textContent = "$" + counter + " eP";
	//updateEcoPoints(parg.textContent);
}

function calcLaundry() {
	var lmao = getTimerById("laundry");
	var hrs = 4;
	var epoints = 10;
	var calcpoints = 0;
	var goal = document.getElementById("myText9").value/60.;
	//alert(goal);
	if (hrs < goal && hrs > (0.25*goal)) {
		calcpoints = epoints;
	} else {
		var expected = (0.8534 * goal);
		var observed = (0.8534 * hrs);
		//alert("EXPECTED: " + expected + " " + "OBSERVED: " + observed);
		if (observed < (0.25 * expected)) {
			calcpoints = 0;
		} else {
			var part1 = ((5/(Math.pow(expected,2))) * Math.pow(observed-expected,2)) + 1;
			var proportion = (2/part1) - 1;
			calcpoints = proportion * epoints;
		}
	}
	//alert("YOUR POINTS: " + calcpoints);
	var pluspts = document.getElementById("9Points");
	if (calcpoints > 0) {
		pluspts.style.color="green";
		pluspts.innerHTML = "+" + Math.round(calcpoints);
	} else {
		pluspts.style.color="red";
		pluspts.innerHTML = Math.round(calcpoints);
	}
	counter = Math.round(counter) + Math.round(calcpoints);
	updateEcoPoints(counter);
	parg.textContent = "$" + counter + " eP";
	// updateEcoPoints(parg.textContent);	
}

function calcDishwasher() {
	var lmao = getTimerById("dishwasher");
	var hrs = 4;
	var epoints = 10;
	var calcpoints = 0;
	var goal = document.getElementById("myText10").value/60.;
	//alert(goal);
	if (hrs < goal && hrs > (0.25*goal)) {
		calcpoints = epoints;
	} else {
		var expected = (1.8072 * goal);
		var observed = (1.8072 * hrs);
		//alert("EXPECTED: " + expected + " " + "OBSERVED: " + observed);
		if (observed < (0.25 * expected)) {
			calcpoints = 0;
		} else {
			var part1 = ((5/(Math.pow(expected,2))) * Math.pow(observed-expected,2)) + 1;
			var proportion = (2/part1) - 1;
			calcpoints = proportion * epoints;
		}
	}
	//alert("YOUR POINTS: " + calcpoints);
	var pluspts = document.getElementById("10Points");
	if (calcpoints > 0) {
		pluspts.style.color="green";
		pluspts.innerHTML = "+" + Math.round(calcpoints);
	} else {
		pluspts.style.color="red";
		pluspts.innerHTML = Math.round(calcpoints);
	}
	counter = Math.round(counter) + Math.round(calcpoints);
	updateEcoPoints(counter);
	parg.textContent = "$" + counter + " eP";
	// updateEcoPoints(parg.textContent);
}

