#version 300 es

precision highp float;

in vec2 v_texture;
out vec4 color;

uniform sampler2D u_texData;

void main() {
	color = texture(u_texData, v_texture);
}

