"use strict"

const { vec3, mat4 } = glMatrix;

async function main() {
	const gl = document.querySelector("#canvitas").getContext("webgl2");
	if (!gl) return undefined !== console.log("WebGL 2.0 not supported");

	const vertfn = "glsl/06-01.vert";
	const fragfn = "glsl/06-01.frag";
	const objfn = "models/cube/cube.obj";
}

main();
