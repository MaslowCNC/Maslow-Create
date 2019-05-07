import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'
import BOMEntry from '../BOM'


export default class AddBOMTag extends Atom{
    constructor(values){
        super(values)
        
        this.value = ''
        this.atomType = 'Add BOM Tag'
        this.type = 'addBOMTag'
        this.name = 'Add BOM Tag'
        this.radius = 20
        
        this.BOMlist = []
        
        this.addIO('input', 'geometry', this, 'geometry', null)
        this.addIO('output', 'geometry', this, 'geometry', null)
        
        this.setValues(values)
        
        this.addBOMEntry();
    }
    
    updateValue(){
        //Overwrite the normal update code block to update the number of segments also
        try{
            this.value = this.findIOValue('geometry').as(JSON.stringify(this.BOMlist[0]))
            this.clearAlert()
        }catch(err){
            this.setAlert(err)
        }
        
        super.updateValue()
    }
    
    updateSidebar(){
        //updates the sidebar to display information about this node
        
        var valueList = super.updateSidebar() //call the super function
        
        this.createBOM(valueList, this, this.BOMlist)
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
   
    createBOM(list,parent){
        
        list.appendChild(document.createElement('br'))
        list.appendChild(document.createElement('br'))
        
        var div = document.createElement('h3')
        div.setAttribute('style','text-align:center;')
        list.appendChild(div)
        var valueText = document.createTextNode('Bill Of Materials')
        div.appendChild(valueText)
        
        var x = document.createElement('HR')
        list.appendChild(x)
        
        this.BOMlist.forEach(bomItem => {
            this.createEditableValueListItem(list,bomItem,'BOMitemName', 'Item', false, () => this.updateValue())
            this.createEditableValueListItem(list,bomItem,'numberNeeded', 'Number', true, () => this.updateValue())
            this.createEditableValueListItem(list,bomItem,'costUSD', 'Price', true, () => this.updateValue())
            this.createEditableValueListItem(list,bomItem,'source', 'Source', false,() => this.updateValue())
            var x = document.createElement('HR')
            list.appendChild(x)
        })
    }
    
    addBOMEntry(){
        this.BOMlist.push(new BOMEntry())
        
        this.updateSidebar()
    }
    
    serialize(values){
        //Save the readme text to the serial stream
        var valuesObj = super.serialize(values)
        
        valuesObj.BOMlist = this.BOMlist
        
        return valuesObj
        
    }
}
