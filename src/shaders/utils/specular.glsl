float specular(vec3 light, float shininess, float diffuseness) {
  vec3 normal = worldNormal;
  vec3 lightVector = normalize(-light);
  // vec3 halfVector = normalize(eyeVector + lightVector);
  vec3 halfVector = normalize(worldEyeVector + lightVector);

  float NdotL = dot(normal, lightVector);

  float kDiffuse = max(0.0, NdotL);

  float NdotH = dot(normal, halfVector);
  float NdotH2 = NdotH * NdotH;

  float kSpecular = pow(NdotH2, shininess);

  return kSpecular + kDiffuse * diffuseness;
}