import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'dat.gui'
import Stats from 'stats.js'
import { Stage } from "./stage";

// Debug
const gui = new dat.GUI()
const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

/**
 * Stage
 */

const stage = new Stage(document.querySelector('canvas.webgl'))

/**
 * Loaders
 */

const loadingManager = new THREE.LoadingManager( 
    // Loaded
    () =>
    {
        console.log('loaded')
    },

    // Progress
    () =>
    {
        console.log('progress')
    })
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()

/**
 * Tick
 */

const clock = new THREE.Clock()

const tick = () =>
{
    stats.begin()
    const elapsedTime = clock.getElapsedTime()

    stage.render(elapsedTime)
    // Call tick again on the next frame
    stats.end()
    window.requestAnimationFrame(tick)
}

tick()