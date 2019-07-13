import GlobalVariables from './globalvariables'
import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'

/**
 * This class handles writing to the 3D preview display
 */
export default class Display {
    /**
     * The constructor run to create the new display. It seems to run with each refresh which doesn't seem right to me.
     */
    constructor(){
        /** 
         * An array which contains the data to be respresented in 3D.
         * @type {array}
         */
        this.datasets = []
        /** 
         * An Flag to indicate if the grid on the XY plane should be displayed.
         * @type {boolean}
         */
        this.displayGrid = true
        /** 
         * Grid scale to keep track of zoom scale
         * @type {number}
         */
        this.gridScale = 5
        /** 
         * A flag to indicate if the axes should be displayed.
         * @type {boolean}
         */
        this.axesCheck = true
        /** 
         * A flag to indicate if the frame should be displayed in wire frame.
         * @type {boolean}
         */
        this.wireDisplay = false
        /** 
         * A threejs camera instance.
         * @type {object}
         */
        this.camera
        /** 
         * A three js controls instance.
         * @type {object}
         */
        this.controls
        /** 
         * A threejs scene instance.
         * @type {object}
         */
        this.scene
        /** 
         * A threejs renderer instance.
         * @type {object}
         */
        this.renderer
        /** 
         * An instance of the threejs mesh material.
         * @type {object}
         */
        this.threeMaterial
        /** 
         * The applied material type.
         * @type {object}
         */
        this.mesh
        /** 
         * The HTML div object targeted to add the display to.
         * @type {object}
         */
        this.targetDiv = document.getElementById('viewerContext')
        
        //Add the JSXCAD window
        /** 
         * The camera which controls how the scene is rendered.
         * @type {object}
         */
        this.camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 10500);
        [this.camera.position.x, this.camera.position.y, this.camera.position.z] = [0, -30, 50]
        //
        /** 
         * The controls which let the user pan and zoom with the mouse.
         * @type {object}
         */
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
        /** 
         * The threejs scene to which things should be added to show up on the display.
         * @type {object}
         */
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
        
        //
        /** 
         * The three js webGLRendere object which does the actual rendering to the screen.
         * @type {object}
         */

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
               
                if (this.displayGrid){
                    gridCheck.setAttribute('checked', 'true')
                }

                var gridCheckLabel = document.createElement('label')
                gridDiv.appendChild(gridCheckLabel)
                gridCheckLabel.setAttribute('for', 'gridCheck')
                gridCheckLabel.setAttribute('style', 'margin-right:1em;')
                gridCheckLabel.textContent= "Grid"

                gridCheck.addEventListener('change', event => {
                    if(event.target.checked){
                        this.scene.add( this.plane )
                        this.displayGrid = true
                    }
                    else{
                        this.scene.remove(this.plane)
                        this.displayGrid = false
                    }
                })

                //Axes Html

                var axesDiv = document.createElement('div')
                sideBar.appendChild(axesDiv)
                var axesCheck = document.createElement('input')
                axesDiv.appendChild(axesCheck)
                axesCheck.setAttribute('type', 'checkbox')
                axesCheck.setAttribute('id', 'axesCheck')
                
                if (this.axesCheck){
                    axesCheck.setAttribute('checked', 'true')
                }

                var axesCheckLabel = document.createElement('label')
                axesDiv.appendChild(axesCheckLabel)
                axesCheckLabel.setAttribute('for', 'axesCheck')
                axesCheckLabel.setAttribute('style', 'margin-right:1em;')
                axesCheckLabel.textContent= "Axes"

                axesCheck.addEventListener('change', event => {
                    if(event.target.checked){
                        this.scene.add( axesHelper)
                        this.axesCheck = true
                    }
                    else{
                        this.scene.remove( axesHelper )
                        this.axesCheck = false
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
               
                if (this.wireDisplay){
                    wireCheck.setAttribute('checked', 'true')
                    this.threeMaterial.wireframe = true
                }
                //wireCheck.setAttribute('checked', false)
                var wireCheckLabel = document.createElement('label')
                wireDiv.appendChild(wireCheckLabel)
                wireCheckLabel.setAttribute('for', 'wireCheck')
                wireCheckLabel.setAttribute('style', 'margin-right:10em;')
                wireCheckLabel.textContent= "Wireframe"

                wireCheck.addEventListener('change', event => {
                    if( event.target.checked){
                        this.threeMaterial.wireframe = true
                        this.wireDisplay = true
                    }
                    else{
                        this.threeMaterial.wireframe = false
                        this.wireDisplay = false
                    }
                })
            }
        })
        
        // This event listener adjusts the gridScale when you zoom in and out
        
        this.targetDiv.addEventListener('wheel', () =>{ 
            
            if((this.dist3D(this.camera.position)/this.gridScale) > 5){
                //this.scene.remove(this.plane)
                this.gridScale *= 5
                this.resizeGrid()
            }
            else if((this.dist3D(this.camera.position)/this.gridScale) < .5){ 
                //this.scene.remove(this.plane)
                this.gridScale /= 5
                this.resizeGrid()
            }    
        })
    }

    /**
     * This function is intended to calculate the 3d distance between object and camera
     * @param {position} material - A string to define the material type.
     */ 
    dist3D(position){
        const distance3D = Math.sqrt(Math.pow(position.x,2)
                         + Math.pow(position.y,2)
                         + Math.pow(position.z,2))
        return distance3D
    }
    
    /**
     * This function is intended to allow for materials. It is currently not used and can probably be deleted.
     * @param {object} material - A string to define the material type.
     */ 
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
    
    /**
     * Writes a shape to the 3D display. Expecting a threejs geometry.
     * @param {object} shape - A jsxcad geometry data set to write to the display. Computation is done in a worker thread
     */ 
    writeToDisplay(shape){
        if(shape != null){
            const computeValue = async () => {
                try {
                    return await GlobalVariables.render({values: shape, key: "render"})
                } catch(err) {
                    console.warn(err)
                    return -1
                }
            }

            computeValue().then(result => {
                this.updateDisplayData(result)
            })
        }
    }
    
    /**
     * Zooms the camera to fit target bounds on the screen.
     * @param {array} bounds - An array of some sort...this comment should be updated.
     */ 
    zoomCameraToFit(bounds){

        this.controls.reset()
        this.camera.position.x = 0
        this.camera.position.y = -5*Math.max(...bounds[1])
        this.camera.position.z = 5*Math.max(...bounds[1])

        /*initializes grid at scale if object loaded is already 
            zoomed out farther than initial grid tier*/ 
        while((this.dist3D(this.camera.position)/this.gridScale) > 5){
            this.gridScale *= 5 
            // Creates initial grid plane
            this.resizeGrid()
        }
    }

    /**
     * Redraws the grid with gridscale update value
     */ 
    resizeGrid () {
        this.scene.remove(this.plane)
        var planeGeometry = new THREE.PlaneBufferGeometry( this.gridScale, this.gridScale, 10, 10)
        var planeMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff} )
        planeMaterial.wireframe = true
        planeMaterial.transparent = true 
        planeMaterial.opacity = 0.2
        this.plane = new THREE.Mesh( planeGeometry, planeMaterial )
        this.plane.receiveShadow = true
        this.scene.add( this.plane )   
    }

    /**
     * Clears the display and writes a threejs geometry to it.
     * @param {object} threejsGeometry - A threejs geometry to write to the display.
     */ 
    updateDisplayData(threejsGeometry){
        // Delete any previous dataset in the window.
        for (const { mesh } of this.datasets) {
            this.scene.remove(mesh)
        }
        
        // Build new datasets from the written data, and display them.
        this.datasets = []
        
        /** 
         * Does this even need to be a global object?
         * @type {object}
         */
        this.threeMaterial = new THREE.MeshStandardMaterial({
            color: 0x5f6670,
            roughness: 0.65,
            metalness: 0.40,   
            wireframe: this.wireDisplay
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
    
    /**
     * Handles resizing the 3D viewer when the window resizes.
     */ 
    onWindowResize() {
        this.camera.aspect = this.targetDiv.clientWidth / (this.targetDiv.clientHeight)
        this.camera.updateProjectionMatrix()
        this.controls.handleResize()
        this.renderer.setSize(this.targetDiv.clientWidth, this.targetDiv.clientHeight)
    }
    
    /**
     * Runs regularly to update the display.
     */ 
    render() {
        this.renderer.render( this.scene, this.camera )
    }
}