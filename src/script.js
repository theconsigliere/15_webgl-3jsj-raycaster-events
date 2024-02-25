import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import GUI from "lil-gui"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
const gltfLoader = new GLTFLoader()

let duck = null
gltfLoader.load("./models/Duck/glTF-Binary/Duck.glb ", (gltf) => {
  duck = gltf.scene
  duck.position.y = -1
  scene.add(duck)
})

const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
)
object1.position.x = -2

const object2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
)

const object3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: "#ff0000" })
)
object3.position.x = 2

scene.add(object1, object2, object3)

object1.updateMatrixWorld()
object2.updateMatrixWorld()
object3.updateMatrixWorld()

// RAYCASTER

const raycaster = new THREE.Raycaster()

// // set orgin and direction of ray
// const rayOrigin = new THREE.Vector3(-3, 0, 0)
// const rayDirection = new THREE.Vector3(10, 0, 0)
// the direction has to be normalized if length is not 1
// rayDirection.normalize()

// raycaster.set(rayOrigin, rayDirection)

const objectsToTest = [object1, object2, object3]
let witnessIntersect = null

// // cast a ray
// const intersect = raycaster.intersectObject(object2)
// console.log(intersect)

// const intersects = raycaster.intersectObjects([object1, object2, object3])
// console.log(intersects)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// MOUSE

const mouse = new THREE.Vector2()

window.addEventListener("mousemove", (event) => {
  // to clamp values between -1 and 1 with 0 in the middle
  // event.clientX / sizes.width gets a value between 0 and 1
  // then we multiply by 2 to get a value between 0 and 2
  // then we subtract 1 to get a value between -1 and 1
  mouse.x = (event.clientX / sizes.width) * 2 - 1
  mouse.y = -(event.clientY / sizes.height) * 2 + 1
})

window.addEventListener("click", () => {
  if (witnessIntersect) {
    switch (witnessIntersect.object) {
      case object1:
        console.log("click on object 1")
        break
      case object2:
        console.log("click on object 2")
        break
      case object3:
        console.log("click on object 3")
        break
    }
  }
})

// lights

const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.1)
directionalLight.position.set(1, 2, 3)
scene.add(directionalLight)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // animate objects
  object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
  object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
  object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5

  // set raycaster
  //

  // set them all red
  // for (const object of objectsToTest) {
  //     object.material.color.set("#ff0000")
  //   }

  //   set the intersected object blue
  //   for (const intersect of intersects) {
  //     intersect.object.material.color.set("#0000ff")
  //   }

  // update the picking ray with the camera and mouse position

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(objectsToTest)

  // set all objects to red
  for (const intersect of intersects) {
    intersect.object.material.color.set("#0000ff")
  }

  // when we hover over and intersected object, we want to change its color to blue
  for (const object of objectsToTest) {
    if (!intersects.find((intersect) => intersect.object === object)) {
      object.material.color.set("#ff0000")
    }
  }

  // test and update witnessIntersect
  if (intersects.length) {
    if (!witnessIntersect) {
      console.log("mouse enter")
    }
    witnessIntersect = intersects[0]
  } else {
    if (witnessIntersect) {
      console.log("mouse leave")
    }
    witnessIntersect = null
  }

  // test intersect with duck
  if (duck) {
    const duckIntersect = raycaster.intersectObject(duck)

    if (duckIntersect.length) {
      duck.scale.set(1.5, 1.5, 1.5)
    } else {
      duck.scale.set(1, 1, 1)
    }
  }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
