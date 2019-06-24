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
        
        this.value = null
        this.type = 'output'
        this.name = 'Output'
        this.atomType = 'Output'
        this.height = 16
        this.radius = 20
        
        this.setValues(values)
        
        this.addIO('input', 'number or geometry', this, 'geometry', '')
    }
    
    /**
     * Take the input value of this function and pass it to the parent Molecule to go up one level.
     */ 
    updateValue(){
        if(!GlobalVariables.evalLock && this.inputs.every(x => x.ready)){
            this.value = this.findIOValue('number or geometry')
            this.parent.value = this.value
            this.parent.propogate()
            
            super.updateValue()
        }
    }
    
    /**
     * I am not sure why this function is needed. Did I decide that it was a bad idea to pass the id directly? Should be looked into, can probably be simplified.
     */ 
    setID(newID){
        this.uniqueID = newID
    }
    
    /**
     * Draw the output shape on the screen.
     */ 
    draw() {

        this.height= this.radius
        

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

        this.inputs.forEach(child => {
            child.draw()       
        })
        
    }
}