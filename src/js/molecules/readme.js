import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the readme atom.
 */
export default class Readme extends Atom{
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
        this.atomType = 'Readme'
        /**
         * The text to appear in the README file
         * @type {string}
         */
        this.readmeText = 'Readme text here'
        /**
         * This atom's type
         * @type {string}
         */
        this.type = 'readme'
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'README'
        /**
         * This atom's radius...probably inherited and can be deleted
         * @type {number}
         */
        this.radius = 1/72
        /** 
         * A description of this atom
         * @type {string}
         */
        this.description = "A place to put project notes. These will appear in the GitHub readme and in the description of molecules up the chain. Markdown is supported. "

        /**
         * This atom's height as drawn on the screen
         */
        this.height = 10

        /**
         * Should this atom contribute to the molecule level readme
         */
        this.global = true
        
        
        this.setValues(values)
    }
    
    /**
     * Add a place to edit the readme text to the sidebar*/ 
    updateSidebar(){
        var valueList = super.updateSidebar() //call the super function
        this.createEditableValueListItem(valueList,this,'readmeText', 'Notes', false)
        this.createCheckbox(valueList,"Global",this.global,(event) => {
            this.global = event.target.checked
        })
    }
    /**
     * Draw the readme atom with // icon.
     */ 
    draw() {
        
        super.draw("rect")

        let pixelsRadius = GlobalVariables.widthToPixels(this.radius)
        this.height = pixelsRadius * 1.5
    
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = '#484848'
        GlobalVariables.c.font = `${pixelsRadius*1.5}px Work Sans Bold`
        GlobalVariables.c.fillText('//', GlobalVariables.widthToPixels(this.x- this.radius/2), GlobalVariables.heightToPixels(this.y)+this.height/3)
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()
        
    }
    /**
     * Update the readme text. Called when the readme text has been edited.
     */ 
    setValue(newText) {
        this.readmeText = newText
    }
    
    /**
     * Provides this molecules contribution to the global Readme
     */ 
    requestReadme(){
        if(this.global){
            return [this.readmeText]
        }
        else{
            return []
        }
    }
    
    /**
     * Add the readme text to the information saved for this atom
     */ 
    serialize(values){
        //Save the readme text to the serial stream
        var valuesObj = super.serialize(values)
        
        valuesObj.readmeText = this.readmeText
        valuesObj.global     = this.global
        
        return valuesObj
        
    }
}
