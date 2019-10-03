import Atom from '../prototypes/atom'

/**
 * This class creates the color atom which can be used to give a part a color.
 */
export default class Color extends Atom {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        
        super(values)
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Color'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Color'
        
        /**
         * The color options to choose from
         * @type {array}
         */
        this.colorOptions = ['Powder blue','White','Red','Steel blue','Yellow','Brown','Cyan', "Green", "Pink", "Blue", "Silver", "Black", "Keep Out"]
        
        /**
         * The index of the currently selected color option.
         * @type {number}
         */
        this.selectedColorIndex = 0
        
        this.addIO('input', 'geometry', this, 'geometry', null)
        this.addIO('output', 'geometry', this, 'geometry', null)
        
        this.setValues(values)
    }
    
    /**
     * Applies a color tag to the object in a worker thread.
     */ 
    updateValue(){
        try{
            const values = [this.findIOValue('geometry'), this.colorOptions[this.selectedColorIndex]]
            this.basicThreadValueProcessing(values, "color")
            this.clearAlert()
        }catch(err){this.setAlert(err)}
    }
    
    /**
     * Updates the value of the selected color and then the value.
     */ 
    changeColor(index){
        this.selectedColorIndex = index
        this.updateValue()
    }
    
    /**
     * Create a drop down to choose the color.
     */ 
    updateSidebar(){
        const list = super.updateSidebar()
        const dropdown= document.createElement('div')
        list.appendChild(dropdown)
        this.createDropDown(dropdown, this, this.colorOptions, this.selectedColorIndex, "Color", (index)=>{this.changeColor(index)})
    }
    
    /**
     * Add the color choice to the object which is saved for this molecule
     */
    serialize(){
        var superSerialObject = super.serialize(null)
        
        //Write the current color selection to the serialized object
        superSerialObject.selectedColorIndex = this.selectedColorIndex
        
        return superSerialObject
    }
}