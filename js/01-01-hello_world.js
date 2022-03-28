"use strict";

const srcVertex = `#version 300 es
in vec4 a_position;
void main() {
		gl_Position = a_position;
}`;

const srcFragment = `#version 300 es
precision highp float;
out vec4 outColor;
void main() {
		outColor = vec4(1.0, 0.5, 0.1, 1.0);
}`;

function loadShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (success) {
		return shader;
	}

	console.log(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}

function createProgram(gl) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, srcVertex);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, srcFragment);

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	const success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (success) {
		return program;
	}

	console.log(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);
}

function main() {
	const gl = document.querySelector("#canvitas").getContext("webgl2");
	if (!gl) {
		console.log("WebGL 2 not supported");
		return;
	}

	gl.canvas.width = gl.canvas.clientWidth;
	gl.canvas.height = gl.canvas.clientHeight;
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	const program = createProgram(gl);
  const posLoc = gl.getAttribLocation(program, "a_position");


	const vertices = new Float32Array([
		-0.5, -0.5,
	  0.2, 0.8,
	  0.6, -0.35]);
/*	const vertices = new Float32Array([
		-0.5, -0.5,
	  0.2, 0.8,
	  0.2, 0.8,
	  0.6, -0.35,
	  0.6, -0.35,
		-0.5, -0.5]);*/

	const vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	gl.enableVertexAttribArray(posLoc);
	gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
	
	gl.clearColor(0.1, 0.2, 0.15, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(program);
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLES, 0, 3);
	//gl.drawArrays(gl.LINES, 0, 6);
}

main();
