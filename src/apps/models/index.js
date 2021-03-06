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

let text = null;

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



const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
        gsap.to(loaderScreen, {progress: 1, noiseSize: 3, duration: 2.5, delay: 0, ease: 'power4.inOut'});
    },

    // Progress
    (itemUrl, itemsLoaded, itemsTotal) =>
    {
        // console.log('progress', itemUrl, itemsLoaded, itemsTotal)
    }
)

const textureLoader = new THREE.TextureLoader(loadingManager)
const fontLoader = new THREE.FontLoader(loadingManager)
const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('/workers/draco/')

const gltfLoader = new GLTFLoader(loadingManager)
      gltfLoader.setDRACOLoader(dracoLoader)

      

/**
 * Materials
 */

const textureLight = textureLoader.load('/textures/matcap-light-512.png')
const textureDark = textureLoader.load('/textures/matcap-dark-512.png')
const textureBase = textureLoader.load('/textures/matcap-base-512.png')
const textureAccent = textureLoader.load('/textures/matcap-accent-512.png')
const textureMetal = textureLoader.load('/textures/matcap-metal-512.png')

const materials = {
    light: new THREE.MeshMatcapMaterial({ matcap: textureLight }),
    dark: new THREE.MeshMatcapMaterial({ matcap: textureDark }),
    base: new THREE.MeshMatcapMaterial({ matcap: textureBase }),
    accent: new THREE.MeshMatcapMaterial({ matcap: textureAccent }),
    metal: new THREE.MeshMatcapMaterial({ matcap: textureMetal }),
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
 * Models
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

            model.scene = gltf.scene
            
            // Update materials
            updateAllMaterials(gltf.scene)
        }
    )        
})

/**
 * Intro
 */

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) =>
    {

        const textMaterial = new THREE.MeshMatcapMaterial({ matcap: textureAccent })

        // textMaterial.onBeforeCompile = (shader) =>
        // {
        //     shader.vertexShader = shader.vertexShader.replace(
        //         '#include <project_vertex>',
        //         `
        //             vec4 mvPosition = vec4( transformed, 1.0 );
        //             gl_Position = mvPosition;
        //         `
        //     )
        // }

        // Text
        const textGeometry = new THREE.TextBufferGeometry(
            'Test',
            {
                font: font,
                size: 0.5,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            }
        )
        textGeometry.center()

        text = new THREE.Mesh(textGeometry, textMaterial)
        // text.material.depthWrite = false
        // text.renderOrder = 999
        text.position.set(1, 1.5, -1)
        text.lookAt(4, 2, -4)
        // stage.add(text)

        
    }
)

/**
 * Tick
 */

const clock = new THREE.Clock()

const tick = () =>
{
    stats.begin()


    // if(text) text.rotation.z += 0.005


    const elapsedTime = clock.getElapsedTime()

    stage.render(elapsedTime)
    // Call tick again on the next frame
    stats.end()
    window.requestAnimationFrame(tick)
}

tick()