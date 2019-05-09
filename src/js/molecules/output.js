import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'


export default class Output extends Atom {
    
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
        this.radius = 15
        
        this.setValues(values)
        
        this.addIO('input', 'number or geometry', this, 'geometry', '')
    }
    
    updateValue(){
        
        this.value = this.findIOValue('number or geometry')
        this.parent.value = this.value
        
        super.updateValue()
    }
    
    setID(newID){
        this.uniqueID = newID
    }
    
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
        GlobalVariables.c.fill()
        GlobalVariables.c.stroke()

        this.children.forEach(child => {
            child.draw()       
        })

        
    }
}