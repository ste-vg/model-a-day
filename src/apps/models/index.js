import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'dat.gui'
import Stats from 'stats.js'
import { Stage } from "./stage";
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { defineGrid, extendHex } from 'honeycomb-grid'

// Debug
const gui = new dat.GUI()
const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

/**
 * Stage
 */

const canvas = document.querySelector('canvas.webgl')
const stage = new Stage(canvas, '#ffffff', '#bbbbbb')
stage.controls.target = new THREE.Vector3(0, .5, 0)

/**
 * Loaders
 */

const textureLoader = new THREE.TextureLoader()

/**
 * Materials
 */

const textureLight = textureLoader.load('/textures/matcap-light-512.png');
const textureBase = textureLoader.load('/textures/matcap-base-512.png');
const textureAccent = textureLoader.load('/textures/matcap-accent-512.png');
const textureShiny = textureLoader.load('/textures/matcap-shiny-512.png');

const materials = {
    light: new THREE.MeshMatcapMaterial({ matcap: textureLight }),
    base: new THREE.MeshMatcapMaterial({ matcap: textureBase }),
    accent: new THREE.MeshMatcapMaterial({ matcap: textureAccent }),
    shiny: new THREE.MeshMatcapMaterial({ matcap: textureShiny })
}

const mats = Object.keys(materials).map(key => materials[key]);

/**
 * Grid
 */

const geometries = []
const testItems = []

const testItemRadius = 0.5
const testGeometries = [
    new THREE.DodecahedronGeometry(testItemRadius),
    new THREE.OctahedronGeometry(testItemRadius),
    new THREE.TorusKnotGeometry( .3, .1),
    new THREE.BoxGeometry( testItemRadius, testItemRadius, testItemRadius ),
    new THREE.ConeGeometry( testItemRadius * 0.8, testItemRadius * 1.5, 15 )
]


const count = 30;
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

    // geometry.rotateX((Math.random() - 0.5) * Math.PI * 0.05)
    // geometry.rotateZ((Math.random() - 0.5) * Math.PI * 0.05)

    geometry.translate(
        pos.x * gap,
        0,
        pos.y * gap
    )

    geometries.push(geometry)

    const item = new THREE.Mesh(
        testGeometries[Math.floor(Math.random() * testGeometries.length)], 
        mats[Math.floor(Math.random() * mats.length)]
    )
    item.position.x = pos.x * gap;
    item.position.y = 0.7;
    item.position.z = pos.y * gap;

    item.rotation.x = (Math.random() - 0.5) * Math.PI * 2
    // item.rotation.z = (Math.random() - 0.5) * Math.PI * 2

    testItems.push(item)
    stage.add(item)
}

const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)

const mesh = new THREE.Mesh(mergedGeometry, materials.light)
stage.add(mesh)




/**
 * Tests
 */

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