"use strict";

const wu = webglUtils;
const mat4 = glMatrix.mat4;

function createRectangle(gl, shader) {
  const v = new cg.MeshHelper(8, 6, 36);
  const pos = 0.5;
  const neg = -0.5;

  //            X    Y   Z     R    G    B
  v.addVertex([neg, neg, neg, 0.0, 0.0, 0.0]);
  v.addVertex([neg, pos, neg, 0.0, 1.0, 0.0]);
  v.addVertex([pos, pos, neg, 1.0, 1.0, 0.0]);
  v.addVertex([pos, neg, neg, 1.0, 0.0, 0.0]);
  v.addVertex([neg, neg, pos, 0.0, 0.0, 1.0]);
  v.addVertex([neg, pos, pos, 0.0, 1.0, 1.0]);
  v.addVertex([pos, pos, pos, 1.0, 1.0, 1.0]);
  v.addVertex([pos, neg, pos, 1.0, 0.0, 1.0]);
  v.addRect(0, 1, 2, 3);
	v.addRect(4, 5, 6, 7);
	v.addRect(0, 4, 7, 3);
	v.addRect(1, 5, 6, 2);
	v.addRect(2, 3, 7, 6);
	v.addRect(0, 1, 5, 4);

  return new cg.Mesh(gl, shader, {
    vertices: v.vertices,
    indices: v.indices,
    attribs: [
      { name: "a_position", size: 3 },
      { name: "a_color", size: 3 },
    ],
  });
}

async function main() {
  const gl = document.querySelector("#canvitas").getContext("webgl2");
  if (!gl) return undefined !== console.log("WebGL 2 not supported");

  const vertSrc = await fetch("glsl/04-02.vert").then((resp) => resp.text());
  const fragSrc = await fetch("glsl/03-01.frag").then((resp) => resp.text());
  const shader = wu.createProgramFromSources(gl, [vertSrc, fragSrc]);
  const mesh = createRectangle(gl, shader);
  const transform = mat4.create();
  const sfactors = new Float32Array([1.0, 1.0, 1.0]);
  const tfactors = new Float32Array([0.0, 0.0, 0.0]);
  const rotationAxis = new Float32Array([1.0, 1.0, 1.0]);
  let theta = 0.0;

  const transformLoc = gl.getUniformLocation(shader, "u_transform");

  let deltaTime = 0;
  let lastTime = 0;

	gl.enable(gl.DEPTH_TEST);

  function render(elapsedTime) {
    elapsedTime = elapsedTime / 1000;
    deltaTime = elapsedTime - lastTime;
    lastTime = elapsedTime;

    if (wu.resizeCanvasToDisplaySize(gl.canvas)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    sfactors[0] = 1.0 + 0.5 * Math.sin(elapsedTime);
    sfactors[1] = 1.0 + 0.5 * Math.sin(elapsedTime);
    sfactors[2] = 1.0 + 0.5 * Math.sin(elapsedTime);
    tfactors[0] = 0.5 * Math.sin(elapsedTime);
    tfactors[1] = 0.5 * Math.sin(elapsedTime);
    tfactors[2] = 0.5 * Math.sin(elapsedTime);
    theta = elapsedTime;
    mat4.identity(transform);
    mat4.scale(transform, transform, sfactors);
    mat4.translate(transform, transform, tfactors);
    mat4.rotate(transform, transform, theta, rotationAxis);

    gl.useProgram(shader);
    gl.uniformMatrix4fv(transformLoc, false, transform);
    mesh.draw(shader);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
