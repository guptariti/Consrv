var canvas;
var context;

var centreX = window.innerWidth / 2;
var centreY = window.innerHeight / 2;

var lastTime = -1;
var firstTime = -1;

var objects = [];

/*
1. Account
2. Barcode
3. Garden
4. Tracking
5. Multiplayer/Share
*/

var palette = null;

var mouseX = 0;
var mouseY = 0;

var pointerCursor = false;

var shaderAlpha = 0;
var shader = null;
var transitionTarget = "";

window.onload = function() {
	canvas = document.getElementById("theCANVAS");
	canvas.style.position = "absolute";
	canvas.style.left = "0px";
	canvas.style.top = "0px";
	canvas.style.padding = "0px";
	canvas.width = "" + window.innerWidth + "";
	canvas.height = "" + window.innerHeight + "";
	canvas.style.backgroundColor = "rgba(190, 210, 255, 1)";
	
	context = canvas.getContext("2d");
	
	shader = document.createElement("div");
	shader.style.position = "absolute";
	shader.style.left = "0px";
	shader.style.top = "0px";
	shader.style.padding = "0px";
	shader.style.width = "" + window.innerWidth + "px";
	shader.style.height = "" + window.innerHeight + "px";
	shader.style.backgroundColor = "rgba(0, 0, 0, "+ shaderAlpha +")";
	shader.id = "SHADER";
	
	palette = new SelectionPalette();
	
	
	
	setInterval(updateLoop, 5);
}

function updateLoop() {
	canvas.width = "" + window.innerWidth + "";
	canvas.height = "" + window.innerHeight + "";
	
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
	
	
	
	context.clearRect(0, 0, canvas.width, canvas.height);
	for (o = 0; o < objects.length; o++) {
		drawSprite(objects[o].sprite, objects[o].x, objects[o].y);
	}
	physicsLoop(deltaTime, currentTime);
	if (document.getElementById("SHADER") !== null) {
		console.log(shaderAlpha);
		shaderAlpha += .01;
		if (shaderAlpha > 1) {
			shaderAlpha=1;
			window.open(transitionTarget, "_self", false);
		}
		shader.style.backgroundColor = "rgba(0,0,0,"+shaderAlpha+")";
		shader.style.display = "block";
	}
}

function physicsLoop(deltaTime, currentTime) {
	pointerCursor = false;
	for (o = 0; o < objects.length; o++) {
		var obj = objects[o];
		
		if (Math.abs(obj.velocity.magnitude) > .01) {
			obj.x += obj.velocity.getXComponent() * deltaTime;
			obj.y += obj.velocity.getYComponent() * deltaTime;
			
			if (obj.x > obj.maxX) {
				obj.x = obj.minX;
				if (obj.randomY)
					obj.y = Math.random() * window.innerHeight - centreY;
			} else if (obj.x < obj.minX) {
				obj.x = obj.maxX;
				if (obj.randomY)
					obj.y = Math.random() * window.innerHeight - centreY;
			}
			
			if (obj.yBound) {
				if (obj.y > obj.maxY) {
					obj.y = obj.maxY;
					obj.velocity = new Vector(Math.abs(obj.velocity.getXComponent()),obj.velocity.getXComponent() > 0 ? 0 : 180);
				} else if (obj.y < obj.minY) {
					obj.y = obj.minY;
					obj.velocity = new Vector(Math.abs(obj.velocity.getXComponent()),obj.velocity.getXComponent() > 0 ? 0 : 180);
				}
			}
						
			if (obj.grounded) {
				obj.frictionForce.angle = addCircular(obj.velocity.angle, 180,360);
				obj.forces['FRICTION'] = obj.frictionForce;
			}
		} else {
			obj.forces['FRICTION'] = null;
		}
		
		if (Math.abs(obj.angularVelocity.magnitude) > .01) {
			obj.angle += obj.angularVelocity.getXComponent() * deltaTime;
			var rotated = rotateAbout(obj.x, obj.y, obj.centreX, obj.centreY, obj.angularVelocity.getXComponent() * deltaTime);
			obj.x = rotated[0];
			obj.y = rotated[1];
		}
		
		obj.acceleration = new Vector(0, 0);
		var netForce = new Vector(0, 0);
		for (key in obj.forces) {
			if (obj.forces[key] !== null) {
				netForce = addVectorBounded(netForce, obj.forces[key], 300);
			}
		}
		
		if (netForce.magnitude > 0) {
			obj.acceleration = new Vector(netForce.magnitude / obj.mass, netForce.angle);
		}
		
		if (obj.acceleration.magnitude > 0) {
			obj.velocity = addVectorBounded(obj.velocity, new Vector(obj.acceleration.magnitude * deltaTime, obj.acceleration.angle), 150);
		}
		
		for (key in obj.sprite.renderables) {
			var r = obj.sprite.renderables[key];
			if (r.type === "animated") {
				if ("buffer" in r) {
					r.trans = r.buffer.slice();
				} else {
					r.trans = r.points.slice();
					r.buffer = r.points.slice();
				}
				var offset = r.timeElapsed;
				r.timeElapsed = (currentTime + r.timeElapsed) % r.max;
				for (j = 0; j < r.action.length; j++) {
					window[r.action[j]](r, r.additionals[j]);
				}
				r.timeElapsed = offset;
			}
		}
		
		if (obj === palette.object) {
			for (p = 0; p < palette.options.length; p++) {
				if (mouseX - centreX < palette.options[p].object.x + 40 &&
				mouseX - centreX > palette.options[p].object.x - 40 &&
				mouseY - centreY < palette.options[p].object.y + 40 &&
				mouseY - centreY > palette.options[p].object.y - 40) {
					pointerCursor = true;
					palette.options[p].object.sprite.scaleX =1.2;
					palette.options[p].object.sprite.scaleY =1.2;
					palette.options[p].object.sprite.renderables[1].colour = "rgba(175,195,240,1)";
					
					context.font = "20px Ubuntu";
					context.fontWeight = "bold";
					context.fillStyle = "rgba(80,80,80,0.4)";
					context.fillRect(mouseX - (context.measureText(palette.options[p].name).width / 2), mouseY - 26, context.measureText(palette.options[p].name).width + 12, 23);
					//adjust length
					
					context.fillStyle = "white";
					context.fillText(palette.options[p].name, mouseX + 6 - (context.measureText(palette.options[p].name).width / 2), mouseY -3-5);
				
					var d = document.getElementById("TITLE");
					if (p !== 4) {
						d.innerHTML = "<span style='font-size:.5em'>the</span>";
					} else {
						d.innerHTML = "";
					}
					d.innerHTML += " " + palette.options[p].htmlName;
					d.style.display = "block";
					
					d = document.getElementById("DESC");
					dBox = document.getElementsByClassName("description");
					
					for (n = 0; n < dBox.length; n++) {
						if (n >= palette.options[p].descriptions.length) {
							dBox[n].style.display = "none";
						} else {
							dBox[n].style.display = "block";
							dBox[n].innerHTML = palette.options[p].descriptions[n];
						}
					}
				} else {
					palette.options[p].object.sprite.scaleX =1;
					palette.options[p].object.sprite.scaleY =1;
					palette.options[p].object.sprite.renderables[1].colour = "rgba(155,175,220,1)";
				}
			}
		}
	}
	if (pointerCursor) {
		canvas.style.cursor = "pointer";
	} else {
		canvas.style.cursor = "auto";
	}
}

function Object(x, y, sprite, mass) {
	this.x = x;
	this.y = y;
	this.sprite = sprite;
	this.mass = mass;
	this.velocity = new Vector(0,0);
	this.acceleration = new Vector(0,0);
	this.forces = [];
	this.angularVelocity = new Vector(0,0);
	this.angle = 0;
	this.centreX = 0;
	this.centreY = 0;
	
	objects.push(this);
}

function SelectionPalette() {
	var renderables = [];
	var points = [];
	var radius = 250;
	var po = 60;
	for (p = 0; p < po+1; p++) {
		points[p] = [radius * Math.cos(p * 2 * Math.PI / po), radius * Math.sin(p * 2 * Math.PI / po)];
	}
	
	radius = 230;
	for (j = 0; j < po + 1; j++) {
		points[j+po+1] = [radius * Math.cos(-j * 2 * Math.PI / po), radius * Math.sin(-j * 2 * Math.PI / po)];
	}
	var additionals = {};
	additionals['amplitude'] = 30;
	additionals['centreX'] = 0.01;
	additionals['centreY'] = 0.01;
	
	renderables.push(new AnimatedRenderable(points, "rgba(0,0,0,.15)", "rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_ROTATE"], [additionals]));
	
	points = [];
	radius = 230;
	po = 60;
	for (p = 0; p < po; p++) {
		points[p] = [radius * Math.cos(p * 2 * Math.PI / po), radius * Math.sin(p * 2 * Math.PI / po)];
	}
	renderables.push(new Renderable(points, "rgba(0,0,0,.03)", "rgba(0,0,0,0)"));
	
	points = [];
	radius = 160;
	po = 60;
	for (p = 0; p < po; p++) {
		points[p] = [radius * Math.cos(p * 2 * Math.PI / po), radius * Math.sin(p * 2 * Math.PI / po)];
	}
	renderables.push(new Renderable(points, "rgba(0,0,0,.06)", "rgba(0,0,0,0)"));
	
	points = [];
	radius = 100;
	po = 6;
	for (p = 0; p < po; p++) {
		points[p] = [radius * Math.cos(p * 2 * Math.PI / po), radius * Math.sin(p * 2 * Math.PI / po)];
	}
	renderables.push(new AnimatedRenderable(points, "rgba(0,0,0,.1)", "rgba(0,0,0,0)", 8, ["RENDERABLE_ANIMATION_ROTATE"], [additionals]));
	
	points = [];
	radius = 110;
	po = 6;
	for (p = 0; p < po; p++) {
		points[p] = [radius * Math.cos(p * 2 * Math.PI / po + toRadians(30)), radius * Math.sin(p * 2 * Math.PI / po + toRadians(30))];
	}
	renderables.push(new AnimatedRenderable(points, "rgba(0,0,0,.1)", "rgba(0,0,0,0)", 8, ["RENDERABLE_ANIMATION_ROTATE"], [additionals]));
	
	var sprite = new Sprite(renderables);
	this.object = new Object(0,0,sprite,1);
	this.options = [];
	for (a = 0; a < 5; a++) {
		var name = "";
		var html = "";
		var descriptions = [];
		
		var additionals2 = {};
		additionals2['centreX'] = 0.01;
		additionals2['centreY'] = 0.01;
		
		var renderables2 = [];
		points = [];
		radius = 70;
		radiusLarge = 240;
		po = 6;
		for (p = 0; p < po; p++) {
			points[p] = [radius * Math.cos(p * 2 * Math.PI / po + toRadians(30)), radius * Math.sin(p * 2 * Math.PI / po + toRadians(30))];
		}
		renderables2.push(new AnimatedRenderable(points, "rgba(170,190,235,1)", "rgba(0,0,0,0)", 40, ["RENDERABLE_ANIMATION_ROTATE"], [additionals]));
		
		points = [];
		radius = 50;
		radiusLarge = 240;
		po = 6;
		for (p = 0; p < po; p++) {
			points[p] = [radius * Math.cos(p * 2 * Math.PI / po + toRadians(30)), radius * Math.sin(p * 2 * Math.PI / po + toRadians(30))];
		}
		renderables2.push(new AnimatedRenderable(points, "rgba(155,175,220,1)", "rgba(0,0,0,0)", 40, ["RENDERABLE_ANIMATION_ROTATE"], [additionals]));
		
		if (a === 0) {
			var points = [[-32,-17],[25,-25],[48,40],[-8,47]];
			renderables2.push(new Renderable(points, "rgb(89, 69, 41)", "rgba(0,0,0,0)"));
			points = [[-32,-22],[25,-30],[48,35],[-8,42]];
			renderables2.push(new Renderable(points, "rgb(255,255,255)", "rgba(0,0,0,0)"));
			points = [[-32,-32],[25,-40],[48,25],[-8,32]];
			renderables2.push(new Renderable(points, "rgb(109, 89, 61)", "rgba(0,0,0,0)"));
			points = [[-25,-25],[18,-33],[41,18],[-1,25]];
			renderables2.push(new Renderable(points, "rgb(89, 69, 41)", "rgba(0,0,0,0)"));
			points = [[-34,-25],[-30,-30],[-30,-25],[-34,-20]];
			renderables2.push(new Renderable(points, "rgb(160, 131, 91)", "rgba(0,0,0,0)"));
			
			points = [[-34+4,-25+8],[-30+4,-30+8],[-30+4,-25+8],[-34+4,-20+8]];
			renderables2.push(new Renderable(points, "rgb(160, 131, 91)", "rgba(0,0,0,0)"));
			points = [[-34+8,-25+18],[-30+8,-30+18],[-30+8,-25+18],[-34+8,-20+18]];
			renderables2.push(new Renderable(points, "rgb(160, 131, 91)", "rgba(0,0,0,0)"));
			points = [[-34+12,-25+29],[-30+12,-30+29],[-30+12,-25+29],[-34+12,-20+29]];
			renderables2.push(new Renderable(points, "rgb(160, 131, 91)", "rgba(0,0,0,0)"));
			points = [[-34+16,-25+40],[-30+16,-30+40],[-30+16,-25+40],[-34+16,-20+40]];
			renderables2.push(new Renderable(points, "rgb(160, 131, 91)", "rgba(0,0,0,0)"));
			points = [[-34+20,-25+50],[-30+20,-30+50],[-30+20,-25+50],[-34+20,-20+50]];
			renderables2.push(new Renderable(points, "rgb(160, 131, 91)", "rgba(0,0,0,0)"));
			points = [[-34+24,-25+60],[-30+24,-30+60],[-30+24,-25+60],[-34+24,-20+60]];
			renderables2.push(new Renderable(points, "rgb(160, 131, 91)", "rgba(0,0,0,0)"));
		
			var scale = .8;
			for (r = 2; r < renderables2.length; r++) {
				renderables2[r].timeElapsed = offset;
				for (p = 0; p < renderables2[r].points.length; p++) {
					renderables2[r].points[p][0] *= scale;
					renderables2[r].points[p][1] *= scale;
					renderables2[r].points[p][0] -= 5;
				}
			}
			name = "Account Info";
			html = "Account<p style = 'margin:0px;font-size:.75em'>Info</p>";
			descriptions[0] = "View your account information, including how ecofriendly you've been lately!";
			descriptions[1] = "Adjust your preferences, including username, password, and email.";
			descriptions[2] = "You can also log out here.<br>(But why would you? :[ )";
		} else if (a === 1) {
			var points = [[-50,-18],[-50,18],[50,18],[50,-18]];
			renderables2.push(new Renderable(points, "rgb(255, 255, 255)", "rgba(0,0,0,0)"));
			points = [[-50,-18],[-50,18],[-48,18],[-48,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[-46,-18],[-46,18],[-45,18],[-45,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[-42,-18],[-42,18],[-39,18],[-39,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[-36,-18],[-36,18],[-35,18],[-35,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[-33,-18],[-33,18],[-31,18],[-31,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[-29,-18],[-29,18],[-28,18],[-28,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[-24,-18],[-24,18],[-23,18],[-23,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[-21,-18],[-21,18],[-16,18],[-16,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[-14,-18],[-14,18],[-10,18],[-10,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[-5,-18],[-5,18],[-3,18],[-3,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[-1,-18],[-1,18],[2,18],[2,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[4,-18],[4,18],[5,18],[5,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[9,-18],[9,18],[11,18],[11,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[14,-18],[14,18],[19,18],[19,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[22,-18],[22,18],[23,18],[23,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[26,-18],[26,18],[28,18],[28,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[30,-18],[30,18],[31,18],[31,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[35,-18],[35,18],[37,18],[37,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[40,-18],[40,18],[44,18],[44,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			points = [[47,-18],[47,18],[48,18],[48,-18]];
			renderables2.push(new Renderable(points, "rgb(0, 0, 0)", "rgba(0,0,0,0)"));
			name = "Barcode Scanner";
			html = "Barcode<p style = 'margin:0px;font-size:.75em'>Scanner</p>";
			descriptions[0] = "Scan purchased products from B-corp certified (environmentally friendly) manufacturers to earn <b><span style='color:rgb(102, 255, 127)'>Eco-Points</span></b>!";
			descriptions[1] = "Earn <b><span style='color:rgb(102, 255, 127)'>Eco-Points</span></b> based on their eco-friendliness rating!";
			descriptions[2] = "The ratings for the products are determined by B Corp certification levels.";
			descriptions[3] = "You can use Eco-Points to improve and expand your Consrv Garden!";
		} else if (a === 2) {
			var colours = ["rgb(249, 78, 52)"];
	
			var offset = Math.random() * 1.7;
			
			var yO = Math.random() * 10;
			var colour = colours[(parseInt(colours.length * Math.random()))];
			renderables2.push(new Renderable([[-1,0],[1,0],[1,15],[-1,15]],"rgba(14, 195, 77, 1)","rgba(0,0,0,0)"));
			renderables2.push(new Renderable([[-7, 10, 0],[-2,8,0],[0,15,0],[-7,13,0]], "rgb(238, 242, 43)","rgba(0,0,0,0)"));
			renderables2.push(new Renderable([[7, 10, 0],[2,8,0],[0,15,0],[7,13,0]], "rgb(238, 242, 43)","rgba(0,0,0,0)"));
			renderables2.push(new Renderable([[-7, 20, 0],[-2,22,0],[0,15,0],[-7,17,0]], "rgb(238, 242, 43)","rgba(0,0,0,0)"));
			renderables2.push(new Renderable([[7, 20, 0],[2,22,0],[0,15,0],[7,17,0]], "rgb(238, 242, 43)","rgba(0,0,0,0)"));
			
			renderables2.push(new Renderable([[0, 0, 0],[-10,3,0],[-16,9,0],[-8,6,0]], "rgba(14, 185, 47, 1)","rgba(0,0,0,0)"));
			renderables2.push(new Renderable([[0, 0, 0],[10,3,0],[16,9,0],[8,6,0]], "rgba(14, 185, 47, 1)","rgba(0,0,0,0)"));
			
			renderables2.push(new Renderable([[-1,0],[1,0],[1,15],[-1,15]],"rgba(14, 195, 77, 1)","rgba(0,0,0,0)"));
			renderables2.push(new Renderable([[-7, 10, 0],[-2,8,0],[0,15,0],[-7,13,0]], colour,"rgba(0,0,0,0)"));
			renderables2.push(new Renderable([[7, 10, 0],[2,8,0],[0,15,0],[7,13,0]], colour,"rgba(0,0,0,0)"));
			renderables2.push(new Renderable([[-7, 20, 0],[-2,22,0],[0,15,0],[-7,17,0]], colour,"rgba(0,0,0,0)"));
			renderables2.push(new Renderable([[7, 20, 0],[2,22,0],[0,15,0],[7,17,0]], colour,"rgba(0,0,0,0)"));
			
			renderables2.push(new Renderable([[0, 0, 0],[-10,3,0],[-16,9,0],[-8,6,0]], "rgba(14, 185, 47, 1)","rgba(0,0,0,0)"));
			renderables2.push(new Renderable([[0, 0, 0],[10,3,0],[16,9,0],[8,6,0]], "rgba(14, 185, 47, 1)","rgba(0,0,0,0)"));
			
			
			colours = ["rgb(198, 82, 23)"];
	
			offset = Math.random() * 1.7;
			
			yO = 7;
			xO = 9;

			colour = colours[(parseInt(colours.length * Math.random()))];
			renderables2.push(new RenderableRectangle(4,10,xO,0,"rgb(252, 220, 189)","rgba(0,0,0,0)"));
			renderables2.push(new Renderable([[-4+xO, 7-yO, 0],[-5+xO,11-yO,0],[-3+xO,16-yO,0],[3+xO,16-yO,0],[5+xO,11-yO,0],[4+xO,7-yO,0]], colour,"rgba(0,0,0,0)"));
			renderables2.push(new RenderableCircle(1,1,10,-2+xO,10-yO,"rgb(255,255,255,1)","rgba(0,0,0,0)"));
			renderables2.push(new RenderableCircle(1,1,10,1+xO,12-yO,"rgb(255,255,255,1)","rgba(0,0,0,0)"));
			renderables2.push(new RenderableCircle(1,1,10,3+xO,9-yO,"rgb(255,255,255,1)","rgba(0,0,0,0)"));
			renderables2.push(new RenderableCircle(1,1,10,-1+xO,14-yO,"rgb(255,255,255,1)","rgba(0,0,0,0)"));
			
			var scale = 2;
			for (r = 2; r < renderables2.length; r++) {
				if (r < 8) {
					renderables2[r].timeElapsed = offset;
					for (p = 0; p < renderables2[r].points.length; p++) {
						renderables2[r].points[p][0] *= scale *.6;
						renderables2[r].points[p][1] *= -scale *.6;
						renderables2[r].points[p][0] += 20;
						renderables2[r].points[p][1] += 5;
					}
				} else {
					renderables2[r].timeElapsed = offset;
					for (p = 0; p < renderables2[r].points.length; p++) {
						renderables2[r].points[p][0] *= scale;
						renderables2[r].points[p][1] *= -scale;
						renderables2[r].points[p][1] += 20;
						renderables2[r].points[p][0] -= 5;
					}
				}
			}
			name = "Consrv Garden";
			html = "Consrv<p style = 'margin:0px;font-size:.75em'>Garden</p>";
			descriptions[0] = "This is the culmination of your eco-friendliness! The garden represents all the plants and trees you save via your environmentally conscious actions.";
			descriptions[1] = "Decorate your garden to your liking.";
			descriptions[2] = "Spend your <b><span style='color:rgb(102, 255, 127)'>Eco-Points</span></b> in the market to save more plants.";
			descriptions[3] = "Earn points by tracking your energy-consumption activities and buying alternative products from eco-friendly B-corp approved companies!";
		} else if (a === 3) {
			var points = [[-3,2.5],[3,2.5],[3,5],[5,9],[7,12],[9,16],[8,20],[6,22],[3,23],[-3,23],[-6,22],[-8,20],[-9,16],[-7,12],[-5,9],[-3,5]];
			renderables2.push(new Renderable(points, "rgb(234, 255, 109)", "rgba(0,0,0,0)"));
			points = [[-2.5,-2],[2.5,-2],[3,2.5],[-3,2.5]];
			renderables2.push(new Renderable(points, "rgb(149, 153, 142)", "rgba(0,0,0,0)"));
			points = [[-1,2.5],[-1,14],[0,10],[1,14],[1,2.5]];
			renderables2.push(new Renderable(points, "rgb(193, 193, 193)", "rgba(0,0,0,0)"));
			points = [[-10,30],[-15,30],[-15,25],[-10,25]];
			renderables2.push(new Renderable(points, "rgb(214, 235, 79)", "rgba(0,0,0,0)"));
			points = [[-7,32],[-5,32],[-5,34],[-7,34]];
			renderables2.push(new Renderable(points, "rgb(234, 255, 89)", "rgba(0,0,0,0)"));
			points = [[0,36],[4,36],[4,40],[0,40]];
			renderables2.push(new Renderable(points, "rgb(214, 235, 79)", "rgba(0,0,0,0)"));
			points = [[-3,26],[-1,26],[-1,28],[-3,28]];
			renderables2.push(new Renderable(points, "rgb(244, 255, 99)", "rgba(0,0,0,0)"));
			points = [[5,28],[8,28],[8,31],[5,31]];
			renderables2.push(new Renderable(points, "rgb(234, 255, 89)", "rgba(0,0,0,0)"));
			points = [[9,24],[11,24],[11,26],[9,26]];
			renderables2.push(new Renderable(points, "rgb(224, 245, 79)", "rgba(0,0,0,0)"));
			var scale = 2;
			for (r = 2; r < renderables2.length; r++) {
				renderables2[r].timeElapsed = offset;
				for (p = 0; p < renderables2[r].points.length; p++) {
					renderables2[r].points[p][0] *= scale;
					renderables2[r].points[p][1] *= -scale;
					renderables2[r].points[p][1] += 30;
				}
			}
			name = "Usage Tracker";
			html = "Usage<p style = 'margin:0px;font-size:.75em'>Tracker</p>";
			descriptions[0] = "Track your energy consumption here!";
			descriptions[1] = "Earn <b><span style='color:rgb(102, 255, 127)'>Eco-Points</span></b> and spend them in the Consrv Garden to get extra plants and trees!";
			descriptions[2] = "Usage Tracker allows you to track activities such as computer usage, lights usage, and cleaningware usage.";
			descriptions[3] = "Keep track of your energy usage habits and trends and your potential <b>personal</b> impact on the environment!";
		} else if (a === 4) {
			points = [];
			radius = 8;
			po = 20;
			for (p = 0; p < po; p++) {
				points[p] = [radius * Math.cos(p * 2 * Math.PI / po + toRadians(30)) - 22, radius * Math.sin(p * 2 * Math.PI / po + toRadians(30)) - 17];
			}
			renderables2.push(new Renderable(points, "rgba(0,0,0,1)", "rgba(0,0,0,0)"));
			points = [[-29,-5],[-14,-5],[-14,20],[-29,20]];
			renderables2.push(new Renderable(points, "rgb(181, 50, 23)", "rgba(0,0,0,0)"));
			points = [[-35,-5],[-31,-5],[-15,17],[-19,17]];
			renderables2.push(new Renderable(points, "rgb(149, 153, 142)", "rgba(0,0,0,0)"));
			points = [[-12,-5],[-8,-5],[1,18],[-3,18]];
			renderables2.push(new Renderable(points, "rgb(149, 153, 142)", "rgba(0,0,0,0)"));
			points = [[-29,23],[-23,23],[-23,40],[-29,40]];
			renderables2.push(new Renderable(points, "rgb(149, 153, 142)", "rgba(0,0,0,0)"));
			points = [[-20,23],[-14,23],[-14,40],[-20,40]];
			renderables2.push(new Renderable(points, "rgb(149, 153, 142)", "rgba(0,0,0,0)"));
			
			points = [[29,-5],[14,-5],[14,20],[29,20]];
			renderables2.push(new Renderable(points, "rgb(17, 72, 124)", "rgba(0,0,0,0)"));
			points = [[35,-5],[31,-5],[31,20],[35,20]];
			renderables2.push(new Renderable(points, "rgb(149, 153, 142)", "rgba(0,0,0,0)"));
			points = [[12,-5],[8,-5],[8,20],[12,20]];
			renderables2.push(new Renderable(points, "rgb(149, 153, 142)", "rgba(0,0,0,0)"));
			points = [[29,23],[23,23],[23,40],[29,40]];
			renderables2.push(new Renderable(points, "rgb(149, 153, 142)", "rgba(0,0,0,0)"));
			points = [[20,23],[14,23],[14,40],[20,40]];
			renderables2.push(new Renderable(points, "rgb(149, 153, 142)", "rgba(0,0,0,0)"));
			
			points = [];
			for (p = 0; p < po; p++) {
				points[p] = [radius * Math.cos(p * 2 * Math.PI / po + toRadians(30)) + 22, radius * Math.sin(p * 2 * Math.PI / po + toRadians(30)) - 17];
			}
			renderables2.push(new Renderable(points, "rgba(0,0,0,1)", "rgba(0,0,0,0)", 40, ["RENDERABLE_ANIMATION_ROTATE"], [additionals]));
			
			var scale = 1;
			for (r = 2; r < renderables2.length; r++) {
				renderables2[r].timeElapsed = offset;
				for (p = 0; p < renderables2[r].points.length; p++) {
					renderables2[r].points[p][0] *= scale;
					renderables2[r].points[p][1] -= 9;
				}
			}
			
			name = "Share";
			html = "Share<p style = 'margin:0px;font-size:.75em'>Your Garden</p>";
			descriptions[0] = "Share your Consrv Garden with others! Show off your eco-friendliness alongside your imagination and creativity!";
			descriptions[1] = "Earn <b><span style='color:rgb(102, 255, 127)'>Eco-Points</span></b> for checking out other people's gardens.";
			descriptions[2] = "Compare your <b><span style='color:rgb(102, 255, 127)'>Eco-Points</span></b> with others and compete for the most! King of the garden!";
			//descriptions[3] = "Earn points by tracking your activities and scanning for eco-friendly items!";
			//var points = [[-32,-17],[25,-25],[48,40],[-8,47]];
			//renderables2.push(new Renderable(points, "rgb(89, 69, 41)", "rgba(0,0,0,0)"));
		}
		
		
		this.options[a] = new PaletteOption(radiusLarge * Math.cos(a * 2 * Math.PI / 5), radiusLarge * Math.sin(a * 2 * Math.PI / 5), new Sprite(renderables2), name, html, descriptions);
		this.options[a].object.angularVelocity = new Vector(5, 0);
	}
	
	
}

function RenderableRectangle(w, h, offsetX, offsetY, colour, outlineColour) {
	var points = [];
	points[0] = [-w / 2 + offsetX, -h/2 + offsetY];
	points[1] = [w / 2 + offsetX, -h/2 + offsetY];
	points[2] = [w / 2 + offsetX, h/2 + offsetY];
	points[3] = [-w / 2 + offsetX, h/2 + offsetY];
	
	this.save = points;
	this.points = points;
	this.outlineColour = outlineColour;
	this.colour = colour;
}

function RenderableCircle(rX, rY, p, offsetX, offsetY, colour, outlineColour) {
	var points = [];

	for (i = 0; i < p; i++) {
		points.push([rX * Math.cos(i * 2 * Math.PI / p) + offsetX, rY * Math.sin(i * 2 * Math.PI / p) + offsetY]);
	}
	
	this.save = points;
	this.points = points;
	this.outlineColour = outlineColour;
	this.colour = colour;
}

function PaletteOption(x, y, sprite, name, htmlName, descriptions) {
	this.object = new Object(x, y, sprite, 1);
	this.name = name;
	this.htmlName = htmlName;
	this.descriptions = descriptions;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
}

function Vector(magnitude, angle) {
	this.magnitude = magnitude;
	this.angle = angle;

	this.getXComponent = getXComponent;
	this.getYComponent = getYComponent;
}

function getXComponent() {
	return this.magnitude * Math.cos(toRadians(this.angle));
}

function getYComponent() {
	return this.magnitude * Math.sin(toRadians(this.angle));
}

function toRadians(degrees) {
	return degrees * Math.PI /180.0;
}

function toDegrees(radians) {
	return radians * 180.0 / Math.PI;
}

function addCircular(init, add, max) {
	if (add + init >= 0) {
		return (init + add) % max;
	} else {
		dist = init + add;
		return (max - 1) - dist;
	}
}

function addVectorBounded(v1, v2, bound) {
	var x1 = v1.getXComponent(v1);
	var y1 = v1.getYComponent(v1);
	var x2 = v2.getXComponent(v2);
	var y2 = v2.getYComponent(v2);

	var x3 = x1 + x2;
	var y3 = y1 + y2;

	var magnitude = Math.sqrt(Math.pow(x3, 2) + Math.pow(y3, 2));
	
	if (magnitude > bound) {
		magnitude = bound;
	}

	angle = toDegrees(Math.atan(y3 / dezeroify(x3)));
	if (x3 < 0 && y3 < 0) {
		angle += 180;
	} else if (x3 < 0 && y3 > 0) {
		angle += 180;
	} else if (x3 > 0 && y3 < 0) {
		angle += 360;
	}
	
	return new Vector(magnitude, angle);
}

function dezeroify(num) {
	if (num === 0) {
		return .000000001;
	}
	return num;
}

function Renderable(points, colour, outlineColour) {
  this.save = points;
  this.points = points;
  this.outlineColour = outlineColour;
  this.colour = colour;
}

function AnimatedRenderable(points, colour, outlineColour, maxTime, action, additionals) {
	this.points = points;
	this.outlineColour = outlineColour;
	this.colour = colour;
	this.save = points;
	this.max = maxTime;
	this.action = action;
	this.additionals = additionals;
	this.type = "animated";
	this.timeElapsed = 0;
}

function Sprite(renderables) {
	this.renderables = renderables;
	this.scaleX = 1;
	this.scaleY = 1;
}

function drawSprite(sprite, x, y) {	
	for (jj = 0; jj < sprite.renderables.length; jj++) {
		var renderable = sprite.renderables[jj];
		context.beginPath();
		context.strokeStyle = renderable.outlineColour;

		
		context.moveTo(centreX + (renderable.points[0][0]*sprite.scaleX) + x, centreY + (renderable.points[0][1]*sprite.scaleY) + y);
		for (ii = 0; ii < renderable.points.length; ii++) {
			context.lineTo(centreX + (renderable.points[ii][0]*sprite.scaleX) + x, centreY + (renderable.points[ii][1]*sprite.scaleY) + y);
		}
		context.closePath();
		context.stroke();
		context.fillStyle = renderable.colour;
		context.fill();
	}
}

function atanNormalised(slope, dX, dY) {
	var angle = toDegrees(Math.atan(slope));
	var effectiveAngle = angle;
	if (dX < 0 && dY < 0) {
		effectiveAngle += 180;
	} else if (dX < 0 && dY > 0) {
		effectiveAngle += 180;
	} else if (dX > 0 && dY < 0) {
		effectiveAngle = 360 + effectiveAngle;
	}
	return effectiveAngle;
}

function rotateAbout(x, y, cX, cY, angle) {
	var r = distance(x, y, cX, cY);
	var a = atanNormalised((cY - y) / dezeroify(cX - x), dezeroify(x - cX), dezeroify(y - cY));
	a += angle;
	var x2 = r * Math.cos(toRadians(a));
	var y2 = r * Math.sin(toRadians(a));
	return [x2 + cX, y2 + cY];
}


function RENDERABLE_ANIMATION_BOB(renderable, additionals) {
	var progress = renderable.timeElapsed / renderable.max;
	var amplitude = additionals.amplitude;
	
	for (i = 0; i < renderable.trans.length; i++) {
		renderable.points[i] = [renderable.trans[i][0], renderable.trans[i][1] - amplitude * Math.abs(Math.sin(progress * 2 * Math.PI)), renderable.trans[i][2]];
		renderable.trans[i] = renderable.points[i];
	}
}

function RENDERABLE_ANIMATION_ROTATE(renderable, additionals) {
	var progress = renderable.timeElapsed / renderable.max;
	var amplitude = additionals.amplitude;
	
	for (i = 0; i < renderable.trans.length; i++) {
		renderable.points[i] = rotateAbout(renderable.points[i][0], renderable.points[i][1], additionals.centreX, additionals.centreY, 2 * Math.PI / renderable.max);
		renderable.trans[i] = renderable.points[i];
	}
}

window.onmousemove = function(e) {
	mouseX = e.clientX;
	mouseY = e.clientY;
}

window.onclick = function(e) {
	if (document.getElementById("SHADER") === null) {
		for (p = 0; p < palette.options.length; p++) {
			if (mouseX - centreX < palette.options[p].object.x + 40 &&
			mouseX - centreX > palette.options[p].object.x - 40 &&
			mouseY - centreY < palette.options[p].object.y + 40 &&
			mouseY - centreY > palette.options[p].object.y - 40) {
				if (p === 0) {
					document.body.appendChild(shader);
					transitionTarget = ("accinfo.html");
				} else if (p === 1) {
					document.body.appendChild(shader);
					transitionTarget = ("decodeVideo.html");
				} else if (p === 2) {
					document.body.appendChild(shader);
					transitionTarget = ("garden.html");
				} else if (p === 3) {
					document.body.appendChild(shader);
					transitionTarget = ("TrackProgress.html");
				} else if (p === 4) {
					document.body.appendChild(shader);
					transitionTarget = ("share.html");
				}
			}
		}
	}
}