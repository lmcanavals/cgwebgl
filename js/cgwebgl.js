(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], () => factory.call(root));
  } else {
    root.cg = factory.call(root);
  }
})(this, function () {
  "use strict";

  class Mesh {
    constructor(gl, shader, params) {
      this.gl = gl;
      this.vertices = params.vertices;
      this.indices = params.indices;
      this.vao = gl.createVertexArray();

      const vbo = gl.createBuffer();
      const ebo = gl.createBuffer();

      gl.bindVertexArray(this.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

      let stride = 0;
      for (const a of params.attribs) stride += a.size;
      stride *= 4;
      let offset = 0;
      for (const a of params.attribs) {
        const attrib = gl.getAttribLocation(shader, a.name);
        gl.enableVertexAttribArray(attrib);
        gl.vertexAttribPointer(attrib, a.size, gl.FLOAT, false, stride, offset);
        offset += a.size * 4;
      }

      gl.bindVertexArray(null);
    }
    draw() {
      this.gl.bindVertexArray(this.vao);
      this.gl.drawElements(
        this.gl.TRIANGLES,
        this.indices.length,
        this.gl.UNSIGNED_INT,
        0,
      );
      this.gl.bindVertexArray(null);
    }
  }

	return {
			Mesh
	}
});
