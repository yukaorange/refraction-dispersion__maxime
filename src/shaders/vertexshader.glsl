varying vec3 worldNormal;
varying vec3 eyeVector;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);

  vec4 mvPosition = viewMatrix * worldPosition;

  gl_Position = projectionMatrix * mvPosition;

  vec3 transformedNormal = normalMatrix * normal;

  worldNormal = normalize(transformedNormal);

  // eyeVector = normalize(worldPosition.xyz - cameraPosition);
  eyeVector = normalize(mvPosition.xyz);
}