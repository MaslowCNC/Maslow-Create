import Atom from '../prototypes/atom.js'
import GlobalVariables from '../globalvariables.js'
import {BOMEntry} from '../BOM.js'

/**
 * The addBOMTag molecule type adds a tag containing information about a bill of materials item to the input geometry. The input geometry is not modified in any other way
 */
export default class AddBOMTag extends Atom{
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super(values)
        
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Add BOM Tag'
        /**
         * This atom's type
         * @type {string}
         */
        this.type = 'addBOMTag'
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Add BOM Tag'
        /**
         * This atom's radius as drawn on the screen. Probably inherited and can be deleted.
         * @type {string}
         */
        this.radius = 20
        
        /**
         * The BOM item object created by this atom
         * @type {string}
         */
        this.BOMitem = new BOMEntry()
        
        this.addIO('input', 'geometry', this, 'geometry', null)
        this.addIO('output', 'geometry', this, 'geometry', null)
        
        this.setValues(values)
    }
    
    /**
     * Set the value to be the BOMitem, then call super updateValue()
     */ 
    updateValue(){
        if(!GlobalVariables.evalLock && this.inputs.every(x => x.ready)){
            try{
                const values = [this.findIOValue('geometry'), JSON.stringify(this.BOMitem)]
                this.basicThreadValueProcessing(values, "specify")
                this.clearAlert()
            }catch(err){this.setAlert(err)}
            super.updateValue()
        }
    }
        
    /**
     * Updates the side bar to display the BOM item information
     */ 
    updateSidebar(){
        var valueList = super.updateSidebar() //call the super function
        this.createBOM(valueList)
    }
    
    /**
     * Add a B to the molecule representation
     */ 
    draw() {
        
        super.draw() //Super call to draw the rest
        
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#949294'
        GlobalVariables.c.font = '30px Work Sans Bold'
        GlobalVariables.c.fillText('B', this.x - (this.radius/2.2), this.y + (this.radius/2.1))
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()
        
    }
    
    /**
     * I'm not sure this actually does anything. Delete? 
     */ 
    requestReadme(){
        //request any contributions from this atom to the readme
        return [this.readmeText]
    }
   
    /**
     * Creates an editable UI represntation of the bom list. 
     * @param {Object} list - list is an object to which the generated HTML element will be apended
     */ 
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
    
    /**
     * Add the bom item to the saved object
     */ 
    serialize(values){
        //Save the readme text to the serial stream
        var valuesObj = super.serialize(values)
        
        valuesObj.BOMitem = this.BOMitem
        
        return valuesObj
        
    }
}
