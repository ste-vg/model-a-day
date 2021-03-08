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
        const tl = gsap.timeline();

        tl.set(letterGroup.position, {z: -0.3, x: -0.02})
        introTextPositions.forEach((item, i) => {
            tl.from(item.mesh.position, {z: -0.3, duration: 2, delay: i * 0.05, ease: 'elastic.out'},0)
            tl.from(item.mesh.rotation, {x: (Math.random() - 0.5) * 10, z: (Math.random() - 0.5) * 10, duration: 2, delay: i * 0.05, ease: 'elastic.out'},0)
            
            tl.to(item.mesh.position, {z: 0.5, y: -0.5, duration: 1.2,  delay: (introTextPositions.length - i) * 0.05, ease: 'power3.in'},3)
            tl.to(item.mesh.rotation, {x: (Math.random() - 0.5) * 40, z: (Math.random() - 0.5) * 20,  delay: (introTextPositions.length - i) * 0.03, duration: 1.2, ease: 'power3.in'},3)
            
        })
        // tl.to(letterGroup.scale, {x: 6, y: 6, z: 6, duration: 1.5,  ease: 'power4.in'}, 3)
        // tl.to(letterGroup.position, {x: -0.12, y: 0.08, duration: 1.5,  ease: 'power4.in'}, 3)

        tl.to(loaderScreen, {progress: 1, noiseSize: 3, duration: 2.5, ease: 'power4.inOut'}, 3.5)
        tl.from(stage.camera.position, {x:5, y:50, z:-50, duration: 4, ease: 'power4.out'}, 3.5)
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
const textureAlt = textureLoader.load('/textures/matcap-alt-512.png')

const materials = {
    light: new THREE.MeshMatcapMaterial({ matcap: textureLight }),
    dark: new THREE.MeshMatcapMaterial({ matcap: textureDark }),
    base: new THREE.MeshMatcapMaterial({ matcap: textureBase }),
    accent: new THREE.MeshMatcapMaterial({ matcap: textureAccent }),
    metal: new THREE.MeshMatcapMaterial({ matcap: textureMetal }),
    alt: new THREE.MeshMatcapMaterial({ matcap: textureAlt }),
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

const letterGroup = new THREE.Group();
const introTextPositions = [
    { letter: 'M', x: 0, y: 0 },
    { letter: 'o', x: 0.015, y: 0 },
    { letter: 'd', x: 0.027, y: 0 },
    { letter: 'e', x: 0.0375, y: 0 },
    { letter: 'l', x: 0.045, y: 0 },
    { letter: 'a', x: 0, y: -0.02 },
    { letter: 'd', x: 0.019, y: -0.02 },
    { letter: 'a', x: 0.03, y: -0.02 },
    { letter: 'y', x: 0.041, y: -0.02 },
]

fontLoader.load(
    '/fonts/Flavors_Regular.json',
    (font) =>
    {
        const textSettings = {
            font: font,
            size: 0.5,
            height: 0.1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: 0.01,
            bevelOffset: 0,
            bevelSegments: 5
        }

        const letterScale = 0.03

        const letterGeometries = {}
        'Modelay'.split('').forEach(letter => {
            const textGeometry = new THREE.TextBufferGeometry(letter, textSettings)
            textGeometry.center()
            letterGeometries[letter] = textGeometry
        })

        
        letterGroup.position.x = -0.015
        letterGroup.position.y = 0.01

        // Text

        

        introTextPositions.forEach((position, i) => {
            
            const text = new THREE.Mesh(letterGeometries[position.letter], materials.accent)
            text.position.x = position.x;
            text.position.y = position.y;
           
            text.scale.set(letterScale, letterScale, letterScale)

            position.mesh = text

            letterGroup.add(text)
        })
        
        stage.cameraAdd(letterGroup)
        

        
    }
)



// const testGeometry = new THREE.DodecahedronGeometry(0.2);
// const testMesh = new THREE.Mesh(testGeometry, materials.accent)
// testMesh.position.z = -2;

// stage.cameraAdd(testMesh)



/**
 * Tick
 */

const clock = new THREE.Clock()

const tick = () =>
{
    stats.begin()


    // if(text) text.rotation.x -= 0.01
    // if(text) text.rotation.z += 0.02

    


    const elapsedTime = clock.getElapsedTime()

    stage.render(elapsedTime)
    // Call tick again on the next frame
    stats.end()
    window.requestAnimationFrame(tick)
}

tick()