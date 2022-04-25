"use strict";

const { vec3, mat4 } = glMatrix;

async function main() {
  const gl = document.querySelector("#canvitas").getContext("webgl2");
  if (!gl) return undefined !== console.log("WebGL 2.0 not supported");

  const vertfn = "glsl/06-01.vert";
  const fragfn = "glsl/06-01.frag";
  const objfn = "models/cube/cube.obj";

  twgl.setAttributePrefix("a_");

  const vertSrc = await fetch(vertfn).then((r) => r.text());
  const fragSrc = await fetch(fragfn).then((r) => r.text());
  const objSrc = await fetch(objfn).then((r) => r.text());

  const meshProgramInfo = twgl.createProgramInfo(gl, [vertSrc, fragSrc]);
  const cubex = cg.parseObj(objSrc);

  const baseHref = new URL(objfn, window.location.href);
  const matSrc = await Promise.all(cubex.materialLibs.map(async (filename) => {
    const matHref = new URL(filename, baseHref).href;
    const response = await fetch(matHref);
    return await response.text();
  }));
  const materials = cubex.parseMtl(matSrc.join("\n"));
  const parts = cubex.geometries.map(({ material, data }) => {
    if (data.color) {
      if (data.position.length === data.color.length) {
        data.color = { numComponents: 3, data: data.color };
      }
    } else {
      data.color = { value: [1, 1, 1, 1] };
    }
    const bufferInfo = twgl.createBufferInfoFromArrays(gl, data);
    const vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);
    return {
      material: materials[material],
      bufferInfo,
      vao,
    };
  });
}

main();

