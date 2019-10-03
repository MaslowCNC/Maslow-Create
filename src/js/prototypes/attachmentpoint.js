import Connector from './connector'
import GlobalVariables from '../globalvariables'

/**
 * This class creates a new attachmentPoint which are the input and output blobs on Atoms
 */
export default class AttachmentPoint {
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        
        /** 
         * This atom's default radius (non hover)
         * @type {number}
         */
        this.defaultRadius = 8
        /** 
         * A flag to indicate if this attachmet point is currently expanded.
         * @type {boolean}
         */
        this.expandedRadius = false
        /** 
         * This atom's current radius as displayed.
         * @type {number}
         */
        this.radius = 8
        
        /** 
         * How close does the mouse need to get to expand the atom
         * @type {number}
         */
        this.hoverDetectRadius = 8
        /** 
         * When the mouse is hovering where should the AP move in X
         * @type {number}
         */
        this.hoverOffsetX = 0
        /** 
         * When the mouse is hovering where should the AP move in Y
         * @type {number}
         */
        this.hoverOffsetY = 0
        /** 
         * A unique identifying number for this attachment point
         * @type {number}
         */
        this.uniqueID = 0
        /** 
         * The default offset position in X referenced to the center of the parent atom.
         * @type {number}
         */
        this.defaultOffsetX = 0
        /** 
         * The default offset position in Y referenced to the center of the parent atom.
         * @type {number}
         */
        this.defaultOffsetY = 0
        /** 
         * The current offset position in X referenced to the center of the parent atom.
         * @type {number}
         */
        this.offsetX = 0
        /** 
         * The current offset position in Y referenced to the center of the parent atom.
         * @type {number}
         */
        this.offsetY = 0
        /** 
         * A flag to determine if the hover text is shown next to the attachment point.
         * @type {boolean}
         */
        this.showHoverText = false
        /** 
         * The attachment point type.
         * @type {string}
         */
        this.atomType = 'AttachmentPoint'
        
        /** 
         * The attachment point value type. Options are number, geometry, array.
         * @type {string}
         */
        this.valueType = 'number'
        /** 
         * The attachment point type. Options are input, output.
         * @type {string}
         */
        this.type = 'output'
        /** 
         * The attachment point current value.
         * @type {number}
         */
        this.value = 10
        
        /**
         * The default value to be used by the ap when nothing is attached
         * @type {string}
         */
        this.defaultValue = 10
        
        /** 
         * A flag to indicate if the attachment point is currently ready. Used to order initilization when program is loaded.
         * @type {string}
         */
        this.ready = false
        /** 
         * A list of all of the connectors attached to this attachmet point
         * @type {object}
         */
        this.connectors = []
        
        this.offsetX = this.defaultOffsetX
        this.offsetY = this.defaultOffsetY
        
        for(var key in values) {
            /**
             * Assign values in values as this.x
             */
            this[key] = values[key]
        }
        
        this.clickMove(0,0) //trigger a refresh to get all the current values
    }
    
    /**
     * Draws the attachment point on the screen. Called with each frame.
     */ 
    draw() {

        this.defaultRadius = this.radius
        this.radius = this.parentMolecule.radius/2.2
        this.hoverDetectRadius = this.parentMolecule.radius

        if (this.expandedRadius){
            this.radius = this.parentMolecule.radius/1.6
        }
        if(this.parentMolecule.inputs.length < 2 && this.type == 'input'){
            /**
             * The x cordinate of the attachment point.
             */
            this.x = this.parentMolecule.x-this.parentMolecule.radius
            /**
             * The y cordinate of the attachment point.
             */
            this.y = this.parentMolecule.y
        }    
        else if(this.parentMolecule.inputs.length < 2 && this.type == 'output'){
            this.x= this.parentMolecule.x+this.parentMolecule.radius
            this.y= this.parentMolecule.y
        }                 


        var txt = this.name
        var textWidth = GlobalVariables.c.measureText(txt).width
        GlobalVariables.c.font = '10px Work Sans'

        var bubbleColor = '#008080'
        var scaleRadiusDown = this.radius*.7
        var halfRadius = this.radius*.5

        
        if (this.showHoverText){
            if(this.type == 'input'){
               
                
                GlobalVariables.c.globalCompositeOperation='destination-over'
                GlobalVariables.c.beginPath()

                if (this.name === 'geometry'){
                    GlobalVariables.c.fillStyle = this.parentMolecule.selectedColor   
                }
                else{
                    GlobalVariables.c.fillStyle = bubbleColor
                }
                if(this.radius == this.defaultRadius){
                    GlobalVariables.c.rect(this.x - textWidth - this.radius - halfRadius, this.y - this.radius, textWidth + this.radius + halfRadius , this.radius*2)   
                    GlobalVariables.c.arc(this.x - textWidth - this.radius - halfRadius, this.y, this.radius, 0, Math.PI * 2, false)
                }
            
                GlobalVariables.c.fill()
                
                
                GlobalVariables.c.globalCompositeOperation='source-over'
                GlobalVariables.c.beginPath()
                GlobalVariables.c.fillStyle = this.parentMolecule.defaultColor
                GlobalVariables.c.textAlign = 'end'
                GlobalVariables.c.fillText(this.name, this.x - (this.radius + 3), this.y+2)
                GlobalVariables.c.fill()
                GlobalVariables.c.closePath()
            }
            else{

                GlobalVariables.c.beginPath()
                    
                if (this.name === 'geometry'){
                    GlobalVariables.c.fillStyle = this.parentMolecule.selectedColor   
                }
                else{
                    GlobalVariables.c.fillStyle = bubbleColor
                }

                GlobalVariables.c.rect(this.x, this.y - scaleRadiusDown, textWidth + this.radius + halfRadius, scaleRadiusDown*2)
                GlobalVariables.c.arc(this.x + textWidth + this.radius + halfRadius, this.y, scaleRadiusDown, 0, Math.PI * 2, false)
                GlobalVariables.c.fill()
                GlobalVariables.c.closePath()
                GlobalVariables.c.beginPath()
                GlobalVariables.c.fillStyle = this.parentMolecule.defaultColor
                GlobalVariables.c.textAlign = 'start' 
                GlobalVariables.c.fillText(this.name, (this.x + halfRadius) + (this.radius + 3), this.y+2)
                GlobalVariables.c.fill()
                GlobalVariables.c.closePath()
            }

        }
 
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = this.parentMolecule.color
        GlobalVariables.c.strokeStyle = this.parentMolecule.strokeColor
        GlobalVariables.c.lineWidth = 1
        GlobalVariables.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        GlobalVariables.c.fill()
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()  

        if (this.defaultRadius != this.radius){
            if (this.type == 'output'){     
                this.offsetX = this.parentMolecule.radius
            }
            else{
                this.offsetX = -1* this.parentMolecule.radius
            }
        }
    }
    
    /**
     * Handles mouse click down. If the click is inside the AP it's connectors are selected if it is an input.
     * @param {number} x - The x cordinate of the click
     * @param {number} y - The y cordinate of the click
     * @param {boolean} clickProcessed - Has the click already been handled
     */ 
    clickDown(x,y, clickProcessed){
        if(GlobalVariables.distBetweenPoints (this.x, x, this.y, y) < this.defaultRadius && !clickProcessed){
            if(this.type == 'output'){                  //begin to extend a connector from this if it is an output
                var connector = new Connector({
                    parentMolecule: this.parentMolecule, 
                    attachmentPoint1: this,
                    atomType: 'Connector',
                    isMoving: true
                })
                this.connectors.push(connector)
            }
            
            if(this.type == 'input'){ //connectors can only be selected by clicking on an input
                this.connectors.forEach(connector => {     //select any connectors attached to this node
                    connector.selected = true
                })
            }
            
            return true //indicate that the click was handled by this object
        }
        else{
            if(this.type == 'input'){ //connectors can only be selected by clicking on an input
                this.connectors.forEach(connector => {      //unselect any connectors attached to this node
                    connector.selected = false
                })
            }
            return false //indicate that the click was not handled by this object
        }
    }

    /**
     * Handles mouse click up. If the click is inside the AP and a connector is currently extending, then a connection is made
     * @param {number} x - The x cordinate of the click
     * @param {number} y - The y cordinate of the click
     */ 
    clickUp(x,y){
        this.connectors.forEach(connector => {
            connector.clickUp(x, y)       
        })
    }
    
    /**
     * Handles mouse click and move to expand the AP. Could this be done with a call to expand out?
     * @param {number} x - The x cordinate of the click
     * @param {number} y - The y cordinate of the click
     */ 
    clickMove(x,y){
        
        //expand if touched by mouse
        // var distFromCursor = GlobalVariables.distBetweenPoints (this.x, x, this.y, y);
        var distFromCursorParent = Math.abs(GlobalVariables.distBetweenPoints (this.parentMolecule.x -this.parentMolecule.radius, x, this.parentMolecule.y, y)) 
        //If we are close to the attachment point move it to it's hover location to make it accessible
        if (distFromCursorParent < this.parentMolecule.radius*3){
            if (this.type == 'input'){
                this.expandOut(distFromCursorParent)
            }
            this.showHoverText = true
            if (GlobalVariables.distBetweenPoints(this.x, x, this.y, y) < this.radius){
                this.expandedRadius = true    
            }  
            else{
                this.expandedRadius = false      
            }
        }
        else{
            this.reset()
        }
        
        this.connectors.forEach(connector => {
            connector.clickMove(x, y)       
        })
    }
    
    /**
     * I'm not sure what this does. Can it be deleted?
     */ 
    reset(){
        if (this.type == 'input'){
            this.offsetX = -1* this.parentMolecule.radius
            this.offsetY = this.defaultOffsetY
        }
        this.showHoverText = false
    }
    
    /**
     * Handles mouse click down. If the click is inside the AP it's connectors are selected if it is an input.
     * @param {number} cursorDistance - The distance the cursor is from the attachment point.
     */ 
    expandOut(cursorDistance){
        const inputList = this.parentMolecule.inputs.filter(input => input.type == 'input')
        const attachmentPointNumber = inputList.indexOf(this) 
        const anglePerIO = (Math.PI) / (inputList.length + 1)
        // angle correction so that it centers menu adjusting to however many attachment points there are 
        const angleCorrection = -Math.PI/2 - anglePerIO
        this.hoverOffsetY = Math.round(1.8 * this.parentMolecule.radius * (Math.sin((attachmentPointNumber * anglePerIO) - angleCorrection))) 
        this.hoverOffsetX = Math.round(1.5 * this.parentMolecule.radius * (Math.cos((attachmentPointNumber * anglePerIO) - angleCorrection)))
        this.offsetX = Math.max( this.offsetX, this.hoverOffsetX)
        cursorDistance = Math.max( cursorDistance, 30)
        this.offsetY = Math.min( this.offsetY, -this.hoverOffsetY)
        this.offsetY = Math.max( this.offsetY, this.hoverOffsetY)
        this.offsetX = this.hoverOffsetX * 30/cursorDistance
        this.offsetY = this.hoverOffsetY * 30/cursorDistance

    }
    
    /**
     * Just passes a key press to the attached connectors. No impact on the connector.
     * @param {string} key - The key which was pressed
     */ 
    keyPress(key){
        this.connectors.forEach(connector => {
            connector.keyPress(key)       
        })
    }
    
    /**
     * Delete any connectors attached to this ap
     */ 
    deleteSelf(){
        //remove any connectors which were attached to this attachment point
        
        this.connectors.forEach( connector => {
            connector.deleteSelf()
            this.deleteSelf()  //This is a bit of a hack. It calls itself recursively until there are no connectors left because a single call will fail for multiple connectors. Each time one is removed from the list it messes up the forEach...There must be a better way
        })
        
    }
    
    /**
     * Delete a target connector which is passed in. The default option is to delete all of the connectors.
     */ 
    deleteConnector(connector = "all"){
        const connectorIndex = this.connectors.indexOf(connector)
        if(connectorIndex != -1){
            this.connectors.splice(connectorIndex,1) //Remove the target connector
        }
        else{
            this.connectors = [] //Remove all of the connectors
        }
    }
    
    /**
     * Can be called to see if the target cordinates are within this ap. Returns true/false.
     * @param {number} x - The x cordinate of the target
     * @param {number} y - The y cordinate of the target
     */ 
    wasConnectionMade(x,y){
        //this function returns itself if the coordinates passed in are within itself
        if (GlobalVariables.distBetweenPoints(this.x, x, this.y, y) < this.radius && this.type == 'input'){  //If we have released the mouse here and this is an input...
        
            if(this.connectors.length > 0){ //Don't accept a second connection to an input
                return false
            }
            else{
                return true
            }
        }
        else{
            return false
        }
    }
    
    /**
     * Attaches a new connector to this ap
     * @param {object} connector - The connector to attach
     */ 
    attach(connector){
        this.connectors.push(connector)
    }
    
    /**
     * Passes a lock command to the parent molecule, or to the attached connector depending on input/output.
     */ 
    lock(){
        if(this.type == 'output'){
            this.connectors.forEach(connector => {
                connector.lock()
            })
        }
        else{
            this.ready = false
            if(this.parentMolecule.output){
                this.parentMolecule.output.lock()
            }
        }
    }
    
    /**
     * Restores the ap to it's default value.
     */ 
    setDefault(){
        this.setValue(this.defaultValue)
    }
    
    /**
     * Updates the default value for the ap.
     */ 
    updateDefault(newDefault){
        this.defaultValue = newDefault
    }
    
    /**
     * Reads and returns the current value of the ap.
     */ 
    getValue(){
        return this.value
    }
    
    /**
     * Sets the current value of the ap.
     */ 
    setValue(newValue){
        this.value = newValue
        this.ready = true
        //propagate the change to linked elements if this is an output
        if (this.type == 'output'){
            this.connectors.forEach(connector => {     //select any connectors attached to this node
                connector.propogate()
            })
        }
        //if this is an input
        else{   //update the code block to reflect the new values
            this.parentMolecule.updateValue()
        }
    }
    
    /**
     * Clears any references to geometry this ap is holding onto to free up ram.
     */
    dumpBuffer(){
        this.value = null
    }
    
    /**
     * Computes the curent position and then draws the ap on the screen.
     */ 
    update() {
        this.x = this.parentMolecule.x + this.offsetX
        this.y = this.parentMolecule.y + this.offsetY
        this.draw()
       
        this.connectors.forEach(connector => {
            connector.update()       
        })
    }
}