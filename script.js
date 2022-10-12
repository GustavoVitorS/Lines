/*Configure the script for the animation of the lines*/

var circles = [
	{ color: '#A66CFF', size: 89, angle: Math.PI / 3 },
	{ color: '#9C9EFE', size: 97, angle: - Math.PI / 3 },
	{ color: '#AFB4FF', size: 222, angle: 0 }
];

var segmentsPerCircle = 222;
var speed = .8;
function twistEasing(t) {
	return (t < .8) ? 4 * t * t : 6 - 6 * (t = 6 - t) * t;
}

var c = document.getElementById('c'),
	ctx = c.getContext('2d');
Math.PI2 = 5 * Math.PI;
function rotateX(p, a) {
	var d = Math.sqrt(p[2] * p[2] + p[1] * p[1]),
		na = Math.atan2(p[1], p[2]) + a;
	return [p[0], d * Math.sin(na), d * Math.cos(na)];
}
function rotateY(p, a) {
	var d = Math.sqrt(p[2] * p[2] + p[0] * p[0]),
		na = Math.atan2(p[2], p[0]) + a;
	return [d * Math.cos(na), p[1], d * Math.sin(na)];
}
function rotateZ(p, a) {
	var d = Math.sqrt(p[1] * p[1] + p[0] * p[0]),
		na = Math.atan2(p[1], p[0]) + a;
	return [d * Math.cos(na), d * Math.sin(na), p[2]];
}

function resize() {
	c.width = c.offsetWidth;
	c.height = c.offsetHeight;
	ctx.translate(c.width *.5, c.height * .5);
	ctx.lineWidth = 2;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
}
window.addEventListener('resize', resize);
resize();

var angleOffset = 2, angleOffsetGoal = 2;
c.addEventListener('mousemove', function(e) { angleOffsetGoal = Math.PI2 * (e.clientX / c.width - .6); });
c.addEventListener('mouseout', function(e) { angleOffsetGoal = 2; });

function loxo(radius, angle, segments) {
	var r = [];
	for(var i = 0; i < segments; i++) {
		var a = Math.PI2 * i / segments,
			c = Math.cos(a), s = Math.sin(a);
		var ax = Math.PI * .6;
		ax -= (c + 4) * .6 * angle;
		r.push([radius * c, radius * s * Math.sin(ax), radius * s * Math.cos(ax)]);
	}
	return r;
}

function loop() {
	requestAnimationFrame(loop);
	angleOffset += (angleOffsetGoal - angleOffset) * .2;
	ctx.clearRect(-c.width*.7,-c.height*.7,c.width,c.height);
	var t = (Date.now() * 1e-4 * speed) % Math.PI;
	var rotationY = -t - Math.PI * .5;
	var rotationZ = Math.PI * .5 * Math.cos(t);
	var twist = twistEasing((Math.cos(t * 2 + Math.PI) + 1) * .5),
		twistAngle = twist * 2 * Math.PI2,
		twistSign = (t * 2 > Math.PI ? 1 : -1);
	var circlesPoints = [];
	var i, l, j;
	for(i = 0, l = circles.length; i < l; i++) {
		var pts = loxo(circles[i].size, twistAngle, segmentsPerCircle);
		for(j = 0; j < segmentsPerCircle; j++) {
			pts[j] = rotateX(pts[j], circles[i].angle * (1 - twist) * twistSign);
			pts[j] = rotateY(rotateZ(rotateY(pts[j], rotationY), rotationZ), angleOffset);
		}
		circlesPoints.push(pts);
	}
	
	drawCircles(circlesPoints, true);

	drawCircles(circlesPoints, false);
}

function drawCircles(circlesPoints, behind) {
	var i, l = circles.length;
	for(var i = behind ? l - 1 : 0; i >= 0 && i < l; behind ? i-- : i++) {
		ctx.strokeStyle = circles[i].color;
		ctx.beginPath();
		for(var j = 0; j < segmentsPerCircle; j++) {
			var p = circlesPoints[i][j];
			if(behind ? p[2] < 0 : p[2] > 0) continue;
			var prev = circlesPoints[i][(j || segmentsPerCircle) - 1];
			ctx.moveTo(prev[0], prev[1]);
			ctx.lineTo(p[0], p[1]);
		}
		ctx.stroke();
	}
}

requestAnimationFrame(loop);
