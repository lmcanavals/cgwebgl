#version 300 es

precision highp float;

in vec2 v_texcoord;
in vec3 v_normal;

out vec4 color;

uniform sampler2D diffuseMap;
uniform vec3 u_lightColor;

void main() {
	float ambientStrength = 0.1;
	
	vec3 ambient = ambientStrength * u_lightColor;

	color = texture(diffuseMap, v_texcoord) * vec4(ambient, 1.0);
}
