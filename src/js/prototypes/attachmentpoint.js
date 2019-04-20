import Connector from './connector'
import GlobalVariables from '../globalvariables'

export default class AttachmentPoint {
    constructor(values){
 
        this.defaultRadius = 8;
        this.expandedRadius = false;
        this.radius = 8;
        
        this.hoverDetectRadius = 8;
        this.hoverOffsetX = 0;
        this.hoverOffsetY = 0;
        this.uniqueID = 0;
        this.defaultOffsetX = 0;
        this.defaultOffsetY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.showHoverText = false;
        this.atomType = "AttachmentPoint";
        
        
        this.valueType = "number"; //options are number, geometry, array
        this.type = "output";
        this.value = 10; //The default input value when nothing is connected
        
        this.connectors = [];
        
        this.offsetX = this.defaultOffsetX;
        this.offsetY = this.defaultOffsetY;
        
        for(var key in values) {
            this[key] = values[key];
        }
        
        this.clickMove(0,0); //trigger a refresh to get all the current values
    }
    
    draw() {

        this.defaultRadius = this.radius;
        this.radius = this.parentMolecule.radius/2.2;
        this.hoverDetectRadius = this.parentMolecule.radius;

        if (this.expandedRadius){
            this.radius = this.parentMolecule.radius/1.6;
        }

        if(this.parentMolecule.children.length < 2 && this.type == "input"){
                this.x= this.parentMolecule.x-this.parentMolecule.radius;
                this.y= this.parentMolecule.y;
                     }    
        else if(this.parentMolecule.children.length < 2 && this.type == "output"){
                this.x= this.parentMolecule.x+this.parentMolecule.radius;
                this.y= this.parentMolecule.y;
                     }                 


        var txt = this.name;
        var textWidth = GlobalVariables.c.measureText(txt).width;
        GlobalVariables.c.font = "10px Work Sans";

        var bubbleColor = "#008080";
        var scaleRadiusDown = this.radius*.7;
        var halfRadius = this.radius*.5;

        
      if (this.showHoverText){
            if(this.type == "input"){
               
                GlobalVariables.c.beginPath();

                    if (this.name === "geometry"){
                 GlobalVariables.c.fillStyle = this.parentMolecule.selectedColor;   
                }
                    else{
                GlobalVariables.c.fillStyle = bubbleColor;
                }
                    if(this.radius == this.defaultRadius){
                    GlobalVariables.c.rect(this.x - textWidth - this.radius - halfRadius, this.y - this.radius, textWidth + this.radius + halfRadius , this.radius*2);   
                    GlobalVariables.c.arc(this.x - textWidth - this.radius - halfRadius, this.y, this.radius, 0, Math.PI * 2, false);
                }
            
                GlobalVariables.c.fill();
                GlobalVariables.c.beginPath();
                GlobalVariables.c.fillStyle = this.parentMolecule.defaultColor;
                GlobalVariables.c.textAlign = "end";
                GlobalVariables.c.fillText(this.name, this.x - (this.radius + 3), this.y+2)
                GlobalVariables.c.fill();
                GlobalVariables.c.closePath();
            }
            else{

                GlobalVariables.c.beginPath();
                    
                    if (this.name === "geometry"){
                 GlobalVariables.c.fillStyle = this.parentMolecule.selectedColor;   
                }
                    else{
                GlobalVariables.c.fillStyle = bubbleColor;
                }

                GlobalVariables.c.rect(this.x, this.y - scaleRadiusDown, textWidth + this.radius + halfRadius, scaleRadiusDown*2);
                GlobalVariables.c.arc(this.x + textWidth + this.radius + halfRadius, this.y, scaleRadiusDown, 0, Math.PI * 2, false);
                GlobalVariables.c.fill();
                GlobalVariables.c.closePath();
                GlobalVariables.c.beginPath();
                GlobalVariables.c.fillStyle = this.parentMolecule.defaultColor;
                GlobalVariables.c.textAlign = "start"; 
                GlobalVariables.c.fillText(this.name, (this.x + halfRadius) + (this.radius + 3), this.y+2)
                GlobalVariables.c.fill();
                GlobalVariables.c.closePath();
            }

        }
 
        GlobalVariables.c.beginPath();
        GlobalVariables.c.fillStyle = this.parentMolecule.color;
        GlobalVariables.c.strokeStyle = this.parentMolecule.strokeColor;
        GlobalVariables.c.lineWidth = 1;
        GlobalVariables.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        GlobalVariables.c.fill();
        GlobalVariables.c.stroke();
        GlobalVariables.c.closePath();  

        if (this.defaultRadius != this.radius){
            if (this.type == "output"){     
                this.offsetX = this.parentMolecule.radius;
            }
            else{
                this.offsetX = -1* this.parentMolecule.radius;
            }
        }
    }

    clickDown(x,y, clickProcessed){
        if(GlobalVariables.distBetweenPoints (this.x, x, this.y, y) < this.defaultRadius && !clickProcessed){
            
            if(this.type == 'output'){                  //begin to extend a connector from this if it is an output
                var connector = new Connector({
                    parentMolecule: this.parentMolecule, 
                    attachmentPoint1: this,
                    atomType: "Connector"
                });
                this.connectors.push(connector);
            }
            
            if(this.type == 'input'){ //connectors can only be selected by clicking on an input
                this.connectors.forEach(connector => {     //select any connectors attached to this node
                    connector.selected = true;
                });
            }
            
            return true; //indicate that the click was handled by this object
        }
        else{
            if(this.type == 'input'){ //connectors can only be selected by clicking on an input
                this.connectors.forEach(connector => {      //unselect any connectors attached to this node
                    connector.selected = false;
                });
            }
            return false; //indicate that the click was not handled by this object
        }
    }

    clickUp(x,y){
        this.connectors.forEach(connector => {
            connector.clickUp(x, y);       
        });
    }

    clickMove(x,y){
        
        //expand if touched by mouse
        var distFromCursor = GlobalVariables.distBetweenPoints (this.x, x, this.y, y);
        var distFromCursorParent = GlobalVariables.distBetweenPoints (this.parentMolecule.x -this.parentMolecule.radius, x, this.parentMolecule.y, y); 
        console.log("dist +" + distFromCursor);
        //If we are close to the attachment point move it to it's hover location to make it accessible
        if (distFromCursor < this.parentMolecule.radius*3){

            var numAttachmentPoints= this.parentMolecule.children.length;
            var attachmentPointNumber = this.parentMolecule.children.indexOf(this);  
       
             // if input type then offset first element down to give space for radial menu 
            if (this.type == "input" && numAttachmentPoints > 2){
                   
                    var anglePerIO = 2.0944/ numAttachmentPoints; //120 deg/num
                    // angle correction so that it centers menu adjusting to however many attachment points there are 
                    var angleCorrection = anglePerIO * (numAttachmentPoints - 2 /* -1 correction + 1 for "output" IO */);
                    //fixes shrinkwrap attachment point location when adding io
                        if (this.parentMolecule.addedIO){
                            anglePerIO = 2.26893/*130 deg*// numAttachmentPoints;
                            angleCorrection = anglePerIO * (numAttachmentPoints /* -1 correction + 1 for "output" IO */);
                        }
                       
                        if (numAttachmentPoints > 4){
                            this.hoverOffsetY = Math.round( 1.8* this.parentMolecule.radius * (Math.sin(-angleCorrection + anglePerIO * 2 * attachmentPointNumber)));   
                        }
                        else{
                            this.hoverOffsetY = Math.round( 1.5* this.parentMolecule.radius * (Math.sin(-angleCorrection + anglePerIO * 2 * attachmentPointNumber)));
                        }
                    this.hoverOffsetX = -Math.round(1.5* this.parentMolecule.radius * (Math.cos(-angleCorrection + anglePerIO * 2 * attachmentPointNumber)));
                    
                    var xDistance = (this.hoverOffsetX) - this.offsetX;
                    var yDistance = (this.hoverOffsetY) - this.offsetY;
                    var distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
                     
                     if (distance < 1 || distFromCursorParent<10 || distFromCursor< this.radius*3.5){
                       this.offsetX = this.hoverOffsetX; 
                       this.offsetY = this.hoverOffsetY;

                          if (distFromCursor<this.radius*1.5){  
                           this.expandedRadius = true; //If we are hovering over the attachment point, indicate that by making it big
                           this.parentMolecule.children.forEach(child => {
                           child.offsetX = child.hoverOffsetX;
                           child.offsetY = child.hoverOffsetY;
                           child.showHoverText = true;
                           console.log("true");
                           console.log(distFromCursor);
                                });
                            }
                          else { this.expandedRadius = false;}  
                     } 
                     else if (distance > 1){
                        this.offsetX += this.hoverOffsetX/ distFromCursorParent/1.5; 
                        this.offsetY += this.hoverOffsetY/ distFromCursorParent/1.5; 
                }
            }

            else if (this.type == "output"){
               if(distFromCursor<this.radius*1.5){
                this.expandedRadius = true;
               }
               else {
                this.expandedRadius = false;
               }
                this.offsetX = this.parentMolecule.radius;
            }
            
            this.showHoverText = true;
            this.hoverDetectRadius = this.defaultRadius + GlobalVariables.distBetweenPoints (this.offsetX, this.hoverOffsetX, this.defaultOffsetY, this.hoverOffsetY); 
                
            }

        else{
            if (this.type == "input")
                {   this.offsetX = -1* this.parentMolecule.radius;
                    this.offsetY = this.defaultOffsetY;
                    this.showHoverText = false;
                    this.hoverDetectRadius = this.defaultRadius;
                    
             }
            else if (this.type == "output"){
                    this.offsetX = this.parentMolecule.radius;
                    this.showHoverText = false;
                    this.hoverDetectRadius = this.defaultRadius;
            }
        }
        
        this.connectors.forEach(connector => {
            connector.clickMove(x, y);       
        });
     }
    
    
    keyPress(key){
        this.connectors.forEach(connector => {
            connector.keyPress(key);       
        });
    }
    
    deleteSelf(){
        //remove any connectors which were attached to this attachment point
        
        this.connectors.forEach(connector => {
            connector.deleteSelf();       
        });
        
    }
    
    updateSidebar(){
        this.parent.updateSidebar();
    }
    
    wasConnectionMade(x,y, connector){
        //this function returns itself if the coordinates passed in are within itself
        if (GlobalVariables.distBetweenPoints(this.x, x, this.y, y) < this.radius && this.type == 'input'){  //If we have released the mouse here and this is an input...
            
            if(this.connectors.length > 0){ //Don't accept a second connection to an input
                return false;
            }
            
            this.connectors.push(connector);
            
            return this;
        }
        return false;
    }
    
    getValue(){
        return this.value;
    }
    
    setValue(newValue){
        this.value = newValue;
        //propagate the change to linked elements if this is an output
        if (this.type == 'output'){
            this.connectors.forEach(connector => {     //select any connectors attached to this node
                connector.propogate();
            });
        }
        //if this is an input
        else{   //update the code block to reflect the new values
            this.parentMolecule.updateCodeBlock();
        }
    }
    
    update() {
        this.x = this.parentMolecule.x + this.offsetX;
        this.y = this.parentMolecule.y + this.offsetY;
        this.draw()
       
        this.connectors.forEach(connector => {
            connector.update();       
        });
    }
}