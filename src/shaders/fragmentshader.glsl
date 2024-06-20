uniform float uIorR;
uniform float uIorY;
uniform float uIorG;
uniform float uIorC;
uniform float uIorB;
uniform float uIorP;
uniform float uSaturation;
uniform float uChromaticAberration;
uniform float uRefractPower;
uniform float uShininess;
uniform float uDiffuseness;
uniform float uFresnelPower;

uniform vec2 uResolution;

uniform vec3 uLight;

uniform sampler2D uTexture;

varying vec3 worldNormal;
varying vec3 eyeVector;
varying vec3 lightDir;

#include "./utils/sat.glsl"
#include "./utils/specular.glsl"
#include "./utils/fresnel.glsl"

const int LOOP = 16;

vec3 FetchRefractedColor(vec2 st, vec3 refractVec, float iterate, float coefficient) {
  vec3 color = texture2D(uTexture, st + refractVec.xy * (uRefractPower + iterate * coefficient) * uChromaticAberration).rgb;

  return color;
}

void main() {
  float iorRatioRed = uIorR;
  float iorRatioGreen = uIorG;
  float iorRatioBlue = uIorB;

  float iorRatio = 1.0 / 1.31;

  vec2 uv = gl_FragCoord.xy / uResolution.xy;

  vec3 normal = worldNormal;

  vec3 color = vec3(.0);

  vec3 refractVecR = refract(eyeVector, normal, (1.0 / uIorR));
  vec3 refractVecY = refract(eyeVector, normal, (1.0 / uIorY));
  vec3 refractVecG = refract(eyeVector, normal, (1.0 / uIorG));
  vec3 refractVecC = refract(eyeVector, normal, (1.0 / uIorC));
  vec3 refractVecB = refract(eyeVector, normal, (1.0 / uIorB));
  vec3 refractVecP = refract(eyeVector, normal, (1.0 / uIorP));

  for(int i = 0; i < LOOP; i++) {
    float slide = float(i) / float(LOOP) * 0.1;

    float r = FetchRefractedColor(uv, refractVecR, slide, 1.0).x * 0.5;
    float g = FetchRefractedColor(uv, refractVecG, slide, 2.0).y * 0.5;
    float b = FetchRefractedColor(uv, refractVecB, slide, 3.0).z * 0.5;

    float y = (FetchRefractedColor(uv, refractVecY, slide, 1.0).x * 2.0 + FetchRefractedColor(uv, refractVecY, slide, 1.0).y * 2.0 - FetchRefractedColor(uv, refractVecY, slide, 1.0).z) / 6.0;

    float c = (FetchRefractedColor(uv, refractVecC, slide, 2.5).x * 2.0 + FetchRefractedColor(uv, refractVecC, slide, 2.5).y * 2.0 - FetchRefractedColor(uv, refractVecC, slide, 2.5).z) / 6.0;

    float p = (FetchRefractedColor(uv, refractVecP, slide, 1.0).x * 2.0 + FetchRefractedColor(uv, refractVecP, slide, 1.0).y * 2.0 - FetchRefractedColor(uv, refractVecP, slide, 1.0).z) / 6.0;

    float R = r + (2.0 * p + 2.0 * y - c) / 3.0;
    float G = g + (2.0 * y + 2.0 * c - p) / 3.0;
    float B = b + (2.0 * c + 2.0 * p - y) / 3.0;

    color.r += R;
    color.g += G;
    color.b += B;

    color = sat(color, uSaturation);
  }

  color /= float(LOOP);

  float specularLight = specular(lightDir, uShininess, uDiffuseness);
  // float specularLight = specular(uLight, uShininess, uDiffuseness);

  color += specularLight;

  float f = fresnel(eyeVector, normal, uFresnelPower);

  color.rgb += f * vec3(1.0);

  gl_FragColor = vec4(color, 1.0);
}