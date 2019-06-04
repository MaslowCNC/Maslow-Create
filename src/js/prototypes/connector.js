import GlobalVariables from '../globalvariables'

export default class Connector {
    constructor(values){
        
        this.isMoving = false
        this.color = 'black'
        this.atomType = 'Connector'
        this.selected = false
        this.attachmentPoint1 = null
        this.attachmentPoint2 = null
        
        for(var key in values) {
            this[key] = values[key]
        }
        
        this.startX = this.parentMolecule.outputX
        this.startY = this.parentMolecule.y
    }
    
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

    clickMove(x,y){
        if (this.isMoving == true){
            this.endX = x
            this.endY = y
        }
    }
    
    keyPress(key){
        if(this.selected){
            if (['Delete', 'Backspace'].includes(key)){
                this.deleteSelf()
            }
        }
    }
    
    deleteSelf(){
        //Free up the input to which this was attached
        if(this.attachmentPoint2 != null){
            this.attachmentPoint2.connectors = []
            this.attachmentPoint2.setDefault()
        }
        
        //Remove this connector from the output it is attached to
        this.attachmentPoint1.connectors.splice(this.attachmentPoint1.connectors.indexOf(this),1) 
    }
    
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
    
    lock(){
        this.attachmentPoint2.lock()
    }
    
    propogate(){
        //takes the input and passes it to the output
        if(this.attachmentPoint1.ready){
            this.attachmentPoint2.setValue(this.attachmentPoint1.getValue())
        }
    }
    
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