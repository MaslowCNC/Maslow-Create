import GlobalVariables from './globalvariables'
import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'

/**
 * This class handles writing to the 3D preview display. Large parts of this class are copied directly from JSxCAD.
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
         * The applied material type.
         * @type {object}
         */
        this.mesh
        /** 
         * The HTML div object targeted to add the display to.
         * @type {object}
         */
        this.targetDiv = document.getElementById('viewerContext')
        
        /** 
         * The default material used if nothing is set
         * @type {object}
         */
        this.threeMaterial = new THREE.MeshStandardMaterial({
            color: 0x5f6670,
            roughness: 0.65,
            metalness: 0.40,   
            wireframe: this.wireDisplay
        })
        
        /** 
         * A list of colors to RGB mappings.
         * @type {object}
         */
        this.colorToRgbMapping = {
            'Aliceblue': [240, 248, 255],
            'antiquewhite': [250, 235, 215],
            'aqua': [0, 255, 255],
            'aquamarine': [127, 255, 212],
            'azure': [240, 255, 255],
            'beige': [245, 245, 220],
            'bisque': [255, 228, 196],
            'black': [0, 0, 0],
            'Black': [70, 70, 70], // Dark gray
            'blanchedalmond': [255, 235, 205],
            'Blue': [0, 0, 255],
            'blueviolet': [138, 43, 226],
            'brown': [165, 42, 42],
            'burlywood': [222, 184, 135],
            'cadetblue': [95, 158, 160],
            'chartreuse': [127, 255, 0],
            'chocolate': [210, 105, 30],
            'coral': [255, 127, 80],
            'cornflowerblue': [100, 149, 237],
            'cornsilk': [255, 248, 220],
            'crimson': [220, 20, 60],
            'Cyan': [0, 255, 255],
            'darkblue': [0, 0, 139],
            'darkcyan': [0, 139, 139],
            'darkgoldenrod': [184, 134, 11],
            'Darkgray': [169, 169, 169],
            'darkgreen': [0, 100, 0],
            'darkgrey': [169, 169, 169],
            'darkkhaki': [189, 183, 107],
            'darkmagenta': [139, 0, 139],
            'darkolivegreen': [85, 107, 47],
            'darkorange': [255, 140, 0],
            'darkorchid': [153, 50, 204],
            'darkred': [139, 0, 0],
            'darksalmon': [233, 150, 122],
            'darkseagreen': [143, 188, 143],
            'darkslateblue': [72, 61, 139],
            'darkslategray': [47, 79, 79],
            'darkslategrey': [47, 79, 79],
            'darkturquoise': [0, 206, 209],
            'darkviolet': [148, 0, 211],
            'deeppink': [255, 20, 147],
            'deepskyblue': [0, 191, 255],
            'dimgray': [105, 105, 105],
            'dimgrey': [105, 105, 105],
            'dodgerblue': [30, 144, 255],
            'firebrick': [178, 34, 34],
            'floralwhite': [255, 250, 240],
            'forestgreen': [34, 139, 34],
            'fuchsia': [255, 0, 255],
            'gainsboro': [220, 220, 220],
            'ghostwhite': [248, 248, 255],
            'gold': [255, 215, 0],
            'goldenrod': [218, 165, 32],
            'Gray': [128, 128, 128],
            'Green': [0, 128, 0],
            'greenyellow': [173, 255, 47],
            'Grey': [128, 128, 128],
            'honeydew': [240, 255, 240],
            'hotpink': [255, 105, 180],
            'indianred': [205, 92, 92],
            'indigo': [75, 0, 130],
            'ivory': [255, 255, 240],
            'khaki': [240, 230, 140],
            'lavender': [230, 230, 250],
            'lavenderblush': [255, 240, 245],
            'lawngreen': [124, 252, 0],
            'lemonchiffon': [255, 250, 205],
            'lightblue': [173, 216, 230],
            'lightcoral': [240, 128, 128],
            'lightcyan': [224, 255, 255],
            'lightgoldenrodyellow': [250, 250, 210],
            'lightgray': [211, 211, 211],
            'lightgreen': [144, 238, 144],
            'lightgrey': [211, 211, 211],
            'lightpink': [255, 182, 193],
            'lightsalmon': [255, 160, 122],
            'lightseagreen': [32, 178, 170],
            'lightskyblue': [135, 206, 250],
            'lightslategray': [119, 136, 153],
            'lightslategrey': [119, 136, 153],
            'lightsteelblue': [176, 196, 222],
            'lightyellow': [255, 255, 224],
            'lime': [0, 255, 0],
            'limegreen': [50, 205, 50],
            'linen': [250, 240, 230],
            'magenta': [255, 0, 255],
            'maroon': [128, 0, 0],
            'mediumaquamarine': [102, 205, 170],
            'mediumblue': [0, 0, 205],
            'mediumorchid': [186, 85, 211],
            'mediumpurple': [147, 112, 219],
            'mediumseagreen': [60, 179, 113],
            'mediumslateblue': [123, 104, 238],
            'mediumspringgreen': [0, 250, 154],
            'mediumturquoise': [72, 209, 204],
            'mediumvioletred': [199, 21, 133],
            'midnightblue': [25, 25, 112],
            'mintcream': [245, 255, 250],
            'mistyrose': [255, 228, 225],
            'moccasin': [255, 228, 181],
            'navajowhite': [255, 222, 173],
            'navy': [0, 0, 128],
            'oldlace': [253, 245, 230],
            'olive': [128, 128, 0],
            'olivedrab': [107, 142, 35],
            'orange': [255, 165, 0],
            'orangered': [255, 69, 0],
            'orchid': [218, 112, 214],
            'palegoldenrod': [238, 232, 170],
            'palegreen': [152, 251, 152],
            'paleturquoise': [175, 238, 238],
            'palevioletred': [219, 112, 147],
            'papayawhip': [255, 239, 213],
            'peachpuff': [255, 218, 185],
            'Brown': [205, 133, 63],
            'Pink': [255, 192, 203],
            'plum': [221, 160, 221],
            'Powder blue': [176, 224, 230],
            'purple': [128, 0, 128],
            'rebeccapurple': [102, 51, 153],
            'red': [255, 0, 0],
            'Red': [255, 99, 71], //Tomato
            'rosybrown': [188, 143, 143],
            'royalblue': [65, 105, 225],
            'saddlebrown': [139, 69, 19],
            'salmon': [250, 128, 114],
            'sandybrown': [244, 164, 96],
            'seagreen': [46, 139, 87],
            'seashell': [255, 245, 238],
            'sienna': [160, 82, 45],
            'Silver': [192, 192, 192],
            'skyblue': [135, 206, 235],
            'Slate blue': [106, 90, 205],
            'slategray': [112, 128, 144],
            'slategrey': [112, 128, 144],
            'snow': [255, 250, 250],
            'springgreen': [0, 255, 127],
            'Steel blue': [70, 130, 180],
            'tan': [210, 180, 140],
            'teal': [0, 128, 128],
            'thistle': [216, 191, 216],
            'turquoise': [64, 224, 208],
            'violet': [238, 130, 238],
            'wheat': [245, 222, 179],
            'White': [255, 255, 255],
            'whitesmoke': [245, 245, 245],
            'Yellow': [255, 255, 0],
            'yellowgreen': [154, 205, 50]
        }
        
        /** 
         * A description.
         * @type {object}
         */
        this.materialProperties = {
            paper: {
                roughness: 0.5,
                metalness: 0.0,
                reflectivity: 0.5
            },
            wood: {
                roughness: 0.5,
                metalness: 0.0,
                reflectivity: 0.5
            },
            metal: {
                roughness: 0.5,
                metalness: 0.5,
                reflectivity: 0.9,
                clearCoat: 1,
                clearCoatRoughness: 0
            },
            glass: {
                roughness: 0.5,
                metalness: 0.5,
                reflectivity: 0.9,
                clearCoat: 1,
                clearCoatRoughness: 0,
                opacity: 0.5,
                transparent: true
            },
            keepout: {
                roughness: 0.5,
                metalness: 0.0,
                reflectivity: 0.0,
                opacity: 0.2,
                transparent: true
            }
        }
        
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
        this.scene.background = new THREE.Color(0xE5E4E5)
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
        this.renderer.inputGamma = true
        this.renderer.outputGamma = true
        this.targetDiv.appendChild(this.renderer.domElement)
        
        this.onWindowResize()

        this.targetDiv.addEventListener('mousedown', () => {
            let viewerBar = document.querySelector('#viewer_bar')

            if(!GlobalVariables.runMode && viewerBar.innerHTML.trim().length == 0){

                //viewerBar.removeChild(viewerBar.firstChild)
                //Set viewer bar to only appear when other elements are created
                viewerBar.setAttribute('style', 'background-color:white;')
                
                //Grid display html element
                var gridDiv = document.createElement('div')
                viewerBar.appendChild(gridDiv)
                gridDiv.setAttribute('id', 'gridDiv')
                var gridCheck = document.createElement('input')
                gridDiv.appendChild(gridCheck)
                gridCheck.setAttribute('type', 'checkbox')
                gridCheck.setAttribute('id', 'gridCheck')
                gridDiv.setAttribute('style', 'float:right;')
               
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
                viewerBar.appendChild(axesDiv)
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
                axesDiv.setAttribute('style', 'float:right;')
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
                viewerBar.appendChild(wireDiv)
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
                //wireCheckLabel.setAttribute('style', 'margin-right:10em;')
                wireDiv.setAttribute('style', 'float:right;')
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
                this.gridScale = Math.pow(5,this.baseLog(this.dist3D(this.camera.position),5))
                this.resizeGrid()
            }
            else if((this.dist3D(this.camera.position)/this.gridScale) < .5){ 
                //this.scene.remove(this.plane)
                this.gridScale = Math.pow(5,this.baseLog(this.dist3D(this.camera.position),5))
                this.resizeGrid()
            }    
        })
    }
    
    /**
     * This function is intended to calculate the base log of two numbers and round it to an integer
     * @param {number,number}
     */ 
    baseLog(x,y){
        let baseLog = (Math.round(Math.log(x)/Math.log(y)))
        return baseLog
    }

    /**
     * This function is intended to calculate the 3d distance between object and camera
     * @param {number}
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
        this.gridScale = Math.pow(5, this.baseLog(this.dist3D(this.camera.position),5))    
        // Creates initial grid plane
        this.resizeGrid()
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
        /** 
         * The grid which displays under the part.
         * @type {object}
         */
        this.plane = new THREE.Mesh( planeGeometry, planeMaterial )
        this.plane.receiveShadow = true
        this.scene.add( this.plane )   
    }
    
    /**
     * Converts the tag to an RGB value.
     */ 
    toRgb(tags = [], defaultRgb = [0, 0, 0]){
        let rgb = defaultRgb
        for (const tag of tags) {
            if (tag.startsWith('color/')) {
                let entry = this.colorToRgbMapping[tag.substring(6)]
                if (entry !== undefined) {
                    rgb = entry
                }
            }
        }
        return rgb
    }
    
    /**
     * Sets the the color of the threejs mesh.
     */ 
    setColor(tags = [], parameters = {}, otherwise = [0, 0, 0]){
        let rgb = this.toRgb(tags, null)
        if (rgb === null) {
            rgb = otherwise
        }
        if (rgb === null) {
            return
        }
        const [r, g, b] = rgb
        const color = ((1 << 24) + (r << 16) + (g << 8) + b)
        parameters.color = color
        return parameters
    }
    
    /**
     * Merges two objects.
     */ 
    merge(properties, parameters){
        for (const key of Object.keys(properties)) {
            parameters[key] = properties[key]
        }
    }
    
    /**
     * Sets the material properties of the threejs material.
     */ 
    setMaterial(tags, parameters){
        for (const tag of tags) {
            if (tag.startsWith('material/')) {
                const material = tag.substring(9)
                const properties = this.materialProperties[material]
                if (properties !== undefined) {
                    this.merge(properties, parameters)
                }
            }
        }
    }
    
    /**
     * Constructs a new threejs mesh material based on the properties in the tags.
     */ 
    buildMeshMaterial(tags){
        if (tags !== undefined) {
            const parameters = {}
            this.setColor(tags, parameters, null)
            this.setMaterial(tags, parameters)
            if (Object.keys(parameters).length > 0) {
                return new THREE.MeshPhysicalMaterial(parameters)
            }
        }

        // Else, default to normal material.
        return this.threeMaterial
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

        const walk = (geometry) => {
            const { tags } = geometry
            if (geometry.assembly) {
                geometry.assembly.forEach(walk)
            } else if (geometry.item) {
                walk(geometry.item)
            } else if (geometry.threejsSegments) {
                const segments = geometry.threejsSegments
                const dataset = {}
                const threejsGeometry = new THREE.Geometry()
                for (const [[aX, aY, aZ], [bX, bY, bZ]] of segments) {
                    threejsGeometry.vertices.push(new THREE.Vector3(aX, aY, aZ), new THREE.Vector3(bX, bY, bZ))
                }
                dataset.mesh = new THREE.LineSegments(threejsGeometry, this.buildMeshMaterial(tags))
                this.scene.add(dataset.mesh)
                this.datasets.push(dataset)
            } else if (geometry.threejsSolid) {
                const { positions, normals } = geometry.threejsSolid
                const dataset = {}
                const threejsGeometry = new THREE.BufferGeometry()
                threejsGeometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
                threejsGeometry.addAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
                dataset.mesh = new THREE.Mesh(threejsGeometry, this.buildMeshMaterial(tags))
                this.scene.add(dataset.mesh)
                this.datasets.push(dataset)
            } else if (geometry.threejsSurface) {
                const { positions, normals } = geometry.threejsSurface
                const dataset = {}
                const threejsGeometry = new THREE.BufferGeometry()
                threejsGeometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
                threejsGeometry.addAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
                dataset.mesh = new THREE.Mesh(threejsGeometry, this.buildMeshMaterial(tags))
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