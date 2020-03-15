import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the output atom.
 */
export default class Box extends Atom {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super (values)
        
        /**
         * This atom's type
         * @type {string}
         */
        this.type = 'box'
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Box'
        /**
         * This atom's value
         * @type {object}
         */
        this.value = null
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Box'
        /**
         * This atom's height
         * @type {number}
         */
        this.height = 16
        /**
         * This atom's radius
         * @type {number}
         */
        this.radius = 1/75

        /**
         * Mouse x position when moving
         * @type {number}
         */
        this.endX
        /**
         * Mouse y position when moving
         * @type {number}
         */
        this.endY
        
        /**
         * Value to save for start position of box
         * @type {number}
         */
        this.startX
        /**
         * Value to save for start position of box
         * @type {number}
         */
        this.startY

        this.setValues(values)
        
    }
    
    /**
     * Draw the select box shape on the screen.
     */ 
    draw() {

        const xInPixels = GlobalVariables.widthToPixels(this.x)
        const yInPixels = GlobalVariables.heightToPixels(this.y)
       
        if(GlobalVariables.ctrlDown){

            GlobalVariables.c.beginPath()
            GlobalVariables.c.fillStyle = '#80808080'
            GlobalVariables.c.rect(
                xInPixels, 
                yInPixels, 
                this.endX - xInPixels, 
                this.endY - yInPixels)
            GlobalVariables.c.fill()
            GlobalVariables.c.closePath()
        }
        
    }

    /**
     * When mouse moves and Ctrl is down updates value for box width and height
     */ 
    clickMove(x,y){
        if(GlobalVariables.ctrlDown){
        /**
         * Sets new box end to click target
         * @type {number}
         */ 
            this.endX = x
        /**
         * Sets new box end to click target
         * @type {number}
         */
            this.endY= y
        }
    }
    /**
     * Clears the drawing of box when clickUp and updates values for atom selection
     */ 
    clickUp(x,y){  
        const xInPixels = GlobalVariables.widthToPixels(this.x)
        const yInPixels = GlobalVariables.heightToPixels(this.y)
        /**
         * Sets start value to molecule position
         * @type {number}
         */
        this.startX = xInPixels
        /**
         * Sets end value to molecule position
         * @type {number}
         */
        this.startY = yInPixels
        
        this.deleteNode()
        this.parent.nodesOnTheScreen.forEach(atom => {
            atom.selectBox(this.startX, this.startY, x, y)
        })
    }

}

    