import GlobalVariables from './globalvariables'

const workerpool = require('workerpool');
// create a worker pool using an external worker script
const pool = workerpool.pool('./JSCADworker.js');
const jsonDeSerializer = require('@jscad/json-deserializer')
const jsonSerializer = require('@jscad/json-serializer')

const { colorize } = require('@jscad/modeling').colors
  const { cube, cuboid, circle, line, sphere, star } = require('@jscad/modeling').primitives
  const { intersect, subtract } = require('@jscad/modeling').booleans


const { prepareRender, drawCommands, cameras, entitiesFromSolids } = require('@jscad/utils/regl-renderer') 
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
       this.perspectiveCamera = cameras.perspective
       this.camera = Object.assign({}, this.perspectiveCamera.defaults)
        
        //[this.camera.position.x, this.camera.position.y, this.camera.position.z] = [0, -30, 50]
        //
        this.width = window.innerWidth
        this.height = window.innerHeight

       this.options = {
              glOptions: { container: this.targetDiv },
              camera: this.camera,
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

        //
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
        console.log(shape)
        this.displayedGeometry = shape
        

    }

    /**
     * Writes a shape to the 3D display. Expecting a threejs geometry.
     * @param {object} shape - A jsxcad geometry data set to write to the display. Computation is done in a worker thread
     */ 
    writeToDisplay(shape){
        this.displayedGeometry = shape
        this.solids= entitiesFromSolids({}, colorize([1, 0, 0, 0.75], this.displayedGeometry))      
        this.perspectiveCamera.setProjection(this.camera, this.camera, { width:this.width, height:this.height })
        this.perspectiveCamera.update(this.camera, this.camera)
        
        this.options = {
              glOptions: { container: this.targetDiv },
              camera: this.camera,
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
        this.renderer(this.options)
        }
    
  
    /**
     * Writes a shape to the 3D display. Expecting a threejs geometry.
     * @param {object} shape - A jsxcad geometry data set to write to the display. Computation is done in a worker thread
     */ 
    rendering(){
        this.renderer(this.options)

    }
}