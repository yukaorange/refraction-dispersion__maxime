import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useFBO } from '@react-three/drei'

import vertexshader from '@/shaders/vertexshader.glsl'
import fragmentshader from '@/shaders/fragmentshader.glsl'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { v4 as uuidv4 } from 'uuid'

import range from '@/utils/range'
import { useControls, Leva, folder } from 'leva'

const Geometries = () => {
  const mesh = useRef<THREE.Mesh>(null)
  const backgroundgroup = useRef<THREE.Group>(null)

  const backRenderTarget = useFBO()
  const mainRenderTarget = useFBO()

  const { gl, size, camera } = useThree()

  const {
    lightX,
    lightY,
    lightZ,
    shininess,
    diffuseness,
    fresnelPower,
    iorR,
    iorY,
    iorG,
    iorC,
    iorB,
    iorP,
    chormaticAberration,
    refraction,
    saturation,
  } = useControls({
    lightX: {
      value: 1.0,
      step: 0.1,
    },
    lightY: {
      value: -1.0,
      step: 0.1,
    },
    lightZ: {
      value: 1.0,
      step: 0.1,
    },
    shininess: {
      value: 40.0,
    },
    diffuseness: {
      value: 0.1,
    },
    fresnelPower: {
      value: 8.0,
    },
    ior: folder({
      iorR: { min: 1.0, max: 2.333, step: 0.001, value: 1.15 },
      iorY: { min: 1.0, max: 2.333, step: 0.001, value: 1.16 },
      iorG: { min: 1.0, max: 2.333, step: 0.001, value: 1.17 },
      iorC: { min: 1.0, max: 2.333, step: 0.001, value: 1.18 },
      iorB: { min: 1.0, max: 2.333, step: 0.001, value: 1.19 },
      iorP: { min: 1.0, max: 2.333, step: 0.001, value: 1.2 },
    }),
    saturation: {
      min: 1,
      max: 1.25,
      step: 0.01,
      value: 1.08,
    },
    chormaticAberration: {
      value: 0.5,
      min: 0,
      max: 1.5,
      step: 0.01,
    },
    refraction: {
      min: 0,
      max: 1.5,
      step: 0.01,
      value: 0.4,
    },
  })

  const uniforms = useMemo(() => {
    return {
      uTexture: {
        value: null,
      },
      uIorR: { value: 1.0 },
      uIorY: { value: 1.0 },
      uIorG: { value: 1.0 },
      uIorC: { value: 1.0 },
      uIorB: { value: 1.0 },
      uIorP: { value: 1.0 },
      uRefractPower: {
        value: 0.4,
      },
      uChromaticAberration: {
        value: 0.5,
      },
      uSaturation: {
        value: 0.0,
      },
      uShininess: {
        value: 40.0,
      },
      uFresnelPower: {
        value: 8.0,
      },
      uDiffuseness: {
        value: 0.1,
      },
      uLight: {
        value: new THREE.Vector3(lightX, lightY, lightZ),
      },
      uResolution: {
        value: new THREE.Vector2(
          window.innerWidth,
          window.innerHeight,
        ).multiplyScalar(Math.min(window.devicePixelRatio, 2)),
      },
    }
  }, [lightX, lightY, lightZ])

  useEffect(() => {
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)

      const resolution = new THREE.Vector2(
        window.innerWidth,
        window.innerHeight,
      ).multiplyScalar(dpr)

      camera &&
        ((camera as THREE.PerspectiveCamera).aspect =
          window.innerWidth / window.innerHeight)
      camera.updateProjectionMatrix()

      backRenderTarget.setSize(window.innerWidth, window.innerHeight)
      mainRenderTarget.setSize(window.innerWidth, window.innerHeight)

      uniforms.uResolution.value = resolution
    }

    window.addEventListener('resize', handleResize)

    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [camera, backRenderTarget, mainRenderTarget, uniforms])

  useFrame((state) => {
    const { gl, scene, camera, clock } = state

    const elaplsedTime = clock.getElapsedTime()
    const x = Math.sin(elaplsedTime) * 7
    const z = Math.cos(elaplsedTime) * 7

    camera.position.set(x, 5, z)

    if (mesh.current) {
      const shaderMaterial = mesh.current.material as THREE.ShaderMaterial

      shaderMaterial.uniforms.uIorR.value = iorR
      shaderMaterial.uniforms.uIorY.value = iorY
      shaderMaterial.uniforms.uIorG.value = iorG
      shaderMaterial.uniforms.uIorC.value = iorC
      shaderMaterial.uniforms.uIorB.value = iorB
      shaderMaterial.uniforms.uIorP.value = iorP
      shaderMaterial.uniforms.uLight.value = new THREE.Vector3(
        lightX,
        lightY,
        lightZ,
      )
      shaderMaterial.uniforms.uSaturation.value = saturation
      shaderMaterial.uniforms.uRefractPower.value = refraction
      shaderMaterial.uniforms.uChromaticAberration.value = chormaticAberration
      shaderMaterial.uniforms.uFresnelPower.value = fresnelPower
      shaderMaterial.uniforms.uShininess.value = shininess
      shaderMaterial.uniforms.uDiffuseness.value = diffuseness

      mesh.current && (mesh.current.visible = false)
      gl.setRenderTarget(backRenderTarget)
      gl.render(scene, camera)
      shaderMaterial.uniforms.uTexture.value = backRenderTarget.texture

      shaderMaterial.side = THREE.BackSide
      mesh.current.visible = true
      gl.setRenderTarget(mainRenderTarget)
      gl.render(scene, camera)

      shaderMaterial.uniforms.uTexture.value = mainRenderTarget.texture
      shaderMaterial.side = THREE.FrontSide

      mesh.current.visible = true
    }

    gl.setRenderTarget(null)
  })

  return (
    <>
      <color attach="background" args={['black']} />

      <group ref={backgroundgroup} visible={false}>
        <mesh position={[-4, -3, -4]}>
          <icosahedronGeometry args={[2, 16]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh position={[4, -3, -4]}>
          <icosahedronGeometry args={[2, 16]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh position={[-5, 3, -4]}>
          <icosahedronGeometry args={[2, 16]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh position={[5, 3, -4]}>
          <icosahedronGeometry args={[2, 16]} />
          <meshBasicMaterial color="white" />
        </mesh>
      </group>

      <mesh ref={mesh}>
        <torusGeometry args={[2, 0.2, 30, 30]} />
        <shaderMaterial
          key={uuidv4()}
          vertexShader={vertexshader}
          fragmentShader={fragmentshader}
          uniforms={uniforms}
        />
      </mesh>
    </>
  )
}

export const Experience = (): JSX.Element => {
  return (
    <>
      <Leva collapsed />
      <Canvas shadows camera={{ position: [0, 0, 7] }} dpr={[1, 2]}>
        <OrbitControls />
        <ambientLight intensity={1.0} />
        <Geometries />
      </Canvas>
    </>
  )
}
