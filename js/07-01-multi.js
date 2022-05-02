"use strict";

import * as cg from "./cg.js";
import * as m4 from "./glmjs/mat4.js";
import * as twgl from "./twgl-full.module.js";

async function main() {
  const gl = document.querySelector("#canvitas").getContext("webgl2");
  if (!gl) return undefined !== console.log("WebGL 2.0 not supported");

  twgl.setDefaults({ attribPrefix: "a_" });

  const vertSrc = await fetch("glsl/06-01.vert").then((r) => r.text());
  const fragSrc = await fetch("glsl/06-01.frag").then((r) => r.text());
  const meshProgramInfo = twgl.createProgramInfo(gl, [vertSrc, fragSrc]);
  const cubex = await cg.loadObj(
    "models/cubito/cubito.obj",
    gl,
    meshProgramInfo,
  );

  const cam = new cg.Cam([0, -5, 25]);
  const rotationAxis = new Float32Array([0, 1, 0]);

  let aspect = 1;
  let deltaTime = 0;
  let lastTime = 0;
  let theta = 0;

  const numObjs = 10;
  const positions = new Array(numObjs);
  const delta = new Array(numObjs);
  const deltaG = -9.81;
  const rndb = (a, b) => Math.random() * (b - a) + a;
  for (let i = 0; i < numObjs; i++) {
    positions[i] = [
      rndb(-13.0, 13.0),
      0.0, /*rndb(6.0, 12.0)*/
      rndb(-13.0, 13.0),
    ];
    delta[i] = [rndb(-1.1, 1.1), 0.0, rndb(-1.1, 1.1)];
  }
  console.log(delta);

  const uniforms = {
    u_world: m4.create(),
    u_projection: m4.create(),
    u_view: cam.viewM4,
  };

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

    theta = elapsedTime;

    m4.identity(uniforms.u_projection);
    m4.perspective(uniforms.u_projection, cam.zoom, aspect, 0.1, 100);

    gl.useProgram(meshProgramInfo.program);

    for (let i = 0; i < numObjs; i++) {
      m4.identity(uniforms.u_world);
      m4.translate(uniforms.u_world, uniforms.u_world, positions[i]);
      m4.rotate(uniforms.u_world, uniforms.u_world, theta, rotationAxis);
      twgl.setUniforms(meshProgramInfo, uniforms);

      for (const { bufferInfo, vao, material } of cubex) {
        gl.bindVertexArray(vao);
        twgl.setUniforms(meshProgramInfo, {}, material);
        twgl.drawBufferInfo(gl, bufferInfo);
      }

      // Update position
			for (let j = 0; j < 3; j++) {
				positions[i][j] += delta[i][j] * deltaTime;
				if (positions[i][j] > 13.0) {
					positions[i][j] = 13.0;
					delta[i][j] = -delta[i][j];
				} else if (positions[i][j] < -13.0) {
					positions[i][j] = -13.0;
					delta[i][j] = -delta[i][j];
				}
			}
			delta[i][1] += deltaG * deltaTime;
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
