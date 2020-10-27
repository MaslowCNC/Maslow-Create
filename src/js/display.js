const { colorize } = require('@jscad/modeling').colors
const { circle } = require('@jscad/modeling').primitives

import GlobalVariables from './globalvariables'

const { prepareRender, drawCommands, cameras, entitiesFromSolids, controls } = require('@jscad/regl-renderer') 


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
         *The last shape that was sent to the display. Used for switching to wireframe.
         */
        this.displayedGeometry = []
        /** 
         * An Flag to indicate if the grid on the XY plane should be displayed.
         * @type {boolean}
         */
        this.displayGrid = true
        /** 
         * Grid scale to keep track of zoom scale
         * @type {number}
         */
        this.gridScale = 1
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
         * A flag to indicate if the solid should be displayed.
         * @type {boolean}
         */
        this.solidDisplay = true
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
         * A flag to indicate if the mouse has clicked down in the aproprate to initiate a pan.
         * @type {boolean}
         */
        this.panning = false
        /** 
         * A threejs scene instance.
         * @type {object}
         */
        this.scene
        /** 
         * A threejs renderer instance.
         * @type {object}
         */
        this.render
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
         * Initial geometry passed to the renderer (Won't render without an initial solid)
         * @type {object}
         */
        this.solids= entitiesFromSolids({}, [colorize([1,1,1,0],circle({radius:1}))])
         
        //Add the JSXCAD window
        
        /** 
         * The camera which controls how the scene is rendered.
         * @type {object}
         */
        this.state = {}
        /** 
         * Set perspective camera
         * @type {object}
         */
        this.perspectiveCamera = cameras.perspective
        /** 
         * Assign camera defaults to camera? 
         * @type {object}
         */
        this.state.camera = Object.assign({}, this.perspectiveCamera.defaults)
        /** 
         * Assign default camera position
         * @type {array(x,y,z)}
         */
        this.state.camera.position = [300,300,300]
        
        /** 
         * The browser window width
         * @type {number}
         */
        this.width = window.innerWidth
        /** 
         * The browser window height
         * @type {number}
         */
        this.height = window.innerHeight

        /** 
         * The x size of the grid to be rendered
         * @type {number}
         */
        this.gridSizeX = 300
        /** 
         * The y size of the grid to be rendered
         * @type {number}
         */
        this.gridSizeY = 300
        /** 
         * Flag for grid visibility
         * @type {boolean}
         */
        this.showGrid = true
        /** 
         * Flag for axes visibility
         * @type {boolean}
         */
        this.axesCheck = true
        /** 
         * Initial options for rendered
         * @type {object}
         */
        this.options = {
            glOptions: { container: this.targetDiv },
            camera: this.state.camera,
            drawCommands: {
                // draw commands bootstrap themselves the first time they are run
                drawGrid: drawCommands.drawGrid, // require('./src/rendering/drawGrid/index.js'),
                drawAxis: drawCommands.drawAxis, // require('./src/rendering/drawAxis'),
                drawMesh: drawCommands.drawMesh // require('./src/rendering/drawMesh/index.js')
            },
            // data
            entities: [
                { // grid data
                    // the choice of what draw command to use is also data based
                    visuals: {
                        drawCmd: 'drawGrid',
                        show: this.showGrid,
                        color: [0, 0, 0, 0.5],
                        subColor: [0, 0, 0, 0.5],
                        fadeOut: false,
                        transparent: true
                    },
                    size: [this.gridSizeX, this.gridSizeY],
                    ticks: [10, 1]
                },
                {
                    visuals: {
                        drawCmd: 'drawAxis',
                        show: this.axesCheck
                    }
                },
                ...this.solids
            ]
        }

        /** 
         * The controls which let the user pan and zoom with the mouse.
         * @type {object}
         */
        this.controls = controls.orbit
        /** 
         * Assigns defaults to controls??
         * @type {object}
         */
        this.state.controls = Object.assign({}, this.controls.defaults)
        
        //Bind events to mouse input
        document.getElementById('viewerContext').addEventListener('mousedown', () => {
            this.panning = true
        })
        
        window.addEventListener('mouseup', () => {
            this.panning = false
        })
        
        document.getElementById('viewerContext').addEventListener('mousemove', event => {
            
            //If the mouse has been clicked down do pan
            if(this.panning){
                this.sphericalMoveCamera(0, -.01*event.movementX, -.01*event.movementY)
            }
        })
            
            
        document.getElementById('viewerContext').addEventListener('wheel', event => {
           
            this.sphericalMoveCamera(event.deltaY*5, 0, 0)
           
        })
        
        /** 
         * The three js webGLRendere object which does the actual rendering to the screen.
         * @type {object}
         */
        this.renderer = prepareRender(this.options)
         
        //this.targetDiv.appendChild(this.renderer.domElement)
        let viewerBar = document.querySelector('#viewer_bar')
        let arrowUpMenu = document.querySelector('#arrow-up-menu')

        this.targetDiv.addEventListener('mouseenter', () => {
            if(viewerBar.innerHTML.trim().length == 0){
                this.checkBoxes()   
            }
        })

        this.onWindowResize()

        var evtFired = false
        var g_timer

        function startTimer(){
            g_timer = setTimeout(function() {
                if (!evtFired) {
                    viewerBar.classList.remove("slideup")
                    viewerBar.classList.add('slidedown')  
                }
            }, 2000)
        }

        arrowUpMenu.addEventListener('mouseenter', () =>{
            clearTimeout(g_timer)
            viewerBar.classList.remove("slidedown")
            viewerBar.classList.add('slideup')   
        })
        viewerBar.addEventListener('mouseleave', () =>{
            evtFired = false
            viewerBar.classList.remove("slideup")
            viewerBar.classList.add('slidedown')   
        })
        viewerBar.addEventListener('mouseenter', () =>{
            evtFired = true
            viewerBar.classList.remove("slidedown")
            viewerBar.classList.add('slideup')   
        })
        arrowUpMenu.addEventListener('mouseleave', () =>{
            startTimer()
        })

    }

    /**
     * Creates the checkbox hidden menu when viewer is active
     */ 
    checkBoxes(){
        let viewerBar = document.querySelector('#viewer_bar')   
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
                this.showGrid = true
                this.writeToDisplay(this.displayedGeometry)

            }
            else{
                this.showGrid = false
                this.writeToDisplay(this.displayedGeometry)
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
                this.axesCheck = true

                this.writeToDisplay(this.displayedGeometry)
            }
            else{
                this.axesCheck = false
                this.writeToDisplay(this.displayedGeometry)
            }
        })
        /*
        //Solid HTML element

        var solidDiv = document.createElement('div')
        viewerBar.appendChild(solidDiv)
        solidDiv.setAttribute('id', 'solidDiv')
        var solidCheck = document.createElement('input')
        solidDiv.appendChild(solidCheck)
        solidCheck.setAttribute('type', 'checkbox')
        solidCheck.setAttribute('id', 'solidCheck')
               
        if (this.solidDisplay){
            solidCheck.setAttribute('checked', 'true')
            this.threeMaterial.solid = true
        }
        //solidCheck.setAttribute('checked', false)
        var solidCheckLabel = document.createElement('label')
        solidDiv.appendChild(solidCheckLabel)
        solidCheckLabel.setAttribute('for', 'solidCheck')
        //solidCheckLabel.setAttribute('style', 'margin-right:10em;')
        solidDiv.setAttribute('style', 'float:right;')
        solidCheckLabel.textContent= "Solid"
        solidCheckLabel.setAttribute('style', 'user-select: none;')

        solidCheck.addEventListener('change', event => {
            if( event.target.checked){
                this.solidDisplay = true
            }
            else{
                this.solidDisplay = false
            }
            this.writeToDisplay(this.displayedGeometry)
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
                this.wireDisplay = true
            }
            else{
                this.wireDisplay = false
            }
            this.writeToDisplay(this.displayedGeometry)
        })*/

    }

    /**
     * Updates the camera position
     */
    update(){
        
        const updates = controls.orbit.update({ controls:this.state.controls, camera:this.state.camera })
        this.state.controls = { ...this.state.controls, ...updates.controls }
        this.state.camera.position = updates.camera.position
        this.perspectiveCamera.update(this.state.camera)
        
        this.renderer(this.options)
    }

    /**
     * Handles resizing the 3D viewer when the window resizes.
     */ 
    onWindowResize() {
        this.perspectiveCamera.setProjection(this.state.camera, this.state.camera, { width:this.targetDiv.clientWidth, height:this.targetDiv.clientHeight})
        this.perspectiveCamera.update(this.state.camera, this.state.camera)
        this.update()
    }
    
    /**
     * Zooms the camera to fit target bounds on the screen.
     * @param {object} bounds -bounds from a solid
     */ 
    zoomCameraToFit(bounds){
        // reset camera position
        this.state.camera.position[0] = 0
        this.state.camera.position[1] = -2.5*Math.max(...bounds.size)
        this.state.camera.position[2] = 2.5*Math.max(...bounds.size)
        // re set grid to fit solid
        this.gridSizeX = 10*Math.max(...bounds.size)
        this.gridSizeY = 10*Math.max(...bounds.size)
        //update camera & render
        this.update()
    }
    
    /**
     * Moves the camera in a spherical cordinate system
     * @param {object} shape - A jsxcad geometry data set to write to the display. Computation is done in a worker thread
     */ 
    sphericalMoveCamera(deltaRho, deltaPhi, deltaTheta){
        //Initial positions
        var x = this.state.camera.position[0]
        var y = this.state.camera.position[1]
        var z = this.state.camera.position[2]
        
        //Convert to spherical cordinates 
        var rho = Math.sqrt((x*x) + (y*y) + (z*z))
        var phi = Math.atan2(y, x)
        var theta = Math.acos(z / rho)
        
        //Apply our transformation
        rho = rho + deltaRho
        phi = phi + deltaPhi
        theta = theta + deltaTheta
        
        //Restrict theta to valid values
        if(theta < 0){
            theta = 0.01
        }
        
        if(theta > 3.14){
            theta = 3.14
        }
        
        //Convert back to cartesian cordinates
        x = rho * Math.sin(theta) * Math.cos(phi)
        y = rho * Math.sin(theta) * Math.sin(phi)
        z = rho * Math.cos(theta)
        
        //Asssign the new camera positions
        this.state.camera.position[0] = x
        this.state.camera.position[1] = y
        this.state.camera.position[2] = z
    }
    
    /**
     * Writes a shape to the 3D display. .
     * @param {object} shape - A jscad geometry data set to write to the display. Computation is done in a worker thread
     */ 
    writeToDisplay(shape){
        if(shape != null){
            this.displayedGeometry = shape
            GlobalVariables.pool.exec("render", [shape])
                .then(solids => {

                    if(GlobalVariables.topLevelMolecule.selected){
                        this.zoomCameraToFit(solids[0].bounds)
                    }

                
                    this.perspectiveCamera.setProjection(this.state.camera, this.state.camera, { width:this.targetDiv.clientWidth, height:this.targetDiv.clientHeight })
                    this.perspectiveCamera.update(this.state.camera, this.state.camera)
                
                    this.options = {
                        glOptions: { container: this.targetDiv },
                        camera: this.state.camera,
                        drawCommands: {
                        // draw commands bootstrap themselves the first time they are run
                            drawGrid: drawCommands.drawGrid, // require('./src/rendering/drawGrid/index.js'),
                            drawAxis: drawCommands.drawAxis, // require('./src/rendering/drawAxis'),
                            drawMesh: drawCommands.drawMesh // require('./src/rendering/drawMesh/index.js')
                        },
                        // data
                        entities: [
                            { // grid data
                            // the choice of what draw command to use is also data based
                                visuals: {
                                    drawCmd: 'drawGrid',
                                    show: this.showGrid,
                                    color: [0, 0, 0, .8],
                                    subColor: [0, 0, 0, 0.1],
                                    fadeOut: false,
                                    transparent: true
                                },
                                size: [this.gridSizeX, this.gridSizeY],
                                ticks: [10, 1]
                            },
                            {
                                visuals: {
                                    drawCmd: 'drawAxis',
                                    show: this.axesCheck
                                }
                            },
                            ...solids
                        ]

                    }
                    
                    this.renderer(this.options)
                })
                .timeout(6000)  //timeout if the rendering takes more than six seconds
        }
    }
    
  
    /**
     * Writes a shape to the 3D display. Expecting a threejs geometry.
     * @param {object} shape - A jsxcad geometry data set to write to the display. Computation is done in a worker thread
     */ 
    rendering(){
        this.update()
    }
}