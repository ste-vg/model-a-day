import * as THREE from 'three'
import fragShader from './loader-frag.glsl'

class Loader
{
    constructor (color = 'black', shadow = "white", size = 1)
    {
        this.mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(2,2,1,1),
            new THREE.ShaderMaterial({
            uniforms: {
                uColor: { value: new THREE.Color(color) },
                uColorShadow: { value: new THREE.Color(shadow) },
                uProgress: { value: 0 },
                uNoiseSize: { value: size }
            },
            vertexShader: `
                varying vec2 vUv;
  
                void main(){
                    vUv = uv;
                    gl_Position = vec4(position.xy, 0, 1.);
                }
            `,
            fragmentShader: fragShader,
            transparent: true
            })
        )    
    }

    get progress()
    {
        return this.mesh.material.uniforms.uProgress.value;
    }

    set progress(newValue)
    {
        this.mesh.material.uniforms.uProgress.value = newValue;
    }
    
    get noiseSize()
    {
        return this.mesh.material.uniforms.uNoiseSize.value;
    }

    set noiseSize(newValue)
    {
        this.mesh.material.uniforms.uNoiseSize.value = newValue;
    }
}

export { Loader }