import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

export default class Input extends Atom {
    
    constructor(values){
        super (values)
        
        this.name = 'Input' + GlobalVariables.generateUniqueID()
        this.value = 10
        this.type = 'input'
        this.atomType = 'Input'
        this.height = 16
        this.radius = 15
        
        this.setValues(values)
        
        this.oldName = this.name
        
        this.addIO('output', 'number or geometry', this, 'number or geometry', 10)
        
        //Add a new input to the current molecule
        if (typeof this.parent !== 'undefined') {
            this.parent.addIO('input', this.name, this.parent, 'number or geometry', 10)
        }
        
        this.setOutput(this.value) //force propogation
    }
    
    updateSidebar(){
        //updates the sidebar to display information about this node
        
        var valueList =  super.updateSidebar() //call the super function
        
        this.createEditableValueListItem(valueList,this,'name', 'Name', false)
        
        this.parent.inputs.forEach(child => {
            if (child.name == this.name){
                this.createEditableValueListItem(valueList,child,'value', 'Value', true)
            }
        })
    }
    
    draw() {
        
        //Check if the name has been updated
        if(this.name != this.oldName){this.updateParentName()}
        
        GlobalVariables.c.fillStyle = this.color
        GlobalVariables.c.strokeStyle = this.parent.strokeColor
        GlobalVariables.c.textAlign = 'start' 
        GlobalVariables.c.fillText(this.name, this.x + this.radius, this.y-this.radius)
        GlobalVariables.c.beginPath()
        GlobalVariables.c.moveTo(this.x - this.radius, this.y - this.height)
        GlobalVariables.c.lineTo(this.x - this.radius + 10, this.y)
        GlobalVariables.c.lineTo(this.x - this.radius, this.y + this.height)
        GlobalVariables.c.lineTo(this.x + this.radius, this.y + this.height/2)
        GlobalVariables.c.lineTo(this.x + this.radius, this.y - this.height/2)
        GlobalVariables.c.lineWidth = 1
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()
        GlobalVariables.c.stroke()

        this.inputs.forEach(input => {
            input.draw()       
        })
        if(this.output){
            this.output.draw()
        }
    }
    
    deleteNode() {
        
        //Remove this input from the parent molecule
        if (typeof this.parent !== 'undefined') {
            this.parent.removeIO('input', this.name, this.parent)
        }
        
        super.deleteNode()
    }
    
    updateParentName(){
        //Callled when the name has changed to updated the name of the parent molecule IO
        //Run through the parent molecule and find the input with the same name
        this.parent.inputs.forEach(child => {
            if (child.name == this.oldName){
                child.name = this.name
            }
        })
        this.oldName = this.name
    }
    
    setOutput(newOutput){
        this.output.lock() //Lock all of the dependants
        //Set the input's output
        this.value = newOutput  //Set the code block so that clicking on the input previews what it is 
        //Set the output to be the new value
        this.output.setValue(newOutput)
    }
    
    getOutput(){
        return this.output.getValue()
    }
    
    updateValue(){
        //This empty function handles any calls to the normal update code block function which breaks things here
    }
}
