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
        this.colorOptions = ["blue", "green", "pink", "black"]
        
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
    
    changeColor(index){
        this.selectedColorIndex = index
        console.log(this.colorOptions[this.selectedColorIndex])
        this.updateValue()
    }
    
    /**
     * Create a drop down to choose the color.
     */ 
    updateSidebar(){
        const list = super.updateSidebar()
        this.createDropDown(list, this, this.colorOptions, this.selectedColorIndex, "Color", (index)=>{this.changeColor(index)})
    }
}