import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the output atom. The goal is that the output atom is fully transparent to the molecule which contains it
 */
export default class Output extends Atom {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super (values)
        
        //Add a new output to the current molecule
        if (typeof this.parent !== 'undefined') {
            this.parent.addIO('output', 'Geometry', this.parent, 'geometry', this.parent.path)
        }
        
        /**
         * This atom's type...not used?
         * @type {string}
         */
        this.type = 'output'
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Output'
        /**
         * This atom's value
         * @type {object}
         */
        this.value = null
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Output'
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
         * This atom's path
         * @type {string}
         */
        this.path = "" //Not sure why documentation made me put this hear instead of pulling it from atom
        /** 
         * A description of this atom
         * @type {string}
         */
        this.description = "Connect geometry here to make it available in the next level up. "
        
        this.setValues(values)
        
        this.addIO('input', 'number or geometry', this, 'geometry', undefined)
    }
    
    /**
     * Take the input value of this function and pass it to the parent Molecule to go up one level.
     */ 
    updateValue(){
        if(this.inputs.every(x => x.ready)){
            this.decreaseToProcessCountByOne()
            
            this.path = this.findIOValue('number or geometry')
            
            this.parent.propagate()  //Propagate passes the updated value on while parent.updateValue is called when one of the molecule inputs changes
        }
    }
    
    /**
     * Sets the parent molecule output to wait on coming information
     */ 
    waitOnComingInformation(){
        this.parent.output.waitOnComingInformation()
    }
    
    /**
     * Sets all the input and output values to match their associated atoms. In this case it sets the path of this and it's parent to be correct.
     */ 
    loadTree(){
        this.path = this.inputs[0].loadTree()
        this.value = this.path
        return this.path
    }
    
    /**
     * Override super delete function to prevent output from being deleted
     */ 
    deleteNode(){
        
    }
    
    /**
     * A function to allow you to still call the delete function if needed.
     */
    deleteOutputAtom(deletePath = true){
        super.deleteNode(false, deletePath)
    }
    
    /**
     * Draw the output shape on the screen.
     */ 
    draw() {

        const xInPixels = GlobalVariables.widthToPixels(this.x)
        const yInPixels = GlobalVariables.heightToPixels(this.y)
        const radiusInPixels = GlobalVariables.widthToPixels(this.radius)

        this.height= radiusInPixels

        //Set colors
        if(this.processing){
            GlobalVariables.c.fillStyle = 'blue'
        }
        else if(this.selected){
            
            GlobalVariables.c.fillStyle = this.selectedColor
            GlobalVariables.c.strokeStyle = this.defaultColor
            /**
             * This background color
             * @type {string}
             */
            this.color = this.selectedColor
            /**
             * This atoms accent color
             * @type {string}
             */
            this.strokeColor = this.defaultColor
        }
        else{
            GlobalVariables.c.fillStyle = this.defaultColor
            GlobalVariables.c.strokeStyle = this.selectedColor
            this.color = this.defaultColor
            this.strokeColor = this.selectedColor
        }
        
        this.inputs.forEach(child => {
            child.draw()       
        })

        GlobalVariables.c.beginPath()
        GlobalVariables.c.textAlign = 'start'
        GlobalVariables.c.fillText(this.name, xInPixels - radiusInPixels, yInPixels - radiusInPixels*1.5)
        GlobalVariables.c.moveTo(xInPixels + radiusInPixels - radiusInPixels*2, yInPixels - this.height)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels -5, yInPixels)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels - radiusInPixels*2, yInPixels + this.height)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels - radiusInPixels*2, yInPixels - this.height)
        GlobalVariables.c.fillStyle = this.color
        GlobalVariables.c.fill()
        GlobalVariables.c.lineWidth = 1
        GlobalVariables.c.lineJoin = "round"
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()
    }
}