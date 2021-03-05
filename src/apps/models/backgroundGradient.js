import * as THREE from 'three'

const BackgroundGradient = (colorA, colorB) => {
    var mesh = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2,2,1,1),
        new THREE.ShaderMaterial({
          uniforms: {
            uColorA: { value: new THREE.Color(colorA) },
            uColorB: { value: new THREE.Color(colorB) }
          },
          vertexShader: `
            varying vec2 vUv;
            void main(){
                vUv = uv;
                float depth = -1.; //or maybe 1. you can experiment
                gl_Position = vec4(position.xy, depth, 1.);
            }
          `,
          fragmentShader: 
          `
            varying vec2 vUv;
            uniform vec3 uColorA;
            uniform vec3 uColorB;
            void main(){
                gl_FragColor = vec4(
                    mix( uColorA, uColorB, vec3(vUv.y)),
                    1.
                );
            }
          `
        })
    )
    
    mesh.material.depthWrite = false
    mesh.renderOrder = -99999
    return mesh
}

export { BackgroundGradient }