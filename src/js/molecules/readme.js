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
        
        this.setValues(values)
    }
    
    /**
     * Add a place to edit the readme text to the sidebar*/ 
    updateSidebar(){
        var valueList = super.updateSidebar() //call the super function
        this.createEditableValueListItem(valueList,this,'readmeText', 'Notes', false)
    }
    
    /**
     * Draw the two // marks on the readme atom
     */ 
    draw() {

        let xInPixels = GlobalVariables.widthToPixels(this.x)
        let yInPixels = GlobalVariables.heightToPixels(this.y)
        let radiusInPixels = GlobalVariables.widthToPixels(this.radius)
        
        super.draw() //Super call to draw the rest
        
        //draw the two slashes on the node//
        GlobalVariables.c.strokeStyle = '#949294'
        GlobalVariables.c.lineWidth = 2
        GlobalVariables.c.lineCap = 'round'
        
        GlobalVariables.c.beginPath()
        GlobalVariables.c.moveTo(xInPixels - radiusInPixels/1.5, yInPixels + radiusInPixels/3)
        GlobalVariables.c.lineTo(xInPixels, yInPixels - radiusInPixels)
        GlobalVariables.c.stroke()

        GlobalVariables.c.beginPath()
        GlobalVariables.c.moveTo(xInPixels - radiusInPixels/3, yInPixels + radiusInPixels/1.5)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/3, yInPixels - radiusInPixels/1.5)
        GlobalVariables.c.stroke()
        
        GlobalVariables.c.beginPath()
        GlobalVariables.c.moveTo(xInPixels, yInPixels + radiusInPixels)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels/1.5, yInPixels - radiusInPixels/3)
        GlobalVariables.c.stroke()
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
        return [this.readmeText]
    }
    
    /**
     * Add the readme text to the information saved for this atom
     */ 
    serialize(values){
        //Save the readme text to the serial stream
        var valuesObj = super.serialize(values)
        
        valuesObj.readmeText = this.readmeText
        
        return valuesObj
        
    }
}
