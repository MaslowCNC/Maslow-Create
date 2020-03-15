import Atom from '../prototypes/atom'
import GlobalVariables from '../globalvariables'

/**
 * This class creates the output atom.
 */
export default class Box extends Atom {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        super (values)
        
        /**
         * This atom's type
         * @type {string}
         */
        this.type = 'box'
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Box'
        /**
         * This atom's value
         * @type {object}
         */
        this.value = null
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Box'
        /**
         * This atom's height
         * @type {number}
         */
        this.height = 16
        /**
         * This atom's radius
         * @type {number}
         */
        this.radius = 1/75


        this.endX

        this.endY

        this.setValues(values)

        this.startX
        this.startY
        this.width
        this.length
        
    }
    
    /**
     * Take the input value of this function and pass it to the parent Molecule to go up one level.
     */ 
    updateValue(){
        if(this.inputs.every(x => x.ready)){
            this.value = this.findIOValue('number or geometry')
            this.parent.value = this.value
            this.parent.propogate()
            this.parent.processing = false
            
            //Remove all the information stored in github molecules with no inputs after they have been computed to save ram
            if(this.parent.inputs.length == 0 && this.parent.atomType == "GitHubMolecule" && !this.parent.topLevel){
                this.parent.dumpBuffer(true)
            }
            
            super.updateValue()
        }
    }
    
    /**
     * I am not sure why this function is needed. Did I decide that it was a bad idea to pass the id directly? Should be looked into, can probably be simplified.
     */ 
    setID(newID){
        /**
         * The unique ID of this atom.
         * @type {number}
         */ 
        this.uniqueID = newID
    }
    
    /**
     * Draw the output shape on the screen.
     */ 
    draw() {

        const xInPixels = GlobalVariables.widthToPixels(this.x)
        const yInPixels = GlobalVariables.heightToPixels(this.y)
        const radiusInPixels = GlobalVariables.widthToPixels(this.radius)

        if(GlobalVariables.ctrlDown){

                GlobalVariables.c.beginPath()
                GlobalVariables.c.fillStyle = '#80808080'
                GlobalVariables.c.rect(
                    xInPixels, 
                    yInPixels, 
                    this.endX - xInPixels, 
                    this.endY - yInPixels)
                GlobalVariables.c.fill()
                GlobalVariables.c.closePath()
            }
        
    }

    clickMove(x,y){
        if(GlobalVariables.ctrlDown){
        this.endX = x
        this.endY= y
        }
    }

    clickUp(x,y){  
        const xInPixels = GlobalVariables.widthToPixels(this.x)
        const yInPixels = GlobalVariables.heightToPixels(this.y)

        this.startX = xInPixels
        this.startY = yInPixels
        
        this.deleteNode()
        this.parent.nodesOnTheScreen.forEach(atom => {
        atom.selectBox(this.startX, this.startY, x, y)
    })
    }

}

    