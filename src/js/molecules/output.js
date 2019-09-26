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
         * This atom's type
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
        this.radius = 20
        
        this.setValues(values)
        
        this.addIO('input', 'number or geometry', this, 'geometry', null)
    }
    
    /**
     * Take the input value of this function and pass it to the parent Molecule to go up one level.
     */ 
    updateValue(){
        if(!GlobalVariables.evalLock && this.inputs.every(x => x.ready)){
            this.value = this.findIOValue('number or geometry')
            this.parent.value = this.value
            this.parent.propogate()
            this.parent.processing = false
            
            super.updateValue()
        }
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

        this.height= this.radius
        
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
        GlobalVariables.c.textAlign = 'end' 
        GlobalVariables.c.strokeStyle = this.parentMolecule.strokeColor
        GlobalVariables.c.fillText(this.name, this.x + this.radius, this.y-this.radius)
        GlobalVariables.c.moveTo(this.x - this.radius, this.y - this.height/2)
        GlobalVariables.c.lineTo(this.x - this.radius + 2*this.radius, this.y - this.height/2)
        GlobalVariables.c.lineTo(this.x + this.radius + 10, this.y)
        GlobalVariables.c.lineTo(this.x + this.radius, this.y + this.height/2)
        GlobalVariables.c.lineTo(this.x - this.radius, this.y + this.height/2)
        GlobalVariables.c.fillStyle = this.color
        GlobalVariables.c.lineWidth = 1
        GlobalVariables.c.closePath()
        //GlobalVariables.c.fill()
        //GlobalVariables.c.stroke()
       
        GlobalVariables.c.beginPath()
        GlobalVariables.c.moveTo(this.x + this.radius - this.radius*2, this.y - this.height)
        GlobalVariables.c.lineTo(this.x + this.radius -5, this.y)
        GlobalVariables.c.lineTo(this.x + this.radius - this.radius*2, this.y + this.height)
        GlobalVariables.c.lineTo(this.x + this.radius - this.radius*2, this.y - this.height)
        GlobalVariables.c.strokeStyle = this.parentMolecule.strokeColor
        GlobalVariables.c.fillStyle = this.color
        GlobalVariables.c.fill()
        GlobalVariables.c.lineWidth = 1
        GlobalVariables.c.lineJoin = "round"
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()
    }
}