import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { BackgroundGradient } from "./backgroundGradient";

class Stage
{
    constructor(domCanvasElement, topColor, bottomColor)
    {
        this.canvas = domCanvasElement
        this.scene = new THREE.Scene()

        this.sizes = {
            width: 0,
            height: 0
        }

        /**
         * Background Gradient
         */

        this.scene.add(BackgroundGradient(bottomColor, topColor))

        /**
         * Camera
         */
        
        this.camera = new THREE.PerspectiveCamera(30, this.sizes.width / this.sizes.height, 0.1, 100)
        this.camera.position.set(3, 2, -3)
        this.scene.add(this.camera)

        // Controls
        this.controls = new OrbitControls(this.camera, this.canvas)
        this.controls.enableDamping = true

        /**
         * Renderer
         */
        const renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        })

        renderer.physicallyCorrectLights = true
        renderer.outputEncoding = THREE.sRGBEncoding
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1

        this.renderer = renderer

        window.addEventListener('resize', () => { this.onResize() })

        this.onResize()
        
    }

    onResize()
    {
        // Update sizes
        this.sizes.width = window.innerWidth
        this.sizes.height = window.innerHeight

        // Update camera
        this.camera.aspect = this.sizes.width / this.sizes.height
        this.camera.updateProjectionMatrix()

        // Update renderer
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    add(item)
    {
        this.scene.add(item)
    }

    render(elapsedTime)
    {
        this.controls.update()
        this.renderer.render(this.scene, this.camera)
    }
}

export { Stage };