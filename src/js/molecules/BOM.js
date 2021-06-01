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
         * A description of this atom
         * @type {string}
         */
        this.description = "Adds a Bill Of Materials tag which appears in molecules containing this atom and in the GitHub project bill of materials."
        
        /**
         * The BOM item object created by this atom
         * @type {string}
         */
        this.BOMitem = new BOMEntry()
        /** 
         * This atom's radius as displayed on the screen is 1/65 width
         * @type {number}
         */
        this.radius = 1/65
        /**
         * This atom's height as drawn on the screen
         */
        this.height
        
        this.addIO('input', 'geometry', this, 'geometry', null, false, true)
        this.addIO('output', 'geometry', this, 'geometry', null)
        
        this.setValues(values)
    }
    
    /**
     * Set the value to be the BOMitem
     */ 
    updateValue(){
        if(this.inputs.every(x => x.ready)){
            try{
                var inputPath = this.findIOValue('geometry')
                const values = {key: "tag", tag: JSON.stringify(this.BOMitem), readPath: inputPath, writePath: this.path }
                this.basicThreadValueProcessing(values)
                this.clearAlert()
            }catch(err){this.setAlert(err)}
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
     * Draw the constant which is more rectangular than the regular shape.
     */ 
    draw() {
        
        super.draw("rect") 

        let pixelsX = GlobalVariables.widthToPixels(this.x)
        let pixelsY = GlobalVariables.heightToPixels(this.y)
        let pixelsRadius = GlobalVariables.widthToPixels(this.radius)

        /**
        * Relates height to radius
        * @type {number}
        */
        this.height = pixelsRadius/1.3

        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#484848'
        GlobalVariables.c.font = `${pixelsRadius/1.5}px Work Sans Bold`
        GlobalVariables.c.fillText(String.fromCharCode(0x0024,0x0024,0x0024), pixelsX- pixelsRadius/2, pixelsY +this.height/3)
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()
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