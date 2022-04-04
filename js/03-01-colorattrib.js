"use strict";

const wu = webglUtils;

function createRectangle(gl, shader) {
  const v = new cg.MeshHelper(4, 5, 6);
  const pos = 0.5;
  const neg = -0.5;

  //				    X    Y    R    G    B
  v.addVertex([neg, neg, 1.0, 0.0, 0.0]);
  v.addVertex([neg, pos, 0.0, 1.0, 0.0]);
  v.addVertex([pos, pos, 1.0, 1.0, 0.0]);
  v.addVertex([pos, neg, 0.0, 0.0, 1.0]);
  v.addRect(0, 1, 2, 3);
  console.log(v);

  return new cg.Mesh(gl, shader, {
    vertices: v.vertices,
    indices: v.indices,
    attribs: [
      { name: "a_position", size: 2 },
      { name: "a_color", size: 3 },
    ],
  });
}

async function main() {
  const gl = document.querySelector("#canvitas").getContext("webgl2");
  if (!gl) return undefined !== console.log("WebGL 2 not supported");

  const vertSrc = await fetch("glsl/03-01.vert").then((resp) => resp.text());
  const fragSrc = await fetch("glsl/03-01.frag").then((resp) => resp.text());
  const shader = wu.createProgramFromSources(gl, [vertSrc, fragSrc]);
  const mesh = createRectangle(gl, shader);

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
    mesh.draw(shader);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
