import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'dat.gui'
import Stats from 'stats.js'
import { Stage } from "./stage";
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { defineGrid } from 'honeycomb-grid'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import models from '../../_data/models.json';
import { Loader } from "./loader";
import { gsap } from "gsap"

console.log({models})

// Debug
// const gui = new dat.GUI()
const stats = new Stats()
stats.showPanel(0)
// document.body.appendChild(stats.dom)

/**
 * Stage
 */

const canvas = document.querySelector('canvas.webgl')
const stage = new Stage(canvas, '#ffffff', '#bbbbbb')
stage.controls.target = new THREE.Vector3(0, .5, 0)

/**
 * Loaders
 */

const loaderScreen = new Loader('#73BADA', '#58A4D3');
stage.add(loaderScreen.mesh);

gsap.to(loaderScreen, {progress: 1, noiseSize: 3, duration: 1.5, delay: 2, ease: 'power3.inOut'});

const textureLoader = new THREE.TextureLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/workers/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Materials
 */

const materials = {
    light: new THREE.MeshMatcapMaterial({ matcap: textureLoader.load('/textures/matcap-light-512.png') }),
    dark: new THREE.MeshMatcapMaterial({ matcap: textureLoader.load('/textures/matcap-dark-512.png') }),
    base: new THREE.MeshMatcapMaterial({ matcap: textureLoader.load('/textures/matcap-base-512.png') }),
    accent: new THREE.MeshMatcapMaterial({ matcap: textureLoader.load('/textures/matcap-accent-512.png') }),
    metal: new THREE.MeshMatcapMaterial({ matcap: textureLoader.load('/textures/matcap-metal-512.png') }),
}

const mats = Object.keys(materials).map(key => materials[key]);

const updateAllMaterials = (scene) =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh)
        {
            const type = child.name.split('_')[0]
            if(materials[type]) child.material = materials[type];
            else console.error(`This mesh name was missing the material type`, child.name)
        }
    })
}


/**
 * Grid
 */

const geometries = []
const testItems = []

const testItemRadius = 0.5
const testGeometries = [
    new THREE.DodecahedronGeometry(testItemRadius),
    new THREE.OctahedronGeometry(testItemRadius),
    new THREE.TorusKnotGeometry( .3, .1, 150, 202),
    new THREE.BoxGeometry( testItemRadius, testItemRadius, testItemRadius ),
    new THREE.ConeGeometry( testItemRadius * 0.8, testItemRadius * 1.5, 15 )
]

const count = models.length;
let radius = 0;
let spaces = 1;

while (spaces < count)
{
    radius++;
    spaces += 6 * radius;
}

const grid = defineGrid().hexagon({radius})
const gap = 1.3;

for(let i = 0; i < count; i++)
{
    const geometry = new THREE.CylinderGeometry( 1, 1, .1, 6 )

    const hex = grid.splice(Math.floor(grid.length / 2),1)[0]
    const pos = hex.toPoint();

    pos.x = pos.x * gap
    pos.y = pos.y * gap

    models[i].position = pos;

    // geometry.rotateX((Math.random() - 0.5) * Math.PI * 0.05)
    // geometry.rotateZ((Math.random() - 0.5) * Math.PI * 0.05)

    geometry.translate(
        pos.x,
        -0.05,
        pos.y
    )

    geometries.push(geometry)

    const item = new THREE.Mesh(
        testGeometries[Math.floor(Math.random() * testGeometries.length)], 
        mats[Math.floor(Math.random() * mats.length)]
    )
    item.position.x = pos.x;
    item.position.y = 0.7;
    item.position.z = pos.y;

    item.rotation.x = (Math.random() - 0.5) * Math.PI * 2
    // item.rotation.z = (Math.random() - 0.5) * Math.PI * 2

    testItems.push(item)
    // stage.add(item)
}

const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)

const mesh = new THREE.Mesh(mergedGeometry, materials.light)
stage.add(mesh)




/**
 * Tests
 */

models.forEach(model => 
{
    gltfLoader.load(
        `/models/${model.file}`,
        (gltf) =>
        {
            gltf.scene.position.x = model.position.x
            gltf.scene.position.z = model.position.y
            stage.add(gltf.scene)
            
            // Update materials
            updateAllMaterials(gltf.scene)
        }
    )        
})
/**
 * Tick
 */

const clock = new THREE.Clock()

const tick = () =>
{
    stats.begin()

    testItems.forEach(item => 
    {
        item.rotation.z += 0.005
    })

    const elapsedTime = clock.getElapsedTime()

    stage.render(elapsedTime)
    // Call tick again on the next frame
    stats.end()
    window.requestAnimationFrame(tick)
}

tick()