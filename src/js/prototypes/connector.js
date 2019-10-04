import GlobalVariables from '../globalvariables'

/**
 * The connector class defines how an output can be connected to an input. It appears on the screen as a black line extending from an output to an input.
 */
export default class Connector {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        
        /** 
         * True if the connector is currently being created and is in the process of extending
         * @type {boolean}
         */
        this.isMoving = false
        /** 
         * The connectors current color
         * @type {string}
         */
        this.color = 'black'
        /** 
         * The type of this connector
         * @type {string}
         */
        this.atomType = 'Connector'
        /** 
         * True if this connector has been selected
         * @type {boolean}
         */
        this.selected = false
        /** 
         * The first attachment point this connector is connected to (an ouput)
         * @type {object}
         */
        this.attachmentPoint1 = null
        /** 
         * The second attachment point this connector is connected to (an input)
         * @type {object}
         */
        this.attachmentPoint2 = null
        
        for(var key in values) {
            /**
             * Assign each of the values in values as this.key
             */
            this[key] = values[key]
        }
        
        /** 
         * The starting X cordinate for the connector. Should really be referenced to attachmentPoint1.
         * @type {number}
         */
        this.startX = this.parentMolecule.outputX
        /** 
         * The starting Y cordinate for the connector. Should really be referenced to attachmentPoint1.
         * @type {number}
         */
        this.startY = this.parentMolecule.y
    }
    
    /**
     * Draw the connector as a bezier curve on the screen
     */ 
    draw(){
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = this.color
        GlobalVariables.c.strokeStyle = this.color
        GlobalVariables.c.globalCompositeOperation = 'destination-over' //draw under other elements;
        if(this.selected){
            GlobalVariables.c.lineWidth = 3
        }
        else{
            GlobalVariables.c.lineWidth = 1
        }
        GlobalVariables.c.moveTo(this.startX, this.startY)
        GlobalVariables.c.bezierCurveTo(this.startX + 100, this.startY, this.endX - 100, this.endY, this.endX, this.endY)
        GlobalVariables.c.stroke()
        GlobalVariables.c.globalCompositeOperation = 'source-over' //switch back to drawing on top
    }
    
    /**
     * clickUp checks to see if the mouse button has been released over an input attachment point. If it has then the connector is created there. If not, then the connector is deleted.
     * @param {number} x - The x cordinate of the click
     * @param {number} y - The y cordinate of the click
     */ 
    clickUp(x,y){
        if(this.isMoving){  //we only want to attach the connector which is currently moving
            var attachmentMade = false
            GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {                      //For every molecule on the screen  
                molecule.inputs.forEach(attachmentPoint => {                                    //For each of their attachment points
                    if(attachmentPoint.wasConnectionMade(x,y)){
                        attachmentMade = true
                        this.attachmentPoint2 = attachmentPoint
                        attachmentPoint.attach(this)
                        this.propogate()
                    }
                })
            })
            if (!attachmentMade){
                this.deleteSelf()
            }
            this.isMoving = false
        }
    }
    
    /**
     * clickMove runs while the connector is being created. As long as the mouse is pressed down, the end of the connector stays attached to the mouse.
     * @param {number} x - The x cordinate of the click
     * @param {number} y - The y cordinate of the click
     */ 
    clickMove(x,y){
        if (this.isMoving == true){
            /**
             * The s cordinate of the end of the connector.
             */
            this.endX = x
            /**
             * The y cordinate of the end of the connector.
             */
            this.endY = y
        }
    }
    
    /**
     * Called when any key is pressed. If the key is delete or backspace and the connector is selected then the connector is deleted.
     * @param {string} key - The key which was pressed
     */ 
    keyPress(key){
        if(this.selected){
            if (['Delete', 'Backspace'].includes(key)){
                this.deleteSelf()
            }
        }
    }
    
    /**
     * Deletes the connector by calling its attachmentPoints to tell them to delete their references to this connector.
     */ 
    deleteSelf(){
        //Remove this connector from the output it is attached to
        this.attachmentPoint1.deleteConnector(this) 
        
        //Free up the input to which this was attached
        this.attachmentPoint2.deleteConnector(this)
    }
    
    /**
     * Generates an object used to save the connector.
     */ 
    serialize(){
        if ( this.attachmentPoint2 != null){
            var object = {
                ap1Name: this.attachmentPoint1.name,
                ap2Name: this.attachmentPoint2.name,
                ap1ID: this.attachmentPoint1.parentMolecule.uniqueID,
                ap2ID: this.attachmentPoint2.parentMolecule.uniqueID
            }
            return object
        }
    }
    
    /**
     * Passes a lock call to the connected input.
     */ 
    lock(){
        this.attachmentPoint2.lock()
    }
    
    /**
     * Pass the value of the attached output to the attached input
     */ 
    propogate(){
        //takes the input and passes it to the output
        if(this.attachmentPoint1.ready){
            this.attachmentPoint2.setValue(this.attachmentPoint1.getValue())
        }
    }
    
    /**
     * Commputes the connectors position and draw it to the screen.
     */ 
    update() {
        this.startX = this.attachmentPoint1.x
        this.startY = this.attachmentPoint1.y
        if (this.attachmentPoint2){  //check to see if the attachment point is defined
            this.endX = this.attachmentPoint2.x
            this.endY = this.attachmentPoint2.y
        }
        this.draw()
    }

}