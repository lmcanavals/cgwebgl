"use strict";

const wu = webglUtils;
const mat4 = glMatrix.mat4;

function createRectangle(gl, shader) {
  const v = new cg.MeshHelper(8, 6, 36);
  const pos = 0.5;
  const neg = -0.5;

  //            X    Y   Z     R    G    B
  v.addVertex([neg, neg, neg, 0.1, 0.1, 0.1]);
  v.addVertex([neg, pos, neg, 0.1, 0.9, 0.1]);
  v.addVertex([pos, pos, neg, 0.9, 0.9, 0.1]);
  v.addVertex([pos, neg, neg, 0.9, 0.1, 0.1]);
  v.addVertex([neg, neg, pos, 0.1, 0.1, 0.9]);
  v.addVertex([neg, pos, pos, 0.1, 0.9, 0.9]);
  v.addVertex([pos, pos, pos, 0.9, 0.9, 0.9]);
  v.addVertex([pos, neg, pos, 0.9, 0.1, 0.9]);
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

  const cam = new cg.Cam([0, 0, 4]);
  const mesh = createRectangle(gl, shader);
  const model = mat4.create();
  const projection = mat4.create();

  const modelLoc = gl.getUniformLocation(shader, "u_model");
  const viewLoc = gl.getUniformLocation(shader, "u_view");
  const projectionLoc = gl.getUniformLocation(shader, "u_projection");

  let aspect = 1;

  let deltaTime = 0;
  let lastTime = 0;

  gl.enable(gl.DEPTH_TEST);

  function render(elapsedTime) {
    elapsedTime = elapsedTime / 1000;
    deltaTime = elapsedTime - lastTime;
    lastTime = elapsedTime;

    if (wu.resizeCanvasToDisplaySize(gl.canvas)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      aspect = gl.canvas.width / gl.canvas.height;
    }
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.identity(model);
    mat4.identity(projection);

    mat4.perspective(projection, cam.zoom, aspect, 0.1, 100.0);

    gl.useProgram(shader);
    gl.uniformMatrix4fv(modelLoc, false, model);
    gl.uniformMatrix4fv(viewLoc, false, cam.viewM4);
    gl.uniformMatrix4fv(projectionLoc, false, projection);
    mesh.draw(shader);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  document.addEventListener("keydown", (e) => {
    /**/ if (e.key == "w") cam.processKeyboard(cg.FORWARD, deltaTime);
    else if (e.key == "s") cam.processKeyboard(cg.BACKWARD, deltaTime);
    else if (e.key == "a") cam.processKeyboard(cg.LEFT, deltaTime);
    else if (e.key == "d") cam.processKeyboard(cg.RIGHT, deltaTime);
    //else if (e.key == "q") cam.processKeyboard(cg.DOWN, deltaTime);
    //else if (e.key == "e") cam.processKeyboard(cg.UP, deltaTime);
  });
  document.addEventListener("mousemove", (e) => cam.movePov(e.x, e.y));
  document.addEventListener("mousedown", (e) => cam.startMove(e.x, e.y));
  document.addEventListener("mouseup", () => cam.stopMove());
  document.addEventListener("wheel", (e) => cam.processScroll(e.deltaY));
}

main();
