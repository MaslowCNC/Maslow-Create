import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the input atom.
 */
export default class Input extends Atom {
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super (values)
        
        /** 
         * This atom's name
         * @type {string}
         */
        this.name = 'Input' + GlobalVariables.generateUniqueID()
        /** 
         * The value the input is set to, defaults to 10. Is this still used or are we using the value of the attachmentPoint now?
         * @type {number}
         */
        this.value = 10
        /** 
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Input'
        /** 
         * This atom's height for drawing
         * @type {number}
         */
        this.height
        
        /** 
         * This atom's old name, used during name changes
         * @type {string}
         */
        this.oldName = this.name
        
        this.addIO('output', 'number or geometry', this, 'number or geometry', 10)
        
        //Add a new input to the current molecule
        if (typeof this.parent !== 'undefined') {
            this.parent.addIO('input', this.name, this.parent, 'number or geometry', 10)
        }
        
        this.setValues(values)
    }
    
    /**
     * Updates the side bar to let the user change the atom value. Note that the parent molecule input is set, not this atom's input by changes.
     */ 
    updateSidebar(){
        //updates the sidebar to display information about this node
        
        var valueList =  super.updateSidebar() //call the super function
        
        this.createEditableValueListItem(valueList,this,'name', 'Name', false)
        
    }
    
    /**
     * Draws the atom on the screen.
     */ 
    draw() {

        // //Snap the inputs to the far right side
        this.x = this.radius

        let xInPixels = GlobalVariables.widthToPixels(this.x)
        let yInPixels = GlobalVariables.heightToPixels(this.y)
        let radiusInPixels = GlobalVariables.widthToPixels(this.radius)
        /**
        * Relates height to radius
        * @type {number}
        */
        this.height = radiusInPixels*1.3
        //Check if the name has been updated
        if(this.name != this.oldName){this.updateParentName()}
        
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
        if(this.showHover){
            GlobalVariables.c.textAlign = 'start' 
            GlobalVariables.c.fillText(this.name, xInPixels + radiusInPixels, yInPixels -radiusInPixels)
        }
        GlobalVariables.c.beginPath()
        GlobalVariables.c.moveTo(xInPixels - radiusInPixels, yInPixels + this.height/2)
        GlobalVariables.c.lineTo(xInPixels, yInPixels + this.height/2)
        GlobalVariables.c.lineTo(xInPixels + radiusInPixels, yInPixels)
        GlobalVariables.c.lineTo(xInPixels, yInPixels - this.height/2)
        GlobalVariables.c.lineTo(xInPixels - radiusInPixels, yInPixels - this.height/2)
        GlobalVariables.c.lineWidth = 1
        GlobalVariables.c.fill()
        GlobalVariables.c.closePath()
        GlobalVariables.c.stroke()
        
       
    }
    
    /**
     * Remove the input from the parent molecule, then delete the atom normally.
     */ 
    deleteNode() {
        //Remove this input from the parent molecule
        if (typeof this.parent !== 'undefined') {
            this.parent.removeIO('input', this.name, this.parent)
        }
        
        super.deleteNode()
    }
    
    /**
     * Called when the name has changed to updated the name of the parent molecule IO
     */ 
    updateParentName(){
        //Run through the parent molecule and find the input with the same name
        this.parent.inputs.forEach(child => {
            if (child.name == this.oldName){
                child.name = this.name
            }
        })
        this.oldName = this.name
    }
    
    /**
     * Grabs the new value from the parent molecule's input, sets this atoms value, then propogates. TODO: If the parent has nothing connected, check to see if something is tied to the default input. 
     */ 
    updateValue(){
        this.parent.inputs.forEach(input => { //Grab the value for this input from the parent's inputs list
            if(input.name == this.name){        //If we have found the matching input
                this.value = input.getValue()
                
                this.output.waitOnComingInformation()              //Lock all of the dependents
                this.output.setValue(this.value)
            }
        })
    }
    
    /**
     * Returns the current value being output
     */ 
    getOutput(){
        return this.output.getValue()
    }
    
}