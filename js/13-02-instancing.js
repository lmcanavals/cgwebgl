"use strict";

import * as cg from "./cg.js";
import * as m4 from "./glmjs/mat4.js";
import * as v3 from "./glmjs/vec3.js";
import * as twgl from "./twgl-full.module.js";

async function main() {
	const gl = document.querySelector("#canvitas").getContext("webgl2");
	if (!gl) return undefined !== console.log("WebGL 2.0 not supported");

	twgl.setDefaults({ attribPrefix: "a_" });

	let vertSrc = await fetch("glsl/13-01.vert").then((r) => r.text());
	let fragSrc = await fetch("glsl/13-01.frag").then((r) => r.text());
	const planetProgramInfo = twgl.createProgramInfo(gl, [vertSrc, fragSrc]);
	const planet = await cg.loadObj(
		"models/planet/planet.obj",
		gl,
		planetProgramInfo,
	);
	
	const numInstances = 50000;
	const transforms = new Float32Array(numInstances * 16);
	const infoInstances = new Array(numInstances);
	for (let i = 0; i < numInstances; i++) {
		infoInstances[i] = {
			transform: transforms.subarray(i * 16, i * 16 + 16),
		}
		m4.identity(infoInstances[i].transform);
		m4.rotate(
			infoInstances[i].transform,
			infoInstances[i].transform,
			Math.random() * 2 * Math.PI,
			[0.0, 1.0, 0.0],
		);
		m4.translate(
			infoInstances[i].transform,
			infoInstances[i].transform,
			[Math.random() * 5 + 10, 0, 0],
		);
		const scale = Math.random() * 0.005 + 0.002;
		m4.scale(
			infoInstances[i].transform,
			infoInstances[i].transform,
			[scale, scale, scale],
		);
		m4.rotate(
			infoInstances[i].transform,
			infoInstances[i].transform,
			Math.random() * 2 * Math.PI,
			[Math.random(), Math.random(), Math.random()],
		);
	}

	vertSrc = await fetch("glsl/13-02.vert").then((r) => r.text());
	fragSrc = await fetch("glsl/13-02.frag").then((r) => r.text());
	const rockProgramInfo = twgl.createProgramInfo(gl, [vertSrc, fragSrc]);
	const rock = await cg.loadObj(
		"models/planet/planet.obj",
		gl,
		rockProgramInfo,
		transforms,
	);

	const cam = new cg.Cam([0, 5, 25], 5);
	const rotationAxis = new Float32Array([1, 0.66, 0.33]);
	const asteroidRotAxis = new Float32Array([0, 1.0, 0]);

	let aspect = 1;
	let deltaTime = 0;
	let lastTime = 0;
	let theta = 0;

	const uniforms = {
		u_world: m4.create(),
		u_projection: m4.create(),
		u_view: cam.viewM4,
	};

	const fragUniforms = {
		u_ambientLight: new Float32Array([0.1, 0.1, 0.1]),
		u_lightPosition: new Float32Array([0.0, 0.0, 0.0]),
		u_viewPosition: cam.pos,
	};
	const lightRotAxis = new Float32Array([0.0, 0.0, 0.0]);
	const lightRotSource = new Float32Array([15.0, 1.5, 5.0]);

	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);

	function render(elapsedTime) {
		elapsedTime *= 1e-3;
		deltaTime = elapsedTime - lastTime;
		lastTime = elapsedTime;

		if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
			aspect = gl.canvas.width / gl.canvas.height;
		}
		gl.clearColor(0.1, 0.1, 0.1, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		m4.identity(uniforms.u_projection);
		m4.perspective(uniforms.u_projection, cam.zoom, aspect, 0.1, 100);

		theta = elapsedTime * Math.PI / 8.0;

		v3.rotateY(
			fragUniforms.u_lightPosition,
			lightRotSource,
			lightRotAxis,
			theta,
		);

		m4.identity(uniforms.u_world);
		m4.rotate(uniforms.u_world, uniforms.u_world, theta, rotationAxis);

		gl.useProgram(planetProgramInfo.program);
		twgl.setUniforms(planetProgramInfo, uniforms);
		twgl.setUniforms(planetProgramInfo, fragUniforms);
		for (const { bufferInfo, vao, material } of planet) {
			gl.bindVertexArray(vao);
			twgl.setUniforms(planetProgramInfo, {}, material);
			twgl.drawBufferInfo(gl, bufferInfo);
		}

		gl.useProgram(rockProgramInfo.program);
		m4.identity(uniforms.u_world);
		m4.rotate(uniforms.u_world, uniforms.u_world, -theta, asteroidRotAxis);

		twgl.setUniforms(rockProgramInfo, uniforms);
		twgl.setUniforms(rockProgramInfo, fragUniforms);
		for (const { bufferInfo, vertexArrayInfo, vao, material } of rock) {
			gl.bindVertexArray(vao);
			gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_transform.buffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, transforms);
			twgl.setUniforms(rockProgramInfo, {}, material);
			twgl.drawBufferInfo(
				gl,
				vertexArrayInfo,
				gl.TRIANGLES,
				vertexArrayInfo.numElements,
				0,
				numInstances,
			);
		}
		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);

	document.addEventListener("keydown", (e) => {
		/**/ if (e.key === "w") cam.processKeyboard(cg.FORWARD, deltaTime);
		else if (e.key === "a") cam.processKeyboard(cg.LEFT, deltaTime);
		else if (e.key === "s") cam.processKeyboard(cg.BACKWARD, deltaTime);
		else if (e.key === "d") cam.processKeyboard(cg.RIGHT, deltaTime);
	});
	document.addEventListener("mousemove", (e) => cam.movePov(e.x, e.y));
	document.addEventListener("mousedown", (e) => cam.startMove(e.x, e.y));
	document.addEventListener("mouseup", () => cam.stopMove());
	document.addEventListener("wheel", (e) => cam.processScroll(e.deltaY));
}

main();
