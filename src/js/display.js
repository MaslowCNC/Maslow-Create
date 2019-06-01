import GlobalVariables from './globalvariables'
import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'

export default class Display {

    constructor(){
        GlobalVariables.api = require('@jsxcad/api-v1')
        this.convert = require('@jsxcad/convert-threejs')
        this.datasets = []
        this.camera
        this.controls
        this.scene
        this.renderer
        this.stats
        this.threeMaterial
        this.mesh
        this.gui
        this.targetDiv = document.getElementById('viewerContext')
        
        //Add the JSXCAD window
        this.camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 10500);
        [this.camera.position.x, this.camera.position.y, this.camera.position.z] = [0, -30, 50]
        //
        this.controls = new TrackballControls(this.camera, this.targetDiv)
        this.controls.rotateSpeed = 4.0
        this.controls.zoomSpeed = 4.0
        this.controls.panSpeed = 2.0
        this.controls.noZoom = false
        this.controls.noPan = false
        this.controls.staticMoving = true
        this.controls.dynamicDampingFactor = 0.1
        this.controls.keys = [65, 83, 68]
        this.controls.addEventListener('change', () => { this.render() })
        //
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xB0AEB0)
        this.scene.add(this.camera)
        //
        var ambientLight = new THREE.AmbientLight(0x222222)
        this.scene.add(ambientLight)
        // var light1 = new THREE.PointLight(0xffffff, 0, 1);
        // camera.add(light1);
        var light2 = new THREE.DirectionalLight(0xffffff, 1)
        light2.position.set(1, 1, 1)
        this.camera.add(light2)

        //sets axes
        var axesHelper = new THREE.AxesHelper( 10 )
        this.scene.add(axesHelper)

        // Sets initial plane and mesh
        var planeGeometry = new THREE.PlaneBufferGeometry( 100, 100, 60, 60)
        var planeMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff} )
        planeMaterial.wireframe = true
        planeMaterial.transparent = true 
        planeMaterial.opacity = 0.2
        this.plane = new THREE.Mesh( planeGeometry, planeMaterial )
        this.plane.receiveShadow = true
        this.scene.add( this.plane )

        //
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.targetDiv.appendChild(this.renderer.domElement)
        
        this.onWindowResize()

        this.targetDiv.addEventListener('mousedown', () => {
            if(!GlobalVariables.runMode){
                let sideBar = document.querySelector('.sideBar')
                while (sideBar.firstChild) {
                    sideBar.removeChild(sideBar.firstChild)
                }
                
                //Grid display html element
                var name = document.createElement('h1')
                name.textContent = "3D View"
                name.setAttribute('class','doc-title')
                sideBar.appendChild(name)

                var gridDiv = document.createElement('div')
                sideBar.appendChild(gridDiv)
                gridDiv.setAttribute('id', 'gridDiv')
                var gridCheck = document.createElement('input')
                gridDiv.appendChild(gridCheck)
                gridCheck.setAttribute('type', 'checkbox')
                gridCheck.setAttribute('id', 'gridCheck')
                gridCheck.setAttribute('checked', 'true')
                var gridCheckLabel = document.createElement('label')
                gridDiv.appendChild(gridCheckLabel)
                gridCheckLabel.setAttribute('for', 'gridCheck')
                gridCheckLabel.setAttribute('style', 'margin-right:1em;')
                gridCheckLabel.textContent= "Grid"

                gridCheck.addEventListener('change', event => {
                    if(event.target.checked){
                        this.scene.add( this.plane )
                    }
                    else{
                        this.scene.remove(this.plane)
                    }
                })

                //Axes Html

                var axesDiv = document.createElement('div')
                sideBar.appendChild(axesDiv)
                var axesCheck = document.createElement('input')
                axesDiv.appendChild(axesCheck)
                axesCheck.setAttribute('type', 'checkbox')
                axesCheck.setAttribute('id', 'axesCheck')
                axesCheck.setAttribute('checked', 'true')
                var axesCheckLabel = document.createElement('label')
                axesDiv.appendChild(axesCheckLabel)
                axesCheckLabel.setAttribute('for', 'axesCheck')
                axesCheckLabel.setAttribute('style', 'margin-right:1em;')
                axesCheckLabel.textContent= "Axes"

                axesCheck.addEventListener('change', event => {
                    if(event.target.checked){
                        this.scene.add( axesHelper)
                    }
                    else{
                        this.scene.remove( axesHelper )
                    }
                })

                //Wireframe HTML element

                var wireDiv = document.createElement('div')
                sideBar.appendChild(wireDiv)
                wireDiv.setAttribute('id', 'wireDiv')
                var wireCheck = document.createElement('input')
                wireDiv.appendChild(wireCheck)
                wireCheck.setAttribute('type', 'checkbox')
                wireCheck.setAttribute('id', 'wireCheck')
                wireCheck.setAttribute('checked', 'false')
                var wireCheckLabel = document.createElement('label')
                wireDiv.appendChild(wireCheckLabel)
                wireCheckLabel.setAttribute('for', 'wireCheck')
                wireCheckLabel.setAttribute('style', 'margin-right:10em;')
                wireCheckLabel.textContent= "Wireframe"

                wireCheck.addEventListener('change', event => {
                    if( event.target.checked){
                        this.threeMaterial.wireframe = true
                    }
                    else{
                        this.threeMaterial.wireframe = false
                    }
                })
            }
        })
    }
    
    makeMaterial(material){
        switch (material) {
        case 'metal':
            return new THREE.MeshStandardMaterial({
                color: 0x779aac,
                emissive: 0x7090a0,
                roughness: 0.65,
                metalness: 0.99,
            })
        default:
            return new THREE.MeshNormalMaterial()
        }
    }
    
    writeToDisplay(shape){
        if(shape != null){
            const computeValue = async () => {
                try {
                    return await GlobalVariables.render({values: shape.toLazyGeometry().toGeometry(), key: "render"})
                } catch(err) {
                    return -1
                }
            }

            computeValue().then(result => {
                this.updateDisplayData(result)
            })
        }
    }
    
    zoomCameraToFit(bounds){
        this.controls.reset()
        this.camera.position.x = 0
        this.camera.position.y = -5*Math.max(...bounds[1])
        this.camera.position.z = 5*Math.max(...bounds[1])
    }
    
    updateDisplayData(threejsGeometry){
        // Delete any previous dataset in the window.
        for (const { mesh } of this.datasets) {
            this.scene.remove(mesh)
        }
        
        // Build new datasets from the written data, and display them.
        this.datasets = []
        
        this.threeMaterial = new THREE.MeshStandardMaterial({
            color: 0x5f6670,
            roughness: 0.65,
            metalness: 0.40   
        })

        const walk = (geometry) => {
            if (geometry.assembly) {
                geometry.assembly.forEach(walk)
            } else if (geometry.threejsSegments) {
                const segments = geometry.threejsSegments
                const dataset = {}
                const threejsGeometry = new THREE.Geometry()
                for (const [[aX, aY, aZ], [bX, bY, bZ]] of segments) {
                    threejsGeometry.vertices.push(new THREE.Vector3(aX, aY, aZ), new THREE.Vector3(bX, bY, bZ))
                }
                dataset.mesh = new THREE.LineSegments(threejsGeometry, this.threeMaterial)
                this.scene.add(dataset.mesh)
                this.datasets.push(dataset)
            } else if (geometry.threejsSolid) {
                const { positions, normals } = geometry.threejsSolid
                const dataset = {}
                const threejsGeometry = new THREE.BufferGeometry()
                threejsGeometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
                threejsGeometry.addAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
                dataset.mesh = new THREE.Mesh(threejsGeometry, this.threeMaterial)
                this.scene.add(dataset.mesh)
                this.datasets.push(dataset)
            } else if (geometry.threejsSurface) {
                const { positions, normals } = geometry.threejsSurface
                const dataset = {}
                const threejsGeometry = new THREE.BufferGeometry()
                threejsGeometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
                threejsGeometry.addAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
                dataset.mesh = new THREE.Mesh(threejsGeometry, this.threeMaterial)
                this.scene.add(dataset.mesh)
                this.datasets.push(dataset)
            }
        }
        walk(threejsGeometry)
    }
    
    onWindowResize() {
        this.camera.aspect = this.targetDiv.clientWidth / (this.targetDiv.clientHeight)
        this.camera.updateProjectionMatrix()
        this.controls.handleResize()
        this.renderer.setSize(this.targetDiv.clientWidth, this.targetDiv.clientHeight)
    }
    
    render() {
        this.renderer.render( this.scene, this.camera )
    }
}