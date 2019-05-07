/**
 * The addBOMTag molecule type adds a tag containing information about a bill of materials item to the input geometry. The input geometry is not modified in any other way
 */

import Atom from '../prototypes/atom.js'
import GlobalVariables from '../globalvariables.js'
import {BOMEntry} from '../BOM.js'


export default class AddBOMTag extends Atom{
    /**
    * The constructor function.
    * @param {object} values An array of values passed in which will be assigned to the class as this.x
    */ 
    constructor(values){
        super(values)
        
        this.value = ''
        this.atomType = 'Add BOM Tag'
        this.type = 'addBOMTag'
        this.name = 'Add BOM Tag'
        this.radius = 20
        
        this.BOMitem = new BOMEntry()
        
        this.addIO('input', 'geometry', this, 'geometry', null)
        this.addIO('output', 'geometry', this, 'geometry', null)
        
        this.setValues(values)
    }
    
    updateValue(){
        //Overwrite the normal update code block to update the number of segments also
        try{
            this.value = this.findIOValue('geometry').as(JSON.stringify(this.BOMitem))
            this.clearAlert()
        }catch(err){
            this.setAlert(err)
        }
        
        super.updateValue()
    }
    
    updateSidebar(){
        //updates the sidebar to display information about this node
        
        var valueList = super.updateSidebar() //call the super function
        
        this.createBOM(valueList)
    }
    
    draw() {
        
        super.draw() //Super call to draw the rest
        
        
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.font = '30px Work Sans Bold'
        GlobalVariables.c.fillText('B', this.x - (this.radius/2.2), this.y + (this.radius/2.1))
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()
        
    }
    
    requestReadme(){
        //request any contributions from this atom to the readme
        
        return [this.readmeText]
    }
   
    createBOM(list){
        
        list.appendChild(document.createElement('br'))
        list.appendChild(document.createElement('br'))
        
        var div = document.createElement('h3')
        div.setAttribute('style','text-align:center;')
        list.appendChild(div)
        var valueText = document.createTextNode('Bill Of Materials Entry')
        div.appendChild(valueText)
        
        var x = document.createElement('HR')
        list.appendChild(x)
        
        this.createEditableValueListItem(list,this.BOMitem,'BOMitemName', 'Item', false, () => this.updateValue())
        this.createEditableValueListItem(list,this.BOMitem,'numberNeeded', 'Number', true, () => this.updateValue())
        this.createEditableValueListItem(list,this.BOMitem,'costUSD', 'Price', true, () => this.updateValue())
        this.createEditableValueListItem(list,this.BOMitem,'source', 'Source', false,() => this.updateValue())
        x = document.createElement('HR')
        list.appendChild(x)
    }
    
    
    serialize(values){
        //Save the readme text to the serial stream
        var valuesObj = super.serialize(values)
        
        valuesObj.BOMitem = this.BOMitem
        
        return valuesObj
        
    }
}
