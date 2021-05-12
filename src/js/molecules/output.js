import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the output atom.
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
            this.parent.addIO('output', 'Geometry', this.parent, 'geometry', '')
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
         * A flag to indicate if this molecule was waiting propagation. If it is it will take place
         *the next time we go up one level.
         * @type {number}
         */
        this.awaitingPropagationFlag = false
        
        this.setValues(values)
        
        this.addIO('input', 'number or geometry', this, 'geometry', undefined)
    }
    
    /**
     * Take the input value of this function and pass it to the parent Molecule to go up one level.
     */ 
    updateValue(){
        if(this.inputs.every(x => x.ready)){
            this.decreaseToProcessCountByOne()
            this.decreaseToProcessCountByOne()//Called twice to count for the molecule it is in
            
            this.path = this.findIOValue('number or geometry')
            this.parent.path = this.path
            
            //If this molecule is the top level or if it is not open, propagate up. Basically prevents propagation for opened molecules
            if(this.parent.topLevel || this.parent != GlobalVariables.currentMolecule){
                this.parent.propogate()
            }
            else{
                this.awaitingPropagationFlag = true
            }
            
            //Update the display when the value changes if the parent is selected
            if(this.parent.selected){
                this.parent.sendToRender()
            }
        }
    }
    
    /**
     * Sets all the input and output values to match their associated atoms.
     */ 
    loadTree(){
        this.path = this.inputs[0].loadTree()
        this.parent.path = this.path
        this.parent.output.value = this.path
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
    deleteOutputAtom(){
        super.deleteNode(false)
    }
    
    /**
     * I am not sure why this function is needed. Did I decide that it was a bad idea to pass the id directly? Should be looked into, can probably be simplified.
     */ 
    setID(newID){
        /**
         * The unique ID of this atom.
         * @type {number}
         */ 
        this.uniqueID = newID
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