var canvas;
var context;

var centreX = window.innerWidth / 2;
var centreY = window.innerHeight / 2;

var lastTime = -1;
var firstTime = -1;

var blockSize = 1;

var yaw = 0;
var pitch = 0;

var objects = [];
var objects2D = [];
var objects2Dpriority = [];

var cameraX = -1;
var cameraY = -1;
var cameraZ = -1;
var cameraRadius = 800;

var camera = null;

var PLAYER_FORCE_LEFT = new Vector(80, 180);
var PLAYER_FORCE_RIGHT = new Vector(80, 0);
var PLAYER_FORCE_DOWN = new Vector(80, 90);
var PLAYER_FORCE_UP = new Vector(80, 270);

var shaderAlpha = 1;
var shader = null;
var transitionTarget = "";

var inventory = null;
var market = null;

var mouseX = 0;
var mouseY = 0;

var pointerCursor = false;

var itemInHand = null;

var points = 0;

var flag = false;

window.onload = function() {
	canvas = document.getElementById("theCANVAS");
	canvas.style.position = "absolute";
	canvas.style.left = "0px";
	canvas.style.top = "0px";
	canvas.style.padding = "0px";
	canvas.width = "" + window.innerWidth + "";
	canvas.height = "" + window.innerHeight + "";
	canvas.style.backgroundColor = "rgba(190, 210, 255, 1)";
	
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

	context = canvas.getContext("2d");

	var http = new XMLHttpRequest();
	http.open("GET", "receiveGarden2.php", true);
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	http.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var json = (this.responseText);
			var decoded = JSON.parse(json);
			objects = decoded[0];
			//var inv = decoded[1];
			/*inventory = new Inventory(-centreX, -centreY);
			for (m = 0; m < inventory.slots.length; m++) {
				inventory.slots[m].amount = parseInt(inv[m]);
			}*/
			flag = true;
		}
	}
	http.send();
	
	//var platform = new Platform();
	
	var obj2D = new Object2D(300, 0, new Sprite([new Renderable([[0, 0], [0, 40], [90, 40], [90, 0]], "rgba(255,255,255,.6)", "rgba(0,0,0,0)")]));
	for (n = 0; n < 32; n++) {
		var cloud = new Cloud(Math.random() * (window.innerWidth + 200) - centreX - 100, Math.random() * window.innerHeight - centreY, 150 + Math.random() * 100, Math.random() * 40 + 10);
		cloud.object.velocity = new Vector(Math.random() * 10 + 5, 0);
		cloud.object.grounded = false;
		cloud.object.randomY = true;
	}
	
	//var grass = new Grass(0,.001,0);
	
	/*for (n = 0; n < 4; n++) {
		var tree = new TriangleTree(Math.random() * 300 - 150,.001,Math.random() * 300 - 150);
		tree = new BubbleTree(Math.random() * 300 - 150,.001,Math.random() * 300 - 150);
		tree = new BubbleTreeLarge(Math.random() * 300 - 150,.001,Math.random() * 300 - 150);
		new Brush(Math.random() * 300 - 150,.001,Math.random() * 300 - 150);
		new MushroomFlat(Math.random() * 300 - 150,.001,Math.random() * 300 - 150);
		new GoldenRose(Math.random() * 300 - 150,.001,Math.random() * 300 - 150);
		new FlowerBunch(Math.random() * 300 - 150,.001,Math.random() * 300 - 150);
		new MushroomGang(Math.random() * 300 - 150,.001,Math.random() * 300 - 150);
	}*/
	
	camera = new Object2D(0, 0, null);
	camera.minX = 0;
	camera.maxX = 360;
	camera.y = 25;
	camera.yBound = true; camera.minY = 5; camera.maxY = 90;
	camera.velocity = new Vector(30, 0);
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", "receive.php", true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			points = (this.responseText);
		}
	}
	xmlhttp.send();
	
	//inventory = new Inventory(-centreX,-centreY);
	//market = new Market(centreX - 300, -centreY);
	
//flag=true;
	sortPerspective();
	setInterval(updateLoop, 5);
}

function Inventory(x, y) {
	var renderables = [];
	renderables.push(new Renderable([[10,10],[290,10],[290,centreY*2 - 10],[0,window.centreY*2]], "rgba(0,0,0,.1)", "rgba(0,0,0,0)"));
	this.object = new Object2D(x,y,new Sprite(renderables));
	this.slots = [];
	for (n = 0; n < 13; n++) {
		this.slots[n] = new InventorySlot(x + 30 + 80 * parseInt(n % 3),y + 60 + 20 + (90) * parseInt(n / 3), n);
	}
}

function InventorySlot(x,y,id) {
	var renderables = [];
	renderables.push(new Renderable([[0,0],[0,70],[70,70],[70,0]], "rgba(0,0,0,.1)", "rgba(0,0,0,0)"));
	
	this.id = id;
	
	
	this.object = new Object2D(x,y,new Sprite(renderables));
	this.item = new Item(x,y,id);
	this.amount = 0;
}

function Market(x, y) {
	var renderables = [];
	renderables.push(new Renderable([[10,10],[290,10],[290,centreY*2 - 10],[0,window.centreY*2]], "rgba(0,0,0,.1)", "rgba(0,0,0,0)"));
	this.object = new Object2D(x,y,new Sprite(renderables));
	this.slots = [];
	this.prices = [50,80,60,5,10,12,15,20,15,15,12,100,300];
	for (n = 0; n < 13; n++) {
		this.slots[n] = new MarketSlot(x + 30 + 80 * parseInt(n % 3),y + 60 + 20 + (90) * parseInt(n / 3),n);
		this.slots[n].price = this.prices[n];
	}
}

function MarketSlot(x,y,id) {
	var renderables = [];
	renderables.push(new Renderable([[0,0],[0,70],[70,70],[70,0]], "rgba(0,0,0,.1)", "rgba(0,0,0,0)"));
	
	this.id = id;

	this.object = new Object2D(x,y,new Sprite(renderables));
	this.item = new Item(x,y,id);
	this.price = 1;
}

function Item(x, y, id) {
	this.id = id;
	switch (id) {
		case 0: {
			var colours = ["rgba(14, 245, 97, 1)", "rgba(14, 225, 77, 1)", "rgba(14, 195, 77, 1)", "rgba(14, 215, 77, 1)"];
			var yO = Math.random() * 10;
			var renderables = [];
			renderables.push(new RenderableRectangle3D(0,0,0,5,50+yO,"rgba(185,113,43,1)","rgba(0,0,0,0)"));
			renderables.push(new RenderableCircle3D(20,20,15,0,60+yO,0, colours[(parseInt(colours.length * Math.random()))]));
			renderables.push(new RenderableCircle3D(15,15,15,-10,45+yO,0, colours[(parseInt(colours.length * Math.random()))]));
			renderables.push(new RenderableCircle3D(15,15,15,5,35+yO,0, colours[(parseInt(colours.length * Math.random()))]));
			renderables.push(new RenderableCircle3D(10,10,15,4,45+yO,0, colours[(parseInt(colours.length * Math.random()))]));
			
			var scale = .75;
			for (r = 0; r < renderables.length; r++) {
				for (p = 0; p < renderables[r].points.length; p++) {
					renderables[r].points[p][0] *= scale;
					renderables[r].points[p][1] *= -scale;
				}
			}
			var sprite = new Sprite(renderables);
			
			this.object = new Object2DPriority(x+35,y+70,sprite);

			break;
		}
		case 1: {
			var colours = ["rgb(49, 175, 60)", "rgb(43, 188, 56)", "rgb(34, 165, 46)", "rgb(24, 135, 34)"];			
			var yO = Math.random() * 10;
			var renderables = [];
			renderables.push(new RenderableRectangle3D(0,0,0,8,80+yO,"rgba(155,83,13,1)","rgba(0,0,0,0)"));
			renderables.push(new RenderableCircle3D(15,15,20,-5,80+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)"));
			renderables.push(new RenderableCircle3D(14,14,20,-7,70+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)"));
			renderables.push(new RenderableCircle3D(15,15,20,6,70+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)"));
			renderables.push(new RenderableCircle3D(10,10,20,-4,60+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)"));
			renderables.push(new RenderableCircle3D(15,15,20,6,50+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)"));
			renderables.push(new RenderableCircle3D(17,17,20,-5,40+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)"));
			renderables.push(new RenderableCircle3D(14,14,20,6,35+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)"));
			
			var scale = .75;
			for (r = 0; r < renderables.length; r++) {
				for (p = 0; p < renderables[r].points.length; p++) {
					renderables[r].points[p][0] *= scale;
					renderables[r].points[p][1] *= -scale;
				}
			}
			var sprite = new Sprite(renderables);
			
			this.object = new Object2DPriority(x+35,y+70,sprite);

			break;
		}
		case 2: {
			var colours = ["rgb(65, 181, 92)", "rgb(89, 219, 117)", "rgb(81, 188,107)", "rgb(87, 209, 114)"];		
			var yO = Math.random() * 10;
			var renderables = [];
			renderables.push(new RenderableRectangle3D(0,0,0,5,50+yO,"rgba(195,123,53,1)","rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[-15, 30, 0], [15, 30, 0], [0, 80, 0]], colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[-20, 25, 0], [5, 25, 0], [-7, 60, 0]], colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[-5, 20, 0], [15, 20, 0], [5, 50, 0]], colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[-12, 15, 0], [5, 15, 0], [-4, 40, 0]], colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)"));
			
			var scale = .75;
			for (r = 0; r < renderables.length; r++) {
				for (p = 0; p < renderables[r].points.length; p++) {
					renderables[r].points[p][0] *= scale;
					renderables[r].points[p][1] *= -scale;
				}
			}
			var sprite = new Sprite(renderables);
			
			this.object = new Object2DPriority(x+35,y+70,sprite);

			break;
		}
		case 3: {
			var colours = ["rgba(14, 205, 77, 1)","rgba(14, 235, 107, 1)","rgba(14, 195, 67, 1)"];			
			var yO = Math.random() * 10;
			var renderables = [];
			var colour = colours[(parseInt(colours.length * Math.random()))];
			renderables.push(new AnimatedRenderable([[0, 0, 0],[-6,6,0],[-10,14,0],[-2,8,0]], colour,"rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[0, 0, 0],[6,6,0],[10,14,0],[2,8,0]], colour,"rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[0, 0, 0],[-10,3,0],[-16,9,0],[-8,6,0]], colour,"rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[0, 0, 0],[10,3,0],[16,9,0],[8,6,0]], colour,"rgba(0,0,0,0)"));
			
			var scale = 1.3;
			for (r = 0; r < renderables.length; r++) {
				for (p = 0; p < renderables[r].points.length; p++) {
					renderables[r].points[p][0] *= scale;
					renderables[r].points[p][1] *= -scale;
				}
			}
			var sprite = new Sprite(renderables);
			
			this.object = new Object2DPriority(x+35,y+70,sprite);

			break;
		}
		case 4: {
			var colours = ["rgb(249, 78, 52)", "rgb(249, 56, 27)", "rgb(249, 134, 27)", "rgb(198, 110, 27)", "rgb(238, 242, 43)", "rgb(183, 124, 234)"];			
			var yO = Math.random() * 10;
			var renderables = [];
			var colour = colours[(parseInt(colours.length * Math.random()))];
			renderables.push(new RenderableRectangle3D(0,0,0,2,15,"rgba(14, 195, 77, 1)","rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[-7, 10, 0],[-2,8,0],[0,15,0],[-7,13,0]], colour,"rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[7, 10, 0],[2,8,0],[0,15,0],[7,13,0]], colour,"rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[-7, 20, 0],[-2,22,0],[0,15,0],[-7,17,0]], colour,"rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[7, 20, 0],[2,22,0],[0,15,0],[7,17,0]], colour,"rgba(0,0,0,0)"));
			
			renderables.push(new AnimatedRenderable([[0, 0, 0],[-10,3,0],[-16,9,0],[-8,6,0]], "rgba(14, 185, 47, 1)","rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[0, 0, 0],[10,3,0],[16,9,0],[8,6,0]], "rgba(14, 185, 47, 1)","rgba(0,0,0,0)"));
			
			var scale = 1.3;
			for (r = 0; r < renderables.length; r++) {
				for (p = 0; p < renderables[r].points.length; p++) {
					renderables[r].points[p][0] *= scale;
					renderables[r].points[p][1] *= -scale;
				}
			}
			var sprite = new Sprite(renderables);
			
			this.object = new Object2DPriority(x+35,y+70,sprite);

			break;
		}
		case 5: {
			var colours = ["rgb(255,255,255)", "rgb(238, 219, 255)", "rgb(160, 255, 193)"];			
			var yO = Math.random() * 10;
			var renderables = [];
			var colour = colours[(parseInt(colours.length * Math.random()))];
			renderables.push(new RenderableRectangle3D(0,0,0,2,15,"rgba(14, 195, 77, 1)","rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[0, 10, 0],[-5,15,0],[0,20,0],[5,15,0]], colour,"rgba(0,0,0,0)"));
			
			renderables.push(new AnimatedRenderable([[0, 0, 0],[-10,3,0],[-16,9,0],[-8,6,0]], "rgba(14, 185, 47, 1)","rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[0, 0, 0],[10,3,0],[16,9,0],[8,6,0]], "rgba(14, 185, 47, 1)","rgba(0,0,0,0)"));
			
			var scale = 1.3;
			for (r = 0; r < renderables.length; r++) {
				for (p = 0; p < renderables[r].points.length; p++) {
					renderables[r].points[p][0] *= scale;
					renderables[r].points[p][1] *= -scale;
				}
			}
			var sprite = new Sprite(renderables);
			
			this.object = new Object2DPriority(x+35,y+70,sprite);

			break;
		}
		case 6: {
			var colours = ["rgb(186, 141, 98)","rgb(166, 121, 78)","rgb(146, 101, 58)"];			
			var yO = Math.random() * 15;
			var renderables = [];
			var colour = colours[(parseInt(colours.length * Math.random()))];
			renderables.push(new RenderableRectangle3D(0,0,0,4,10+yO,"rgb(252, 220, 189)","rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[-5, 7+yO, 0],[-6,9+yO,0],[-4,13+yO,0],[4,13+yO,0],[6,9+yO,0],[5,7+yO,0]], colour,"rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[-4, 2+yO, 0],[-4,4+yO,0],[4,4+yO,0],[4,2+yO,0]], "rgb(242, 210, 179)","rgba(0,0,0,0)"));
			
			var scale = 1.3;
			for (r = 0; r < renderables.length; r++) {
				for (p = 0; p < renderables[r].points.length; p++) {
					renderables[r].points[p][0] *= scale;
					renderables[r].points[p][1] *= -scale;
				}
			}
			var sprite = new Sprite(renderables);
			
			this.object = new Object2DPriority(x+35,y+70,sprite);

			break;
		}
		case 7: {
			var colours = ["rgb(198, 82, 23)"];			
			var yO = Math.random() * 10;
			var renderables = [];
			var colour = colours[(parseInt(colours.length * Math.random()))];
			renderables.push(new RenderableRectangle3D(0,0,0,4,10+yO,"rgb(252, 220, 189)","rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[-4, 7+yO, 0],[-5,11+yO,0],[-3,16+yO,0],[3,16+yO,0],[5,11+yO,0],[4,7+yO,0]], colour,"rgba(0,0,0,0)"));
			renderables.push(new RenderableCircle3D(1,1,10,-2,10+yO,0, "rgb(255,255,255,1)","rgba(0,0,0,0)"));
			renderables.push(new RenderableCircle3D(1,1,10,1,12+yO,0, "rgb(255,255,255,1)","rgba(0,0,0,0)"));
			renderables.push(new RenderableCircle3D(1,1,10,3,9+yO,0, "rgb(255,255,255,1)","rgba(0,0,0,0)"));
			renderables.push(new RenderableCircle3D(1,1,10,-1,14+yO,0, "rgb(255,255,255,1)","rgba(0,0,0,0)"));
			
			var scale = 1.3;
			for (r = 0; r < renderables.length; r++) {
				for (p = 0; p < renderables[r].points.length; p++) {
					renderables[r].points[p][0] *= scale;
					renderables[r].points[p][1] *= -scale;
				}
			}
			var sprite = new Sprite(renderables);
			
			this.object = new Object2DPriority(x+35,y+70,sprite);

			break;
		}
		case 8: {
			var colours = ["rgb(255, 225, 193)","rgb(255, 246, 237)","rgb(255, 232, 209)"];			
			var yO = Math.random() * 10;
			var renderables = [];
			var colour = colours[(parseInt(colours.length * Math.random()))];
			renderables.push(new RenderableRectangle3D(0,0,0,4,15,"rgb(214, 192, 171)","rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[-6, 7, 0],[-5, 10, 0],[-5,22,0],[-4,25,0],[4,25,0],[5,22,0],[5,10,0],[6,7,0]], colour,"rgba(0,0,0,0)"));	
			
			var scale = 1.3;
			for (r = 0; r < renderables.length; r++) {
				for (p = 0; p < renderables[r].points.length; p++) {
					renderables[r].points[p][0] *= scale;
					renderables[r].points[p][1] *= -scale;
				}
			}
			var sprite = new Sprite(renderables);
			
			this.object = new Object2DPriority(x+35,y+70,sprite);

			break;
		}
		case 9: {
			var colours = ["rgb(255,255,255)", "rgb(238, 219, 255)", "rgb(160, 255, 193)","rgb(255, 253, 147)"];
	
			var offset = Math.random() * 1.7;
			var renderables = [];
			var yO = Math.random() * 10;
			for (l = 0; l < Math.random() * 3 + 5; l++) {
				var colour = colours[(parseInt(colours.length * Math.random()))];
				var d = Math.random() * 50 - 25;
				renderables.push(new RenderableRectangle3D(d,0,0,2,15,"rgba(14, 195, 77, 1)","rgba(0,0,0,0)"));
				
				renderables.push(new AnimatedRenderable([[d, 10, 0],[-5+d,15,0],[0+d,20,0],[5+d,15,0]], colour,"rgba(0,0,0,0)"));
			}
			
			var scale = 1.3;
			for (r = 0; r < renderables.length; r++) {
				for (p = 0; p < renderables[r].points.length; p++) {
					renderables[r].points[p][0] *= scale;
					renderables[r].points[p][1] *= -scale;
				}
			}
			var sprite = new Sprite(renderables);
			
			this.object = new Object2DPriority(x+35,y+70,sprite);

			break;
		}
		case 10: {
			var colours = ["rgb(255,255,255)", "rgb(238, 219, 255)", "rgb(160, 255, 193)","rgb(255, 253, 147)"];
	
			var offset = Math.random() * 1.7;
			var renderables = [];
			var yO = Math.random() * 10;
			for (l = 0; l < Math.random() * 3 + 5; l++) {
				var colour = colours[(parseInt(colours.length * Math.random()))];
				var d = Math.random() * 50 - 25;
				renderables.push(new RenderableRectangle3D(0+d,0,0,4,10,"rgb(252, 220, 189)","rgba(0,0,0,0)"));
				renderables.push(new AnimatedRenderable([[-4+d, 7, 0],[-5+d,11,0],[-3+d,16,0],[3+d,16,0],[5+d,11,0],[4+d,7,0]], colour,"rgba(0,0,0,0)"));
			}
			
			var scale = 1.3;
			for (r = 0; r < renderables.length; r++) {
				for (p = 0; p < renderables[r].points.length; p++) {
					renderables[r].points[p][0] *= scale;
					renderables[r].points[p][1] *= -scale;
				}
			}
			var sprite = new Sprite(renderables);
			
			this.object = new Object2DPriority(x+35,y+70,sprite);

			break;
		}
		case 11: {
			var colours = ["rgb(183, 25, 25)"];			
			var yO = 18;
			var renderables = [];
			var colour = colours[(parseInt(colours.length * Math.random()))];
			renderables.push(new RenderableRectangle3D(0,0,0,2,yO,"rgba(14, 195, 77, 1)","rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[0,0+yO,0],[5,3+yO,0],[6,7+yO,0],[7,10+yO,0],[8,11+yO,0],[7,12+yO,0],[5,13+yO,0],[0,13.5+yO,0],[-5,13+yO,0],[-7,12+yO,0],[-8,11+yO,0],[-7,10+yO,0],[-6,7+yO,0],[-5,3+yO,0]], colour,"rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[0,0+yO,0],[1,5+yO,0],[4,8+yO,0],[7,10+yO,0],[6,7+yO,0],[5,3+yO,0]], "rgb(102, 11, 11)","rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[0,0+yO,0],[-5,3+yO,0],[-6,7+yO,0],[-7,10+yO,0],[-3,9+yO,0],[0,7+yO,0],[1,5+yO,0],[2,3+yO,0]], "rgb(132, 19, 19)","rgba(0,0,0,0)"));
			
			yO = 5*Math.random()+3;
			renderables.push(new AnimatedRenderable([[0, 0+yO, 0],[-5,3+yO,0],[-8,9+yO,0],[-4,6+yO,0]], colour,"rgba(0,0,0,0)"));
			yO = 5*Math.random() +8;
			renderables.push(new AnimatedRenderable([[0, 0+yO, 0],[5,3+yO,0],[8,9+yO,0],[4,6+yO,0]], colour,"rgba(0,0,0,0)"));
			
			var scale = 1.3;
			for (r = 0; r < renderables.length; r++) {
				for (p = 0; p < renderables[r].points.length; p++) {
					renderables[r].points[p][0] *= scale;
					renderables[r].points[p][1] *= -scale;
				}
			}
			var sprite = new Sprite(renderables);
			
			this.object = new Object2DPriority(x+35,y+70,sprite);

			break;
		}
		case 12: {
			var colours = ["rgb(255, 229, 38)"];					
			var yO = 18;
			var renderables = [];
			var colour = colours[(parseInt(colours.length * Math.random()))];
			renderables.push(new RenderableRectangle3D(0,0,0,2,yO,"rgba(14, 195, 77, 1)","rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[0,0+yO,0],[5,3+yO,0],[6,7+yO,0],[7,10+yO,0],[8,11+yO,0],[7,12+yO,0],[5,13+yO,0],[0,13.5+yO,0],[-5,13+yO,0],[-7,12+yO,0],[-8,11+yO,0],[-7,10+yO,0],[-6,7+yO,0],[-5,3+yO,0]], colour,"rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[0,0+yO,0],[1,5+yO,0],[4,8+yO,0],[7,10+yO,0],[6,7+yO,0],[5,3+yO,0]], "rgb(160, 145, 27)","rgba(0,0,0,0)"));
			renderables.push(new AnimatedRenderable([[0,0+yO,0],[-5,3+yO,0],[-6,7+yO,0],[-7,10+yO,0],[-3,9+yO,0],[0,7+yO,0],[1,5+yO,0],[2,3+yO,0]], "rgb(219, 200, 52)","rgba(0,0,0,0)"));
			
			yO = 5*Math.random()+3;
			renderables.push(new AnimatedRenderable([[0, 0+yO, 0],[-5,3+yO,0],[-8,9+yO,0],[-4,6+yO,0]], colour,"rgba(0,0,0,0)"));
			yO = 5*Math.random() +8;
			renderables.push(new AnimatedRenderable([[0, 0+yO, 0],[5,3+yO,0],[8,9+yO,0],[4,6+yO,0]], colour,"rgba(0,0,0,0)"));
			
			var scale = 1.3;
			for (r = 0; r < renderables.length; r++) {
				for (p = 0; p < renderables[r].points.length; p++) {
					renderables[r].points[p][0] *= scale;
					renderables[r].points[p][1] *= -scale;
				}
			}
			var sprite = new Sprite(renderables);
			
			this.object = new Object2DPriority(x+35,y+70,sprite);

			break;
		}
	}
}

function generatePlant(x,y,z,id) {
	switch(id) {
		case 0:
			new BubbleTree(x,y,z);
			break;
		case 1:
			new BubbleTreeLarge(x,y,z);
			break;	
		case 2:
			new TriangleTree(x,y,z);
			break;
		case 3:
			new Brush(x,y,z);
			break;
		case 4:
			new Flower(x,y,z);
			break;
		case 5:
			new DiamondFlower(x,y,z);
			break;
		case 6:
			new MushroomFlat(x,y,z);
			break;
		case 7:
			new MushroomPoisonous(x,y,z);
			break;
		case 8:
			new MushroomWhite(x,y,z);
			break;
		case 9:
			new FlowerBunch(x,y,z);
			break;
		case 10:
			new MushroomGang(x,y,z);
			break;
		case 11:
			new Rose(x,y,z);
			break;
		case 12:
			new GoldenRose(x,y,z);
			break;
	}
}

function Object2DPriority(x, y, sprite) {
	this.x = x;
	this.y = y;
	this.mass = 1;
	this.sprite = sprite;
	this.velocity = new Vector(0,0);
	this.acceleration = new Vector(0,0);
	this.forces = {};
	this.frictionForce = new Vector(this.mass * 12, 0);
	this.type = "2D";
	this.maxX = 0;
	this.minX = 0;
	this.yBound = false;
	this.maxY = 0;
	this.minY = 0;
	this.grounded = true;
	this.randomY = false;
	
	objects2Dpriority.push(this);
}

function Object2D(x, y, sprite) {
	this.x = x;
	this.y = y;
	this.mass = 1;
	this.sprite = sprite;
	this.velocity = new Vector(0,0);
	this.acceleration = new Vector(0,0);
	this.forces = {};
	this.frictionForce = new Vector(this.mass * 12, 0);
	this.type = "2D";
	this.maxX = 0;
	this.minX = 0;
	this.yBound = false;
	this.maxY = 0;
	this.minY = 0;
	this.grounded = true;
	this.randomY = false;
	
	objects2D.push(this);
}

function Object(x, y, z, sprite, mass) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.sprite = sprite;
	this.mass = mass;
	this.velocity = new Vector(0,0);
	this.type = "3D";
	this.direction = 1;
	this.priority = 0;
	
	objects.push(this);
}

function Brush(x, y, z) {
	var additionals = {};
	additionals['amplitude'] = 5;
	additionals['indices'] = [1,2,3];
	
	var colours = ["rgba(14, 205, 77, 1)","rgba(14, 235, 107, 1)","rgba(14, 195, 67, 1)"];
	
	var offset = Math.random() * 1.7;
	
	var yO = Math.random() * 10;
	var renderables = [];
	var colour = colours[(parseInt(colours.length * Math.random()))];
	renderables.push(new AnimatedRenderable([[0, 0, 0],[-6,6,0],[-10,14,0],[-2,8,0]], colour,"rgba(0,0,0,0)", 2, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	renderables.push(new AnimatedRenderable([[0, 0, 0],[6,6,0],[10,14,0],[2,8,0]], colour,"rgba(0,0,0,0)", 2, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	additionals['amplitude'] = 2;
	renderables.push(new AnimatedRenderable([[0, 0, 0],[-10,3,0],[-16,9,0],[-8,6,0]], colour,"rgba(0,0,0,0)", 2, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	renderables.push(new AnimatedRenderable([[0, 0, 0],[10,3,0],[16,9,0],[8,6,0]], colour,"rgba(0,0,0,0)", 2, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	
	var scale = Math.random() * .4 + 1.4;
	for (r = 0; r < renderables.length; r++) {
		renderables[r].timeElapsed = offset;
		for (p = 0; p < renderables[r].points.length; p++) {
			renderables[r].points[p][0] *= scale;
			renderables[r].points[p][1] *= scale;
		}
	}
	var sprite = new Sprite(renderables);
	this.object = new Object(x,y,z,sprite,1);
}

function Flower(x, y, z) {
	var additionals = {};
	additionals['amplitude'] = 5;
	additionals['indices'] = [1,2,3];
	
	var colours = ["rgb(249, 78, 52)", "rgb(249, 56, 27)", "rgb(249, 134, 27)", "rgb(198, 110, 27)", "rgb(238, 242, 43)", "rgb(183, 124, 234)"];
	
	var offset = Math.random() * 1.7;
	
	var yO = Math.random() * 10;
	var renderables = [];
	var colour = colours[(parseInt(colours.length * Math.random()))];
	renderables.push(new RenderableRectangle3D(0,0,0,2,15,"rgba(14, 195, 77, 1)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	renderables.push(new AnimatedRenderable([[-7, 10, 0],[-2,8,0],[0,15,0],[-7,13,0]], colour,"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new AnimatedRenderable([[7, 10, 0],[2,8,0],[0,15,0],[7,13,0]], colour,"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new AnimatedRenderable([[-7, 20, 0],[-2,22,0],[0,15,0],[-7,17,0]], colour,"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new AnimatedRenderable([[7, 20, 0],[2,22,0],[0,15,0],[7,17,0]], colour,"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	
	renderables.push(new AnimatedRenderable([[0, 0, 0],[-10,3,0],[-16,9,0],[-8,6,0]], "rgba(14, 185, 47, 1)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	renderables.push(new AnimatedRenderable([[0, 0, 0],[10,3,0],[16,9,0],[8,6,0]], "rgba(14, 185, 47, 1)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	
	var scale = Math.random() * .4 + .8;
	for (r = 0; r < renderables.length; r++) {
		renderables[r].timeElapsed = offset;
		for (p = 0; p < renderables[r].points.length; p++) {
			renderables[r].points[p][0] *= scale;
			renderables[r].points[p][1] *= scale;
		}
	}
	var sprite = new Sprite(renderables);
	this.object = new Object(x,y,z,sprite,1);
}

function DiamondFlower(x, y, z) {
	var additionals = {};
	additionals['amplitude'] = 5;
	additionals['indices'] = [1,2,3];
	
	var colours = ["rgb(255,255,255)", "rgb(238, 219, 255)", "rgb(160, 255, 193)"];
	
	var offset = Math.random() * 1.7;
	
	var yO = Math.random() * 10;
	var renderables = [];
	var colour = colours[(parseInt(colours.length * Math.random()))];
	renderables.push(new RenderableRectangle3D(0,0,0,2,15,"rgba(14, 195, 77, 1)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	renderables.push(new AnimatedRenderable([[0, 10, 0],[-5,15,0],[0,20,0],[5,15,0]], colour,"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	
	renderables.push(new AnimatedRenderable([[0, 0, 0],[-10,3,0],[-16,9,0],[-8,6,0]], "rgba(14, 185, 47, 1)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	renderables.push(new AnimatedRenderable([[0, 0, 0],[10,3,0],[16,9,0],[8,6,0]], "rgba(14, 185, 47, 1)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	
	var scale = Math.random() * .4 + .8;
	for (r = 0; r < renderables.length; r++) {
		renderables[r].timeElapsed = offset;
		for (p = 0; p < renderables[r].points.length; p++) {
			renderables[r].points[p][0] *= scale;
			renderables[r].points[p][1] *= scale;
		}
	}
	var sprite = new Sprite(renderables);
	this.object = new Object(x,y,z,sprite,1);
}

function Rose(x, y, z) {
	var additionals = {};
	additionals['amplitude'] = 5;
	additionals['indices'] = [1,2,3];
	
	var colours = ["rgb(183, 25, 25)"];
	
	var offset = Math.random() * 1.7;
	
	var yO = 18;
	var renderables = [];
	var colour = colours[(parseInt(colours.length * Math.random()))];
	renderables.push(new RenderableRectangle3D(0,0,0,2,yO,"rgba(14, 195, 77, 1)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	renderables.push(new AnimatedRenderable([[0,0+yO,0],[5,3+yO,0],[6,7+yO,0],[7,10+yO,0],[8,11+yO,0],[7,12+yO,0],[5,13+yO,0],[0,13.5+yO,0],[-5,13+yO,0],[-7,12+yO,0],[-8,11+yO,0],[-7,10+yO,0],[-6,7+yO,0],[-5,3+yO,0]], colour,"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new AnimatedRenderable([[0,0+yO,0],[1,5+yO,0],[4,8+yO,0],[7,10+yO,0],[6,7+yO,0],[5,3+yO,0]], "rgb(102, 11, 11)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new AnimatedRenderable([[0,0+yO,0],[-5,3+yO,0],[-6,7+yO,0],[-7,10+yO,0],[-3,9+yO,0],[0,7+yO,0],[1,5+yO,0],[2,3+yO,0]], "rgb(132, 19, 19)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	
	yO = 5*Math.random()+3;
	renderables.push(new AnimatedRenderable([[0, 0+yO, 0],[-5,3+yO,0],[-8,9+yO,0],[-4,6+yO,0]], colour,"rgba(0,0,0,0)", 2, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	yO = 5*Math.random() +8;
	renderables.push(new AnimatedRenderable([[0, 0+yO, 0],[5,3+yO,0],[8,9+yO,0],[4,6+yO,0]], colour,"rgba(0,0,0,0)", 2, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	
	//renderables.push(new AnimatedRenderable([[0,0],[5,3],[6,7],[7,10],[8,11],[7,12],[5,13],[0,13.5]], colour,"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	
	var scale = Math.random() * .4+.8;
	for (r = 0; r < renderables.length; r++) {
		renderables[r].timeElapsed = offset;
		for (p = 0; p < renderables[r].points.length; p++) {
			renderables[r].points[p][0] *= scale;
			renderables[r].points[p][1] *= scale;
		}
	}
	var sprite = new Sprite(renderables);
	this.object = new Object(x,y,z,sprite,1);
}

function GoldenRose(x, y, z) {
	var additionals = {};
	additionals['amplitude'] = 5;
	additionals['indices'] = [1,2,3];
	
	var colours = ["rgb(255, 229, 38)"];
	
	var offset = Math.random() * 1.7;
	
	var yO = 18;
	var renderables = [];
	var colour = colours[(parseInt(colours.length * Math.random()))];
	renderables.push(new RenderableRectangle3D(0,0,0,2,yO,"rgba(14, 195, 77, 1)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	renderables.push(new AnimatedRenderable([[0,0+yO,0],[5,3+yO,0],[6,7+yO,0],[7,10+yO,0],[8,11+yO,0],[7,12+yO,0],[5,13+yO,0],[0,13.5+yO,0],[-5,13+yO,0],[-7,12+yO,0],[-8,11+yO,0],[-7,10+yO,0],[-6,7+yO,0],[-5,3+yO,0]], colour,"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new AnimatedRenderable([[0,0+yO,0],[1,5+yO,0],[4,8+yO,0],[7,10+yO,0],[6,7+yO,0],[5,3+yO,0]], "rgb(160, 145, 27)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new AnimatedRenderable([[0,0+yO,0],[-5,3+yO,0],[-6,7+yO,0],[-7,10+yO,0],[-3,9+yO,0],[0,7+yO,0],[1,5+yO,0],[2,3+yO,0]], "rgb(219, 200, 52)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	
	yO = 5*Math.random()+3;
	renderables.push(new AnimatedRenderable([[0, 0+yO, 0],[-5,3+yO,0],[-8,9+yO,0],[-4,6+yO,0]], colour,"rgba(0,0,0,0)", 2, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	yO = 5*Math.random() +8;
	renderables.push(new AnimatedRenderable([[0, 0+yO, 0],[5,3+yO,0],[8,9+yO,0],[4,6+yO,0]], colour,"rgba(0,0,0,0)", 2, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	
	//renderables.push(new AnimatedRenderable([[0,0],[5,3],[6,7],[7,10],[8,11],[7,12],[5,13],[0,13.5]], colour,"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	
	var scale = Math.random() * .4+.8;
	for (r = 0; r < renderables.length; r++) {
		renderables[r].timeElapsed = offset;
		for (p = 0; p < renderables[r].points.length; p++) {
			renderables[r].points[p][0] *= scale;
			renderables[r].points[p][1] *= scale;
		}
	}
	var sprite = new Sprite(renderables);
	this.object = new Object(x,y,z,sprite,1);
}

function MushroomFlat(x, y, z) {
	var additionals = {};
	additionals['amplitude'] = 5;
	additionals['indices'] = [2,3];
	
	var colours = ["rgb(186, 141, 98)","rgb(166, 121, 78)","rgb(146, 101, 58)"];
	
	var offset = Math.random() * 1.7;
	
	var yO = Math.random() * 15;
	var renderables = [];
	var colour = colours[(parseInt(colours.length * Math.random()))];
	renderables.push(new RenderableRectangle3D(0,0,0,4,10+yO,"rgb(252, 220, 189)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	renderables.push(new AnimatedRenderable([[-5, 7+yO, 0],[-6,9+yO,0],[-4,13+yO,0],[4,13+yO,0],[6,9+yO,0],[5,7+yO,0]], colour,"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new AnimatedRenderable([[-4, 2+yO, 0],[-4,4+yO,0],[4,4+yO,0],[4,2+yO,0]], "rgb(242, 210, 179)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	
	
	var scale = Math.random() * .4 + .9;
	for (r = 0; r < renderables.length; r++) {
		renderables[r].timeElapsed = offset;
		for (p = 0; p < renderables[r].points.length; p++) {
			renderables[r].points[p][0] *= scale;
			renderables[r].points[p][1] *= scale;
		}
	}
	var sprite = new Sprite(renderables);
	this.object = new Object(x,y,z,sprite,1);
}

function MushroomPoisonous(x, y, z) {
	var additionals = {};
	additionals['amplitude'] = 5;
	additionals['indices'] = [2,3];
	
	var colours = ["rgb(198, 82, 23)"];
	
	var offset = Math.random() * 1.7;
	
	var yO = Math.random() * 10;
	var renderables = [];
	var colour = colours[(parseInt(colours.length * Math.random()))];
	renderables.push(new RenderableRectangle3D(0,0,0,4,10+yO,"rgb(252, 220, 189)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	renderables.push(new AnimatedRenderable([[-4, 7+yO, 0],[-5,11+yO,0],[-3,16+yO,0],[3,16+yO,0],[5,11+yO,0],[4,7+yO,0]], colour,"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new RenderableCircle3D(1,1,10,-2,10+yO,0, "rgb(255,255,255,1)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new RenderableCircle3D(1,1,10,1,12+yO,0, "rgb(255,255,255,1)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new RenderableCircle3D(1,1,10,3,9+yO,0, "rgb(255,255,255,1)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new RenderableCircle3D(1,1,10,-1,14+yO,0, "rgb(255,255,255,1)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));

	
	var scale = Math.random() * .4 + .9;
	for (r = 0; r < renderables.length; r++) {
		renderables[r].timeElapsed = offset;
		for (p = 0; p < renderables[r].points.length; p++) {
			renderables[r].points[p][0] *= scale;
			renderables[r].points[p][1] *= scale;
		}
	}
	var sprite = new Sprite(renderables);
	this.object = new Object(x,y,z,sprite,1);
}

function MushroomWhite(x, y, z) {
	var additionals = {};
	additionals['amplitude'] = 5;
	additionals['indices'] = [2,3];
	
	var colours = ["rgb(255, 225, 193)","rgb(255, 246, 237)","rgb(255, 232, 209)"];
	
	var offset = Math.random() * 1.7;
	
	var yO = Math.random() * 10;
	var renderables = [];
	var colour = colours[(parseInt(colours.length * Math.random()))];
	renderables.push(new RenderableRectangle3D(0,0,0,4,15,"rgb(214, 192, 171)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	renderables.push(new AnimatedRenderable([[-6, 7, 0],[-5, 10, 0],[-5,22,0],[-4,25,0],[4,25,0],[5,22,0],[5,10,0],[6,7,0]], colour,"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));	
	
	var scale = Math.random() * .8 + .5;
	for (r = 0; r < renderables.length; r++) {
		renderables[r].timeElapsed = offset;
		for (p = 0; p < renderables[r].points.length; p++) {
			renderables[r].points[p][0] *= scale;
			renderables[r].points[p][1] *= scale;
		}
	}
	var sprite = new Sprite(renderables);
	this.object = new Object(x,y,z,sprite,1);
}

function MushroomGang(x, y, z) {
	var additionals = {};
	additionals['amplitude'] = 5;
	additionals['indices'] = [2,3];
	
	var colours = ["rgb(160, 118, 59)","rgb(180, 138, 79)","rgb(181, 165, 143)","rgb(255, 225, 193)","rgb(255, 246, 237)"];
	
	var offset = Math.random() * 1.7;
	
	var yO = Math.random() * 10;
	for (l = 0; l < Math.random() * 4 + 3; l++) {
		var renderables = [];
		var colour = colours[(parseInt(colours.length * Math.random()))];
		renderables.push(new RenderableRectangle3D(0,0,0,4,10,"rgb(252, 220, 189)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
		renderables.push(new AnimatedRenderable([[-4, 7, 0],[-5,11,0],[-3,16,0],[3,16,0],[5,11,0],[4,7,0]], colour,"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
		
		var scale = Math.random() * .4 + .4;
		for (r = 0; r < renderables.length; r++) {
			renderables[r].timeElapsed = offset + Math.random() * .1;
			for (p = 0; p < renderables[r].points.length; p++) {
				renderables[r].points[p][0] *= scale;
				renderables[r].points[p][1] *= scale;
			}
		}
		var sprite = new Sprite(renderables);
		this.object = new Object(x+Math.random() * 25 - 12,y,z+Math.random() * 25 - 12,sprite,1);
	} 
}

function FlowerBunch(x, y, z) {
	var additionals = {};
	additionals['amplitude'] = 5;
	additionals['indices'] = [2,3];
	
	var colours = ["rgb(255,255,255)", "rgb(238, 219, 255)", "rgb(160, 255, 193)","rgb(255, 253, 147)"];
	
	var offset = Math.random() * 1.7;
	
	var yO = Math.random() * 10;
	for (l = 0; l < Math.random() * 4 + 3; l++) {
		var renderables = [];
		var colour = colours[(parseInt(colours.length * Math.random()))];
		renderables.push(new RenderableRectangle3D(0,0,0,2,15,"rgba(14, 195, 77, 1)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
		renderables.push(new AnimatedRenderable([[0, 10, 0],[-5,15,0],[0,20,0],[5,15,0]], colour,"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
		
		var scale = Math.random() * .4 + .4;
		for (r = 0; r < renderables.length; r++) {
			renderables[r].timeElapsed = offset + Math.random() * .1;
			for (p = 0; p < renderables[r].points.length; p++) {
				renderables[r].points[p][0] *= scale;
				renderables[r].points[p][1] *= scale;
			}
		}
		var sprite = new Sprite(renderables);
		this.object = new Object(x+Math.random() * 25 - 12,y,z+Math.random() * 25 - 12,sprite,1);
	} 
}

function TriangleTree(x, y, z) {
	var additionals = {};
	additionals['amplitude'] = 3;
	additionals['indices'] = [2,3];
	
	var colours = ["rgb(65, 181, 92)", "rgb(89, 219, 117)", "rgb(81, 188,107)", "rgb(87, 209, 114)"];
	
	var offset = Math.random() * 1.7;
	
	var yO = Math.random() * 10;
	var renderables = [];
	renderables.push(new RenderableRectangle3D(0,0,0,5,50+yO,"rgba(195,123,53,1)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	renderables.push(new AnimatedRenderable([[-15, 30, 0], [15, 30, 0], [0, 80, 0]], colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new AnimatedRenderable([[-20, 25, 0], [5, 25, 0], [-7, 60, 0]], colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new AnimatedRenderable([[-5, 20, 0], [15, 20, 0], [5, 50, 0]], colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new AnimatedRenderable([[-12, 15, 0], [5, 15, 0], [-4, 40, 0]], colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));

	var scale = 1 + .3 * Math.random();
	for (r = 0; r < renderables.length; r++) {
		renderables[r].timeElapsed = offset + Math.random() * .15;
		var xF = Math.random() * 6 - 3;
		var yF = Math.random() * 6 - 3;
		for (p = 0; p < renderables[r].points.length; p++) {
			renderables[r].points[p][0] += xF;
			renderables[r].points[p][1] += yF;
			renderables[r].points[p][0] *= scale;
			renderables[r].points[p][1] *= scale;
		}
	}
	var sprite = new Sprite(renderables);
	this.object = new Object(x,y,z,sprite,1);
}

function BubbleTree(x, y, z) {
	var additionals = {};
	additionals['amplitude'] = 3;
	additionals['indices'] = [2,3];
	
	var colours = ["rgba(14, 245, 97, 1)", "rgba(14, 225, 77, 1)", "rgba(14, 195, 77, 1)", "rgba(14, 215, 77, 1)"];
	
	var offset = Math.random() * 1.7;
	
	var yO = Math.random() * 10;
	var renderables = [];
	renderables.push(new RenderableRectangle3D(0,0,0,5,50+yO,"rgba(185,113,43,1)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	renderables.push(new RenderableCircle3D(20,20,15,0,60+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new RenderableCircle3D(15,15,15,-10,45+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new RenderableCircle3D(15,15,15,5,35+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new RenderableCircle3D(10,10,15,4,45+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	var scale = 1 + .3 * Math.random();
	for (r = 0; r < renderables.length; r++) {
		renderables[r].timeElapsed = offset + Math.random() * .15;
		var xF = Math.random() * 6 - 3;
		var yF = Math.random() * 6 - 3;
		for (p = 0; p < renderables[r].points.length; p++) {
			renderables[r].points[p][0] += xF;
			renderables[r].points[p][1] += yF;
			renderables[r].points[p][0] *= scale;
			renderables[r].points[p][1] *= scale;
		}
	}
	var sprite = new Sprite(renderables);
	this.object = new Object(x,y,z,sprite,1);
}

function BubbleTreeLarge(x, y, z) {
	var additionals = {};
	additionals['amplitude'] = 3;
	additionals['indices'] = [2,3];
	
	var colours = ["rgb(49, 175, 60)", "rgb(43, 188, 56)", "rgb(34, 165, 46)", "rgb(24, 135, 34)"];
	
	var offset = Math.random() * 1.7;
	
	var yO = Math.random() * 10 + 10;
	var renderables = [];
	renderables.push(new RenderableRectangle3D(0,0,0,8,80+yO,"rgba(155,83,13,1)","rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_STRETCH"], [additionals]));
	renderables.push(new RenderableCircle3D(15,15,20,-5,80+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new RenderableCircle3D(14,14,20,-7,70+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new RenderableCircle3D(15,15,20,6,70+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new RenderableCircle3D(10,10,20,-4,60+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new RenderableCircle3D(15,15,20,6,50+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new RenderableCircle3D(17,17,20,-5,40+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	renderables.push(new RenderableCircle3D(14,14,20,6,35+yO,0, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)", 1.7, ["RENDERABLE_ANIMATION_BOB"], [additionals]));
	var scale = 1 + .3 * Math.random();
	for (r = 0; r < renderables.length; r++) {
		renderables[r].timeElapsed = offset + Math.random() * .15;
		var xF = Math.random() * 6 - 3;
		var yF = Math.random() * 6 - 3;
		for (p = 0; p < renderables[r].points.length; p++) {
			renderables[r].points[p][0] += xF;
			renderables[r].points[p][1] += yF;
			renderables[r].points[p][0] *= scale;
			renderables[r].points[p][1] *= scale;
		}
	}
	var sprite = new Sprite(renderables);
	this.object = new Object(x,y,z,sprite,1);
}

function Grass(x, y, z) {
	var colours = ["rgba(14, 215, 67, 1)", "rgba(14, 185, 47, 1)", "rgba(14, 195, 57, 1)", "rgba(14, 225, 77, 1)", "rgba(14, 245, 97, 1)"];
	var additionals = {};
	additionals['amplitude'] = 3;
	additionals['indices'] = [2,3];
	
	for (n = 0; n < 100; n++) {
		var renderables = [];
		var x2 = Math.random() * 280 - 140;
		var z2 = Math.random() * 2 * (Math.sqrt(Math.pow(125,2) - Math.pow(x, 2))) - (Math.sqrt(Math.pow(125,2) - Math.pow(x, 2)));
		for (k = 0; k < 5; k++) {	
			var r = new RenderableRectangle3D(6 + Math.random() * 10, 0, Math.random() * 10 + 2, 3 + 1*Math.random(), 10 + 15*Math.random(), colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)", 2, ["RENDERABLE_ANIMATION_STRETCH", "RENDERABLE_ANIMATION_BEND"], [additionals, additionals]);
			r.timeElapsed = 1.7*Math.random();
			renderables.push(r);
		}
		var sprite = new Sprite(renderables);
	
		this.object = new Object(x2,y,z2,sprite,1);
	}
}

function Cloud(x, y, width, height) {
	var sprite = new Sprite([new RenderableRectangle2D(width, height,0,0,"rgba(255,255,255,.8)", "rgba(0,0,0,0)")]);
	this.object = new Object2D(x, y, sprite);
	this.object.minX = -window.innerWidth / 2 - 100;
	this.object.maxX = window.innerWidth / 2 + 100;
}

function Platform() {
	var sprite = new Sprite([new RenderableCircle(200, 200, 15, "rgba(34, 255, 127, 1)","rgba(0,0,0,0)")]);
	this.object = new Object(0,0,0,sprite,1);
	this.object.direction = 0;
	
	sprite = new Sprite([new RenderableCircle(170, 170, 15, "rgb(54, 255, 147)","rgba(0,0,0,0)")]);
	var platform = new Object(0,0,0,sprite,1);
	platform.direction = 0;
	
	sprite = new Sprite([new RenderableCircle(200, 200, 15, "rgb(173, 106, 62)","rgba(0,0,0,0)")]);
	platform = new Object(0,-10,0,sprite,1);
	platform.direction = 0;
	
	sprite = new Sprite([new RenderableCircle(200, 200, 15, "rgb(153, 86, 42)","rgba(0,0,0,0)")]);
	platform = new Object(0,-30,0,sprite,1);
	platform.direction = 0;
	
	sprite = new Sprite([new RenderableCircle(180, 180, 15, "rgb(143, 76, 32)","rgba(0,0,0,0)")]);
	platform = new Object(0,-60,0,sprite,1);
	platform.direction = 0;
	
	var colours = ["rgb(34, 255, 127, 1)", "rgb(24, 245, 117, 1)", "rgb(14, 235, 107, 1)", "rgb(34, 255, 127, 1)"];
	for (r = 0; r < 30; r++) {
		var renderables = [];
		var size = Math.random() * 10 + 15;
		renderables.push(new RenderableCircle(size, size, 13, colours[(parseInt(colours.length * Math.random()))],"rgba(0,0,0,0)"));
		sprite = new Sprite(renderables);
		platform = new Object(Math.random() * 260 - 130,.0001,Math.random() * 260 - 130,sprite,1);
		platform.direction = 0;
	}
	
}

function Vector(magnitude, angle) {
	this.magnitude = magnitude;
	this.angle = angle;

	this.getXComponent = "getXComponent";
	this.getYComponent = "getYComponent";
}

function getXComponent(v) {
	return v.magnitude * Math.cos(toRadians(v.angle));
}

function getYComponent(v) {
	return v.magnitude * Math.sin(toRadians(v.angle));
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
	var x1 = window['getXComponent'](v1);
	var y1 = window['getYComponent'](v1);
	var x2 = window['getXComponent'](v2);
	var y2 = window['getYComponent'](v2);

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

function RenderableRectangle3D(x, y, z, w, h, colour, outlineColour, maxTime, action, additionals) {
	var points = [];
	points[0] = [-w/2 + x, 0+ y,z];
	points[1] = [w/2 + x, 0+ y,z];
	points[2] = [w/2 + x, h+ y,z];
	points[3] = [-w/2 + x, h+ y,z];
	
	this.save = points;
	this.points = points;
	this.outlineColour = outlineColour;
	this.colour = colour;
	this.max = maxTime;
	this.action = action;
	this.additionals = additionals;
	this.type = "animated";
	this.timeElapsed = 0;
}

function RenderableRectangle2D(w, h, offsetX, offsetY, colour, outlineColour) {
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

function RenderableCircle(rX, rY, p, colour, outlineColour) {
	var points = [];

	for (i = 0; i < p; i++) {
		points.push([rX * Math.cos(i * 2 * Math.PI / p), 0, rY * Math.sin(i * 2 * Math.PI / p)]);
	}
	
	this.save = points;
	this.points = points;
	this.outlineColour = outlineColour;
	this.colour = colour;
}

function RenderableCircle3D(rX, rY, p, offsetX, offsetY, offsetZ, colour, outlineColour, maxTime, action, additionals) {
	var points = [];
	for (i = 0; i < p; i++) {
		points.push([rX * Math.cos(i * 2 * Math.PI / p) + offsetX, rY * Math.sin(i * 2 * Math.PI / p) + offsetY, 0 + offsetZ]);
	}	
	this.save = points;
	this.points = points;
	this.outlineColour = outlineColour;
	this.colour = colour;
	this.max = maxTime;
	this.action = action;
	this.additionals = additionals;
	this.type = "animated";
	this.timeElapsed = 0;
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
}

function drawSprite(sprite, x, y, z) {	
	for (j = 0; j < sprite.renderables.length; j++) {
		var renderable = sprite.renderables[j];
		context.beginPath();
		context.strokeStyle = renderable.outlineColour;
		
		var coords = convertCoordinates(renderable.points[0][0] + x, renderable.points[0][1] + y, renderable.points[0][2] + z, 0, 0, 0, yaw, pitch);
		context.moveTo(centreX + coords[0], centreY + coords[1]);
		for (i = 0; i < renderable.points.length; i++) {
			coords = convertCoordinates(renderable.points[i][0] + x, renderable.points[i][1] + y, renderable.points[i][2] + z, 0, 0, 0, yaw, pitch);
			context.lineTo(centreX + coords[0], centreY + coords[1]);
		}
		context.closePath();
		context.stroke();
		context.fillStyle = renderable.colour;
		context.fill();
	}
}

function drawSprite2D(sprite, x, y) {	
	for (jj = 0; jj < sprite.renderables.length; jj++) {
		var renderable = sprite.renderables[jj];
		context.beginPath();
		context.strokeStyle = renderable.outlineColour;
		
		context.moveTo(centreX + renderable.points[0][0] + x, centreY + renderable.points[0][1] + y);
		for (ii = 0; ii < renderable.points.length; ii++) {
			context.lineTo(centreX + renderable.points[ii][0] + x, centreY + renderable.points[ii][1] + y);
		}
		context.closePath();
		context.stroke();
		context.fillStyle = renderable.colour;
		context.fill();
	}
}

function sortPerspective() {
	var flag = false;
	while (!flag) {
		flag = true;
		for (o = 0; o < objects.length-1; o++) {
			var obj_1 = objects[o];
			var obj_2 = objects[o+1];
			if (obj_1.direction === 0 || obj_2.direction === 0) {
				if (obj_1.y > obj_2.y) {
					objects[o] = obj_2;
					objects[o+1] = obj_1;
					flag = false;
				}
			} else {
				var dist_1 = Math.sqrt(Math.pow(obj_1.x-cameraX, 2) + Math.pow(obj_1.z-cameraZ, 2));
				var dist_2 = Math.sqrt(Math.pow(obj_2.x-cameraX, 2) + Math.pow(obj_2.z-cameraZ, 2));
				
				if (dist_1 < dist_2) {
					objects[o] = obj_2;
					objects[o+1] = obj_1;
					flag = false;
				}
			} 
		}
	}
}

function updateLoop() {
	if (flag) {
	pointerCursor = false;
	
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
	//RENDERING
	
	for (s = 0; s < objects2D.length; s++) {
		if (objects2D[s].sprite !== null)
			drawSprite2D(objects2D[s].sprite, objects2D[s].x, objects2D[s].y);
	}
	
	for (o = 0; o < objects.length; o++) {
		drawSprite(objects[o].sprite, objects[o].x, objects[o].y, objects[o].z);
	}
	
	for (s = 0; s < objects2Dpriority.length; s++) {
		if (objects2Dpriority[s].sprite !== null)
			drawSprite2D(objects2Dpriority[s].sprite, objects2Dpriority[s].x, objects2Dpriority[s].y);
	}
	
	physicsLoop(deltaTime, currentTime);
	
	//yaw=addCircular(yaw, .03, 360);
	yaw = camera.x;
	pitch=camera.y;
	cameraX = cameraRadius*Math.sin(toRadians(yaw));
	cameraY = 0;
	cameraZ = cameraRadius*Math.cos(toRadians(yaw));
	sortPerspective();
	
	if (document.getElementById("SHADER") !== null) {
		shaderAlpha -= .01;
		if (shaderAlpha < 0) {
			shaderAlpha=0;
			document.body.removeChild(shader);
		}
		shader.style.backgroundColor = "rgba(0,0,0,"+shaderAlpha+")";
		shader.style.display = "block";
	}
	
	/*for (n = 0; n < inventory.slots.length; n++) {
		if (mouseX - centreX < inventory.slots[n].object.x + 70 &&
			mouseX - centreX > inventory.slots[n].object.x &&
			mouseY - centreY < inventory.slots[n].object.y + 70 &&
			mouseY - centreY > inventory.slots[n].object.y) {
			pointerCursor = true;
			context.lineWidth = 16;
			inventory.slots[n].object.sprite.renderables[0].outlineColour = "rgb(255,255,255)";
			context.lineWidth = 5;	
		} else {
			inventory.slots[n].object.sprite.renderables[0].outlineColour = "rgba(0,0,0,0)";
		}
		
		context.font = "20px Ubuntu";
		context.fontWeight = "bold";
		context.fillStyle = "white";
		context.fillText(inventory.slots[n].amount, inventory.slots[n].object.x + centreX + 55, inventory.slots[n].object.y+centreY+65);
	}
	
	for (n = 0; n < market.slots.length; n++) {
		if (mouseX - centreX < market.slots[n].object.x + 70 &&
			mouseX - centreX > market.slots[n].object.x &&
			mouseY - centreY < market.slots[n].object.y + 70 &&
			mouseY - centreY > market.slots[n].object.y) {
			pointerCursor = true;
			context.lineWidth = 16;
			market.slots[n].object.sprite.renderables[0].outlineColour = "rgb(255,255,255)";
			context.lineWidth = 5;	
		} else {
			market.slots[n].object.sprite.renderables[0].outlineColour = "rgba(0,0,0,0)";
		}
		
		context.font = "15px Ubuntu";
		context.fontWeight = "bold";
		context.fillStyle = "white";
		context.fillText("$"+market.slots[n].price+" eP", market.slots[n].object.x + centreX + 5, market.slots[n].object.y+centreY+20);
	}
	
	if (itemInHand !== null) {
		itemInHand.object.x = mouseX - centreX;
		itemInHand.object.y = mouseY - centreY;
	}
	
	if (pointerCursor) {
		canvas.style.cursor = "pointer";
	} else {
		canvas.style.cursor = "auto";
	}*/
}
}

function physicsLoop(deltaTime, currentTime) {
	for (o = 0; o < objects2D.length; o++) {
		var obj = objects2D[o];
		if (Math.abs(obj.velocity.magnitude) > .01) {
			obj.x += window['getXComponent'](obj.velocity) * deltaTime;
			obj.y += window['getYComponent'](obj.velocity) * deltaTime;
			
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
					obj.velocity = new Vector(Math.abs(window['getXComponent'](obj.velocity)),window['getXComponent'](obj.velocity) > 0 ? 0 : 180);
				} else if (obj.y < obj.minY) {
					obj.y = obj.minY;
					obj.velocity = new Vector(Math.abs(window['getXComponent'](obj.velocity)),window['getXComponent'](obj.velocity) > 0 ? 0 : 180);
				}
			}
						
			if (obj.grounded) {
				obj.frictionForce.angle = addCircular(obj.velocity.angle, 180,360);
				obj.forces['FRICTION'] = obj.frictionForce;
			}
		} else {
			obj.forces['FRICTION'] = null;
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
		
		/*if (obj === inventory.object) {
			context.font = "20px Ubuntu";
			context.fontWeight = "bold";
			context.fillStyle = "white";
			context.fillText("Inventory", 100, 50);			
		} else if (obj === market.object) {
			context.font = "20px Ubuntu";
			context.fontWeight = "bold";
			context.fillStyle = "white";
			context.fillText("Market", 2*centreX - 180, 50);	

			context.font = "14px Ubuntu";
			context.fontWeight = "bold";
			context.fillStyle = "white";
			context.fillText("$"+points+" eP", 2*centreX - 260, 50);

		}*/
	}
	
	for (o = 0; o < objects.length; o++) {
		var obj = objects[o];
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
	}
}

function RENDERABLE_ANIMATION_BOB(renderable, additionals) {
	var progress = renderable.timeElapsed / renderable.max;
	var amplitude = additionals.amplitude;
	
	for (i = 0; i < renderable.trans.length; i++) {
		renderable.points[i] = [renderable.trans[i][0], renderable.trans[i][1] - amplitude * Math.abs(Math.sin(progress * 2 * Math.PI)), renderable.trans[i][2]];
		renderable.trans[i] = renderable.points[i];
	}
}

function RENDERABLE_ANIMATION_STRETCH(renderable, additionals) {
	var progress = renderable.timeElapsed / renderable.max;
	var amplitude = additionals['amplitude'];
	var indices = additionals['indices'];
	
	for (k = 0; k < indices.length; k++) {
		var l = indices[k];
		renderable.points[l] = [renderable.trans[l][0], renderable.trans[l][1] - amplitude * Math.abs(Math.sin(progress * 2 * Math.PI)), renderable.trans[l][2]];
		renderable.trans[l] = renderable.points[l];
	}
}

function RENDERABLE_ANIMATION_BEND(renderable, additionals) {
	var progress = renderable.timeElapsed / renderable.max;
	var amplitude = additionals['amplitude'];
	var indices = additionals['indices'];
	
	for (k = 0; k < indices.length; k++) {
		var l = indices[k];
		renderable.points[l] = [renderable.trans[l][0] - amplitude * Math.abs(Math.sin(progress * 2 * Math.PI)), renderable.trans[l][1], renderable.trans[l][2]];
		renderable.trans[l] = renderable.points[l];
	}
}

function convertCoordinates(x, y, z, xC, yC, zC, yaw, pitch) {
	var coords = [0, 0];
	coords[0] = (x-xC) * blockSize * Math.cos(toRadians(yaw));
	coords[1] = Math.sin(toRadians(pitch)) * ((x-xC) * blockSize) * Math.sin(toRadians(yaw));
	coords[0] += (z-zC) * blockSize * Math.cos(toRadians(yaw) + toRadians(90));
	coords[1] += Math.sin(toRadians(pitch)) * ((z-zC) * blockSize) * Math.sin(toRadians(yaw) + toRadians(90));
	coords[1] -= (y-yC)*blockSize*Math.cos(toRadians(pitch));
	return coords;
}

function reverseCoordinates(xF, yF, xC, zC, yaw, pitch) {
	var exp = xF*Math.sin(toRadians(pitch))*Math.sin(toRadians(yaw))-yF*Math.cos(toRadians(yaw))
	exp = exp / (Math.cos(toRadians(yaw+90))*Math.sin(toRadians(pitch))*Math.sin(toRadians(yaw)) - Math.sin(toRadians(pitch))*Math.sin(toRadians(yaw+90))*Math.cos(toRadians(yaw)));
	var z = exp;
	var x = (xF - z*Math.cos(toRadians(yaw+90)))/Math.cos(toRadians(yaw))
	return [x,0,z];
}

document.onkeydown = function(e) {
	var k = e.which || e.keyCode;
	switch(k) {
		case 39: {
			camera.forces['PLAYER_FORCE_RIGHT'] = PLAYER_FORCE_RIGHT;
			break;
		}
		case 37: {
			camera.forces['PLAYER_FORCE_LEFT'] = PLAYER_FORCE_LEFT;
			break;
		}
		case 38: {
			camera.forces['PLAYER_FORCE_DOWN'] = PLAYER_FORCE_DOWN;
			break;
		}
		case 40: {
			camera.forces['PLAYER_FORCE_UP'] = PLAYER_FORCE_UP;
			break;
		}
	}
}

document.onkeyup = function(e) {
	var k = e.which || e.keyCode;
	switch(k) {
		case 39: {
			delete camera.forces['PLAYER_FORCE_RIGHT'];
			break;
		}
		case 37: {
			delete camera.forces['PLAYER_FORCE_LEFT'];
			break;
		}
		case 38: {
			delete camera.forces['PLAYER_FORCE_DOWN'];
			break;
		}
		case 40: {
			delete camera.forces['PLAYER_FORCE_UP'];
			break;
		}
	}
}

function removeFromList(list, obj) {
  if (list.includes(obj)) {
    for (y = 0; y < list.length; y++) {
      if (list[y] === obj) {
        list.splice(y, 1);
      }
    }
  }
}

window.onmousemove = function(e) {
	mouseX = e.clientX;
	mouseY = e.clientY;
}

/*window.onclick = function(e) {
	for (n = 0; n < inventory.slots.length; n++) {
		if (mouseX - centreX < inventory.slots[n].object.x + 70 &&
			mouseX - centreX > inventory.slots[n].object.x &&
			mouseY - centreY < inventory.slots[n].object.y + 70 &&
			mouseY - centreY > inventory.slots[n].object.y) {
			if (itemInHand === null) {
				if (inventory.slots[n].amount > 0) {
					itemInHand = new Item(mouseX - centreX, mouseY - centreY, n);
					inventory.slots[n].amount--;
					var xmlhttp = new XMLHttpRequest();
					xmlhttp.open("POST", "update.php", true);
					xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

					var collective = [];
					collective[0] = objects;
					collective[1] = [];
					for (m = 0; m < inventory.slots.length; m++) {
						collective[1][m] = inventory.slots[m].amount;
					}
					var json = JSON.stringify(collective);

					xmlhttp.onreadystatechange = function() {
						if (this.readyState == 4 && this.status == 200) {
						}
					}
					xmlhttp.send("points="+points+"&json="+json);
				}
			}
		}
	}
	
	for (n = 0; n < market.slots.length; n++) {
		if (mouseX - centreX < market.slots[n].object.x + 70 &&
			mouseX - centreX > market.slots[n].object.x &&
			mouseY - centreY < market.slots[n].object.y + 70 &&
			mouseY - centreY > market.slots[n].object.y) {
			if (itemInHand === null) {
				if (points > market.slots[n].price) {
					inventory.slots[n].amount++;
					points -= market.slots[n].price;
					var xmlhttp = new XMLHttpRequest();
					xmlhttp.open("POST", "update.php", true);
					xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

					var collective = [];
					collective[0] = objects;
					collective[1] = [];
					for (m = 0; m < inventory.slots.length; m++) {
						collective[1][m] = inventory.slots[m].amount;
					}
					var json = JSON.stringify(collective);

					xmlhttp.onreadystatechange = function() {
						if (this.readyState == 4 && this.status == 200) {
						}
					}
					xmlhttp.send("points="+points+"&json="+json);
				}
			}
		}
	}
	
	if (itemInHand !== null) {
		if (mouseX - centreX < 150 && mouseX - centreX > -150 &&
		mouseY - centreY < 150 && mouseY - centreY > -150) {
			var pos3D = reverseCoordinates(mouseX-centreX, mouseY-centreY, 0,0,yaw,pitch);
			generatePlant(pos3D[0],.001,pos3D[2], itemInHand.id);
			removeFromList(objects2Dpriority, itemInHand.object);
			itemInHand = null;

			var xmlhttp = new XMLHttpRequest();
			xmlhttp.open("POST", "update.php", true);
			xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

			var collective = [];
			collective[0] = objects;
			collective[1] = [];
			for (m = 0; m < inventory.slots.length; m++) {
				collective[1][m] = inventory.slots[m].amount;
			}
			var json = JSON.stringify(collective);

			xmlhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
				}
			}
			xmlhttp.send("points="+points+"&json="+json);
		}
	}
}*/