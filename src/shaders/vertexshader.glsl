uniform vec3 uLight;
varying vec3 worldNormal;
varying vec3 eyeVector;
varying vec3 worldEyeVector;
varying vec3 lightDir;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);

  vec4 mvPosition = viewMatrix * worldPosition;

  gl_Position = projectionMatrix * mvPosition;

  vec3 transformedNormal = normalMatrix * normal;

  worldNormal = normalize(transformedNormal);

  worldEyeVector = normalize(worldPosition.xyz - cameraPosition);

  eyeVector = normalize(mvPosition.xyz);

  lightDir = normalize(uLight - worldPosition.xyz);
  // lightDir = normalize(uLight);
}