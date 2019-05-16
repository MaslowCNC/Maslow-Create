import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

export default class Constant extends Atom{
    
    constructor(values){
        super(values)
        
        this.value = ''
        this.type = 'constant'
        this.name = 'Constant'
        this.atomType = 'Constant'
        this.height = 16
        this.radius = 15
        
        this.setValues(values)
        
        this.addIO('output', 'number', this, 'number', 10)
        
        if (typeof this.ioValues == 'array') {
            this.output.setValue(ioValues[0].ioValue)
        }
    }
    
    updateSidebar(){
        //updates the sidebar to display information about this node
        
        var valueList = super.updateSidebar() //call the super function
        this.createEditableValueListItem(valueList,this,'name', 'Name', false)
        this.createEditableValueListItem(valueList,this.output,'value', 'Value', true)
    }
    
    serialize(values){
        //Save the IO value to the serial stream
        var valuesObj = super.serialize(values)
        
        valuesObj.ioValues = [{
            name: 'number',
            ioValue: this.output.getValue()
        }]
        
        return valuesObj
        
    }
    
    draw() {
        this.inputs.forEach(child => {
            child.draw()       
        })
        
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = this.color
        GlobalVariables.c.rect(this.x - this.radius, this.y - this.height/2, 2*this.radius, this.height)
        GlobalVariables.c.textAlign = 'start' 
        GlobalVariables.c.fillText(this.name, this.x + this.radius, this.y-this.radius)
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()
    }
    
    displayAndPropogate(){
        this.output.setValue(this.output.getValue())
    }
}
