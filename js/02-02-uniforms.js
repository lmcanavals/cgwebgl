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

  const vertSrc = await fetch("glsl/02-02.vert").then((resp) => resp.text());
  const fragSrc = await fetch("glsl/02-02.frag").then((resp) => resp.text());
  const shader = wu.createProgramFromSources(gl, [vertSrc, fragSrc]);
  const mesh = createRectangle(gl, shader);

  const colorLoc = gl.getUniformLocation(shader, "u_color");

  let deltaTime = 0;
  let lastTime = 0;

  function render(elapsedTime) {
		elapsedTime = elapsedTime / 1000;
		deltaTime = elapsedTime - lastTime;
		lastTime = elapsedTime;

    if (wu.resizeCanvasToDisplaySize(gl.canvas)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(shader);
		gl.uniform4f(colorLoc, Math.sin(elapsedTime) / 2 + 0.5, 0.5, 1.0, 1.0);
    mesh.draw(shader);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
