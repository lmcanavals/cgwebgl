"use strict";

const wu = webglUtils;

function createRectangle(gl, shader) {
  const vertices = new Float32Array([
    -0.5,
    -0.5,
    -0.5,
    0.5,
    0.5,
    0.5,
    0.5,
    -0.5,
  ]);
	const indices = new Uint32Array([0, 1, 2, 0, 2, 3]);
	return new cg.Mesh(gl, shader, {
		vertices: vertices,
		indices: indices,
		attribs: [
			{ name: "a_position", size: 2 },
		],
	});
}

async function main() {
  const gl = document.querySelector("#canvitas").getContext("webgl2");
  if (!gl) return undefined !== console.log("WebGL 2 not supported");

  const vertSrc = await fetch("glsl/02-01.vert").then((resp) => resp.text());
  const fragSrc = await fetch("glsl/02-01.frag").then((resp) => resp.text());
  const shader = wu.createProgramFromSources(gl, [vertSrc, fragSrc]);
  const mesh = createRectangle(gl, shader);

  if (wu.resizeCanvasToDisplaySize(gl.canvas)) {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(shader);
  mesh.draw(shader);
}

main();
