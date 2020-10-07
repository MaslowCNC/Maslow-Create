import GlobalVariables from './globalvariables'

// const workerpool = require('workerpool');
// create a worker pool using an external worker script
// const pool = workerpool.pool('./JSCADworker.js');
const jsonDeSerializer = require('@jscad/json-deserializer')
const jsonSerializer = require('@jscad/json-serializer')

const { colorize } = require('@jscad/modeling').colors
const { cube, cuboid, circle, line, sphere, star } = require('@jscad/modeling').primitives
const { intersect, subtract , union} = require('@jscad/modeling').booleans


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
        
        this.solids= entitiesFromSolids({}, [circle({radius:10})])
         
        //Add the JSXCAD window
        
        /** 
         * The camera which controls how the scene is rendered.
         * @type {object}
         */

        this.state = {}

        this.perspectiveCamera = cameras.perspective
        this.state.camera = Object.assign({}, this.perspectiveCamera.defaults)
        
        this.state.camera.position = [300,300,300]
        
        this.width = window.innerWidth
        this.height = window.innerHeight

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
                        show: true,
                        color: [0, 0, 0, 1],
                        subColor: [0, 0, 1, 0.5],
                        fadeOut: false,
                        transparent: true
                    },
                    size: [500, 500],
                    ticks: [10, 1]
                },
                {
                    visuals: {
                        drawCmd: 'drawAxis',
                        show: true
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
        // state.controls =  controls.orbit.defaults
        this.state.controls = Object.assign({}, this.controls.defaults)
        
        //Bind events to mouse input
        
        document.getElementById('viewerContext').addEventListener('mousedown', event => {
            this.panning = true
        })
        
        window.addEventListener('mouseup', event => {
            this.panning = false
        })
        
        document.getElementById('viewerContext').addEventListener('mousemove', event => {
            
            //If the mouse has been clicked down do pan
            if(this.panning){
                var x = this.state.camera.position[0]
                var y = this.state.camera.position[1]
                var z = this.state.camera.position[2]
                
                //Convert to spherical cordinates 
                var rho = Math.sqrt((x*x) + (y*y) + (z*z))
                
                
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
        // this.renderer.setPixelRatio(window.devicePixelRatio)
       
        //this.targetDiv.appendChild(this.renderer.domElement)
        
    }

    init(){
        let shape = colorize([1, 0, 0, 0.75], circle({radius:10}))
        
        this.displayedGeometry = shape
        

    }

    update(){
        
        const updates = controls.orbit.update({ controls:this.state.controls, camera:this.state.camera })
        this.state.controls = { ...this.state.controls, ...updates.controls }
        this.state.camera.position = updates.camera.position
        this.perspectiveCamera.update(this.state.camera)
        
        this.renderer(this.options)
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
        console.log("Shape: ")
        console.log(shape)
        if(shape != null){
            this.displayedGeometry = shape.map(x => jsonDeSerializer.deserialize({output: 'geometry'}, x.geometry))
            const unionized = union(this.displayedGeometry)  //Union to compress it all into one
            this.solids = entitiesFromSolids({}, unionized)  //This should be able to handle an array but right now it can't
            this.perspectiveCamera.setProjection(this.state.camera, this.state.camera, { width:this.width, height:this.height })
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
                            show: true,
                            color: [0, 0, 0, 1],
                            subColor: [0, 0, 0, 0.5],
                            fadeOut: false,
                            transparent: true
                        },
                        size: [500, 500],
                        ticks: [10, 1]
                    },
                    {
                        visuals: {
                            drawCmd: 'drawAxis',
                            show: true
                        }
                    },
                    ...this.solids
                ]
            }
            this.renderer(this.options)
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