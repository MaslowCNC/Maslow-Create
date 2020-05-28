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
         * The BOM item object created by this atom
         * @type {string}
         */
        this.BOMitem = new BOMEntry()
         /**
         * This atom's height as drawn on the screen
         */
        this.height = 16
        
        this.addIO('input', 'geometry', this, 'geometry', null, false, true)
        this.addIO('output', 'geometry', this, 'geometry', null)
        
        this.setValues(values)
    }
    
    /**
     * Set the value to be the BOMitem, then call super updateValue()
     */ 
    updateValue(){
        if(this.inputs.every(x => x.ready)){
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
     * Draw the Bill of material atom which has a BOM icon.
     */ 
    draw() {
        
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
        
        this.inputs.forEach(input => {
            input.draw()       
        })
        if(this.output){
            this.output.draw()
        }
        
        let pixelsX = GlobalVariables.widthToPixels(this.x)
        let pixelsY = GlobalVariables.heightToPixels(this.y)
        let pixelsRadius = GlobalVariables.widthToPixels(this.radius)
        
        GlobalVariables.c.beginPath()
        GlobalVariables.c.rect(pixelsX - pixelsRadius, pixelsY - this.height/2, 2*pixelsRadius, this.height)
        GlobalVariables.c.textAlign = 'start' 
        GlobalVariables.c.fillText(this.name, pixelsX + pixelsRadius, pixelsY-pixelsRadius)
        GlobalVariables.c.fill()
        GlobalVariables.c.lineWidth = 1
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()
    
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#484848'
        GlobalVariables.c.font = '12px Work Sans Bold'
        GlobalVariables.c.fillText('BOM', GlobalVariables.widthToPixels(this.x- this.radius/1.5), GlobalVariables.heightToPixels(this.y)+this.height/3)
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