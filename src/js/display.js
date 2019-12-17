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
            'black': [ 0 / 255, 0 / 255, 0 / 255 ],
            'silver': [ 192 / 255, 192 / 255, 192 / 255 ],
            'gray': [ 128 / 255, 128 / 255, 128 / 255 ],
            'white': [ 255 / 255, 255 / 255, 255 / 255 ],
            'maroon': [ 128 / 255, 0 / 255, 0 / 255 ],
            'red': [ 255 / 255, 0 / 255, 0 / 255 ],
            'purple': [ 128 / 255, 0 / 255, 128 / 255 ],
            'fuchsia': [ 255 / 255, 0 / 255, 255 / 255 ],
            'green': [ 0 / 255, 128 / 255, 0 / 255 ],
            'lime': [ 0 / 255, 255 / 255, 0 / 255 ],
            'olive': [ 128 / 255, 128 / 255, 0 / 255 ],
            'yellow': [ 255 / 255, 255 / 255, 0 / 255 ],
            'navy': [ 0 / 255, 0 / 255, 128 / 255 ],
            'blue': [ 0 / 255, 0 / 255, 255 / 255 ],
            'teal': [ 0 / 255, 128 / 255, 128 / 255 ],
            'aqua': [ 0 / 255, 255 / 255, 255 / 255 ],
            // extended color keywords
            'aliceblue': [ 240 / 255, 248 / 255, 255 / 255 ],
            'antiquewhite': [ 250 / 255, 235 / 255, 215 / 255 ],
            // 'aqua': [ 0 / 255, 255 / 255, 255 / 255 ],
            'aquamarine': [ 127 / 255, 255 / 255, 212 / 255 ],
            'azure': [ 240 / 255, 255 / 255, 255 / 255 ],
            'beige': [ 245 / 255, 245 / 255, 220 / 255 ],
            'bisque': [ 255 / 255, 228 / 255, 196 / 255 ],
            // 'black': [ 0 / 255, 0 / 255, 0 / 255 ],
            'blanchedalmond': [ 255 / 255, 235 / 255, 205 / 255 ],
            // 'blue': [ 0 / 255, 0 / 255, 255 / 255 ],
            'blueviolet': [ 138 / 255, 43 / 255, 226 / 255 ],
            'brown': [ 165 / 255, 42 / 255, 42 / 255 ],
            'burlywood': [ 222 / 255, 184 / 255, 135 / 255 ],
            'cadetblue': [ 95 / 255, 158 / 255, 160 / 255 ],
            'chartreuse': [ 127 / 255, 255 / 255, 0 / 255 ],
            'chocolate': [ 210 / 255, 105 / 255, 30 / 255 ],
            'coral': [ 255 / 255, 127 / 255, 80 / 255 ],
            'cornflowerblue': [ 100 / 255, 149 / 255, 237 / 255 ],
            'cornsilk': [ 255 / 255, 248 / 255, 220 / 255 ],
            'crimson': [ 220 / 255, 20 / 255, 60 / 255 ],
            'cyan': [ 0 / 255, 255 / 255, 255 / 255 ],
            'darkblue': [ 0 / 255, 0 / 255, 139 / 255 ],
            'darkcyan': [ 0 / 255, 139 / 255, 139 / 255 ],
            'darkgoldenrod': [ 184 / 255, 134 / 255, 11 / 255 ],
            'darkgray': [ 169 / 255, 169 / 255, 169 / 255 ],
            'darkgreen': [ 0 / 255, 100 / 255, 0 / 255 ],
            'darkgrey': [ 169 / 255, 169 / 255, 169 / 255 ],
            'darkkhaki': [ 189 / 255, 183 / 255, 107 / 255 ],
            'darkmagenta': [ 139 / 255, 0 / 255, 139 / 255 ],
            'darkolivegreen': [ 85 / 255, 107 / 255, 47 / 255 ],
            'darkorange': [ 255 / 255, 140 / 255, 0 / 255 ],
            'darkorchid': [ 153 / 255, 50 / 255, 204 / 255 ],
            'darkred': [ 139 / 255, 0 / 255, 0 / 255 ],
            'darksalmon': [ 233 / 255, 150 / 255, 122 / 255 ],
            'darkseagreen': [ 143 / 255, 188 / 255, 143 / 255 ],
            'darkslateblue': [ 72 / 255, 61 / 255, 139 / 255 ],
            'darkslategray': [ 47 / 255, 79 / 255, 79 / 255 ],
            'darkslategrey': [ 47 / 255, 79 / 255, 79 / 255 ],
            'darkturquoise': [ 0 / 255, 206 / 255, 209 / 255 ],
            'darkviolet': [ 148 / 255, 0 / 255, 211 / 255 ],
            'deeppink': [ 255 / 255, 20 / 255, 147 / 255 ],
            'deepskyblue': [ 0 / 255, 191 / 255, 255 / 255 ],
            'dimgray': [ 105 / 255, 105 / 255, 105 / 255 ],
            'dimgrey': [ 105 / 255, 105 / 255, 105 / 255 ],
            'dodgerblue': [ 30 / 255, 144 / 255, 255 / 255 ],
            'firebrick': [ 178 / 255, 34 / 255, 34 / 255 ],
            'floralwhite': [ 255 / 255, 250 / 255, 240 / 255 ],
            'forestgreen': [ 34 / 255, 139 / 255, 34 / 255 ],
            // 'fuchsia': [ 255 / 255, 0 / 255, 255 / 255 ],
            'gainsboro': [ 220 / 255, 220 / 255, 220 / 255 ],
            'ghostwhite': [ 248 / 255, 248 / 255, 255 / 255 ],
            'gold': [ 255 / 255, 215 / 255, 0 / 255 ],
            'goldenrod': [ 218 / 255, 165 / 255, 32 / 255 ],
            // 'gray': [ 128 / 255, 128 / 255, 128 / 255 ],
            // 'green': [ 0 / 255, 128 / 255, 0 / 255 ],
            'greenyellow': [ 173 / 255, 255 / 255, 47 / 255 ],
            'grey': [ 128 / 255, 128 / 255, 128 / 255 ],
            'honeydew': [ 240 / 255, 255 / 255, 240 / 255 ],
            'hotpink': [ 255 / 255, 105 / 255, 180 / 255 ],
            'indianred': [ 205 / 255, 92 / 255, 92 / 255 ],
            'indigo': [ 75 / 255, 0 / 255, 130 / 255 ],
            'ivory': [ 255 / 255, 255 / 255, 240 / 255 ],
            'khaki': [ 240 / 255, 230 / 255, 140 / 255 ],
            'lavender': [ 230 / 255, 230 / 255, 250 / 255 ],
            'lavenderblush': [ 255 / 255, 240 / 255, 245 / 255 ],
            'lawngreen': [ 124 / 255, 252 / 255, 0 / 255 ],
            'lemonchiffon': [ 255 / 255, 250 / 255, 205 / 255 ],
            'lightblue': [ 173 / 255, 216 / 255, 230 / 255 ],
            'lightcoral': [ 240 / 255, 128 / 255, 128 / 255 ],
            'lightcyan': [ 224 / 255, 255 / 255, 255 / 255 ],
            'lightgoldenrodyellow': [ 250 / 255, 250 / 255, 210 / 255 ],
            'lightgray': [ 211 / 255, 211 / 255, 211 / 255 ],
            'lightgreen': [ 144 / 255, 238 / 255, 144 / 255 ],
            'lightgrey': [ 211 / 255, 211 / 255, 211 / 255 ],
            'lightpink': [ 255 / 255, 182 / 255, 193 / 255 ],
            'lightsalmon': [ 255 / 255, 160 / 255, 122 / 255 ],
            'lightseagreen': [ 32 / 255, 178 / 255, 170 / 255 ],
            'lightskyblue': [ 135 / 255, 206 / 255, 250 / 255 ],
            'lightslategray': [ 119 / 255, 136 / 255, 153 / 255 ],
            'lightslategrey': [ 119 / 255, 136 / 255, 153 / 255 ],
            'lightsteelblue': [ 176 / 255, 196 / 255, 222 / 255 ],
            'lightyellow': [ 255 / 255, 255 / 255, 224 / 255 ],
            // 'lime': [ 0 / 255, 255 / 255, 0 / 255 ],
            'limegreen': [ 50 / 255, 205 / 255, 50 / 255 ],
            'linen': [ 250 / 255, 240 / 255, 230 / 255 ],
            'magenta': [ 255 / 255, 0 / 255, 255 / 255 ],
            // 'maroon': [ 128 / 255, 0 / 255, 0 / 255 ],
            'mediumaquamarine': [ 102 / 255, 205 / 255, 170 / 255 ],
            'mediumblue': [ 0 / 255, 0 / 255, 205 / 255 ],
            'mediumorchid': [ 186 / 255, 85 / 255, 211 / 255 ],
            'mediumpurple': [ 147 / 255, 112 / 255, 219 / 255 ],
            'mediumseagreen': [ 60 / 255, 179 / 255, 113 / 255 ],
            'mediumslateblue': [ 123 / 255, 104 / 255, 238 / 255 ],
            'mediumspringgreen': [ 0 / 255, 250 / 255, 154 / 255 ],
            'mediumturquoise': [ 72 / 255, 209 / 255, 204 / 255 ],
            'mediumvioletred': [ 199 / 255, 21 / 255, 133 / 255 ],
            'midnightblue': [ 25 / 255, 25 / 255, 112 / 255 ],
            'mintcream': [ 245 / 255, 255 / 255, 250 / 255 ],
            'mistyrose': [ 255 / 255, 228 / 255, 225 / 255 ],
            'moccasin': [ 255 / 255, 228 / 255, 181 / 255 ],
            'navajowhite': [ 255 / 255, 222 / 255, 173 / 255 ],
            // 'navy': [ 0 / 255, 0 / 255, 128 / 255 ],
            'oldlace': [ 253 / 255, 245 / 255, 230 / 255 ],
            // 'olive': [ 128 / 255, 128 / 255, 0 / 255 ],
            'olivedrab': [ 107 / 255, 142 / 255, 35 / 255 ],
            'orange': [ 255 / 255, 165 / 255, 0 / 255 ],
            'orangered': [ 255 / 255, 69 / 255, 0 / 255 ],
            'orchid': [ 218 / 255, 112 / 255, 214 / 255 ],
            'palegoldenrod': [ 238 / 255, 232 / 255, 170 / 255 ],
            'palegreen': [ 152 / 255, 251 / 255, 152 / 255 ],
            'paleturquoise': [ 175 / 255, 238 / 255, 238 / 255 ],
            'palevioletred': [ 219 / 255, 112 / 255, 147 / 255 ],
            'papayawhip': [ 255 / 255, 239 / 255, 213 / 255 ],
            'peachpuff': [ 255 / 255, 218 / 255, 185 / 255 ],
            'peru': [ 205 / 255, 133 / 255, 63 / 255 ],
            'pink': [ 255 / 255, 192 / 255, 203 / 255 ],
            'plum': [ 221 / 255, 160 / 255, 221 / 255 ],
            'powderblue': [ 176 / 255, 224 / 255, 230 / 255 ],
            // 'purple': [ 128 / 255, 0 / 255, 128 / 255 ],
            // 'red': [ 255 / 255, 0 / 255, 0 / 255 ],
            'rosybrown': [ 188 / 255, 143 / 255, 143 / 255 ],
            'royalblue': [ 65 / 255, 105 / 255, 225 / 255 ],
            'saddlebrown': [ 139 / 255, 69 / 255, 19 / 255 ],
            'salmon': [ 250 / 255, 128 / 255, 114 / 255 ],
            'sandybrown': [ 244 / 255, 164 / 255, 96 / 255 ],
            'seagreen': [ 46 / 255, 139 / 255, 87 / 255 ],
            'seashell': [ 255 / 255, 245 / 255, 238 / 255 ],
            'sienna': [ 160 / 255, 82 / 255, 45 / 255 ],
            // 'silver': [ 192 / 255, 192 / 255, 192 / 255 ],
            'skyblue': [ 135 / 255, 206 / 255, 235 / 255 ],
            'slateblue': [ 106 / 255, 90 / 255, 205 / 255 ],
            'slategray': [ 112 / 255, 128 / 255, 144 / 255 ],
            'slategrey': [ 112 / 255, 128 / 255, 144 / 255 ],
            'snow': [ 255 / 255, 250 / 255, 250 / 255 ],
            'springgreen': [ 0 / 255, 255 / 255, 127 / 255 ],
            'steelblue': [ 70 / 255, 130 / 255, 180 / 255 ],
            'tan': [ 210 / 255, 180 / 255, 140 / 255 ],
            // 'teal': [ 0 / 255, 128 / 255, 128 / 255 ],
            'thistle': [ 216 / 255, 191 / 255, 216 / 255 ],
            'tomato': [ 255 / 255, 99 / 255, 71 / 255 ],
            'turquoise': [ 64 / 255, 224 / 255, 208 / 255 ],
            'violet': [ 238 / 255, 130 / 255, 238 / 255 ],
            'wheat': [ 245 / 255, 222 / 255, 179 / 255 ],
            // 'white': [ 255 / 255, 255 / 255, 255 / 255 ],
            'whitesmoke': [ 245 / 255, 245 / 255, 245 / 255 ],
            // 'yellow': [ 255 / 255, 255 / 255, 0 / 255 ],
            'yellowgreen': [ 154 / 255, 205 / 255, 50 / 255 ]
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
        this.scene.background = new THREE.Color(0xFFFFFF)
        this.scene.add(this.camera)
        //
        var ambientLight = new THREE.AmbientLight(0xc9c7c7)
        this.scene.add(ambientLight)
        // var light1 = new THREE.PointLight(0xffffff, 0, 1);
        // camera.add(light1);
        var light2 = new THREE.DirectionalLight(0xd9d9d9, 1)
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

         let viewerBar = document.querySelector('#viewer_bar')

        
        this.targetDiv.addEventListener('mousedown', () => {

            if(!GlobalVariables.runMode && viewerBar.innerHTML.trim().length == 0){
                this.checkBoxes()   
            }
        })

        viewerBar.addEventListener('mouseenter', () =>{
                viewerBar.classList.remove("slidedown")
                viewerBar.classList.add('slideup')   
                })
        viewerBar.addEventListener('mouseleave', () =>{
                viewerBar.classList.remove("slideup")
                viewerBar.classList.add('slidedown')   
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
    
    checkBoxes(){
        let viewerBar = document.querySelector('#viewer_bar')
         //viewerBar.removeChild(viewerBar.firstChild)
                //Set viewer bar to only appear when other elements are created
                viewerBar.classList.add('slidedown')
                

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
                gridCheckLabel.setAttribute('style', 'user-select: none;')


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
                axesCheckLabel.setAttribute('style', 'user-select: none;')

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
                wireCheckLabel.setAttribute('style', 'user-select: none;')

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
        
        const color = new THREE.Color( r, g, b ) // create a new color for conversion
        parameters.color = color.getHex()//color.getHexString(); // "c08000"
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
     * @param {object} threejsGeometry - A threejs geometry to write to the display. Generated from the worker thread.
     */ 
    updateDisplayData(threejsGeometry){
        // Delete any previous dataset in the window.
        for (const { mesh } of this.datasets) {
            this.scene.remove(mesh)
        }
        
        // Build new datasets from the written data, and display them.
        this.datasets = []

        //This walks through the geometry building a threejs geometry out of it
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