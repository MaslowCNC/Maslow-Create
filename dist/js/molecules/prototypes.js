
// Node prototype objects

class AttachmentPoint {
    constructor(values){
        
        this.defaultRadius = 8;
        this.expandedRadius = 14;
        this.radius = 8;
        
        this.hoverDetectRadius = 8;
        this.hoverOffsetX = 0;
        this.hoverOffsetY = 30;
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
        
        this.x = this.parentMolecule.x + this.offsetX;
        this.y = this.parentMolecule.y + this.offsetY;
    }
    
    draw() {
        
        c.beginPath();
        c.fillStyle = this.parentMolecule.color;
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        if (this.showHoverText){
            if(this.type == "input"){
                c.textAlign = "end";
                c.fillText(this.name, this.x - (this.radius + 3), this.y+2)
            }
            else{
                c.textAlign = "start"; 
                c.fillText(this.name, this.x + (this.radius + 3), this.y+2)
            }
        }
        c.fill();
        c.closePath();
        
    }

    clickDown(x,y){
        if(distBetweenPoints (this.x, x, this.y, y) < this.defaultRadius){
            
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
        
        var distFromCursor = distBetweenPoints (this.x, x, this.y, y);
        
        //If we are hovering over the attachment point, indicate that by making it big
        if (distFromCursor < this.defaultRadius){
            this.radius = this.expandedRadius;
        }
        else{
            this.radius = this.defaultRadius;
        }
        
        
        //If we are close to the attachment point move it to it's hover location to make it accessable
        if (distFromCursor < this.hoverDetectRadius){
            this.offsetX = this.hoverOffsetX;
            this.offsetY = this.hoverOffsetY;
            this.showHoverText = true;
            this.hoverDetectRadius = this.defaultRadius + distBetweenPoints (this.defaultOffsetX, this.hoverOffsetX, this.defaultOffsetY, this.hoverOffsetY); 
        }
        else{
            this.offsetX = this.defaultOffsetX;
            this.offsetY = this.defaultOffsetY;
            this.showHoverText = false;
            this.hoverDetectRadius = this.defaultRadius;
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
        //this function returns itself if the cordinates passed in are within itself
        if (distBetweenPoints(this.x, x, this.y, y) < this.radius && this.type == 'input'){  //If we have released the mouse here and this is an input...
            
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
        
        //propigate the change to linked elements if this is an output
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

class Connector {
    constructor(values){
        
        this.isMoving = true;
        this.color = 'black';
        this.atomType = "Connector";
        this.selected = false;
        this.attachmentPoint1 = null;
        this.attachmentPoint2 = null;
        
        for(var key in values) {
            this[key] = values[key];
        }
        
        this.startX = this.parentMolecule.outputX;
        this.startY = this.parentMolecule.y;
    }
    
    draw(){
        
        c.beginPath();
        c.fillStyle = this.color;
        c.strokeStyle = this.color;
        c.globalCompositeOperation = 'destination-over'; //draw under other elements;
        if(this.selected){
            c.lineWidth = 3;
        }
        else{
            c.lineWidth = 1;
        }
        c.moveTo(this.startX, this.startY);
        c.bezierCurveTo(this.startX + 100, this.startY, this.endX - 100, this.endY, this.endX, this.endY);
        c.stroke();
        c.globalCompositeOperation = 'source-over'; //switch back to drawing on top
    }

    clickUp(x,y){
        
        if(this.isMoving){  //we only want to attach the connector which is currently moving
            currentMolecule.nodesOnTheScreen.forEach(molecule => {                      //For every molecule on the screen  
                molecule.children.forEach(child => {                                    //For each of their attachment points
                    var thisConnectionValid = child.wasConnectionMade(x,y, this);       //Check to see if we made a connection
                    if(thisConnectionValid){
                        this.attachmentPoint2 = thisConnectionValid;
                        this.propogate();                                               //Send information from one point to the other
                    }
                });
            });
        }
        
        
        if (this.attachmentPoint2 == null){                                 //If we have not made a connection
            this.deleteSelf();                                              //Delete this connector
        }
        
        this.isMoving = false;                                                         //Move over 
    }

    clickMove(x,y){
        if (this.isMoving == true){
            this.endX = x;
            this.endY = y;
        }
    }
    
    keyPress(key){
        if(this.selected){
            if (key == 'Delete'){
                this.deleteSelf();
            }
        }
    }
    
    deleteSelf(){
        
        if(this.attachmentPoint2 != null){
            this.attachmentPoint2.connectors = []; //free up the point to which this was attached
        }
        
        this.attachmentPoint1.connectors.splice(this.attachmentPoint1.connectors.indexOf(this),1); //remove this connector from the output it is attached to
    }
    
    serialize(){
        if ( this.attachmentPoint2 != null){
            var object = {
                ap1Name: this.attachmentPoint1.name,
                ap2Name: this.attachmentPoint2.name,
                ap1ID: this.attachmentPoint1.parentMolecule.uniqueID,
                ap2ID: this.attachmentPoint2.parentMolecule.uniqueID
            }
            return JSON.stringify(object);
        }
    }
    
    propogate(){
        //takes the input and passes it to the output
        this.attachmentPoint2.setValue(this.attachmentPoint1.getValue());
    }
    
    update() {
        
        this.startX = this.attachmentPoint1.x
        this.startY = this.attachmentPoint1.y
        if (this.attachmentPoint2){  //check to see if the attachment point is defined
            this.endX = this.attachmentPoint2.x;
            this.endY = this.attachmentPoint2.y;
        }
        this.draw()
    }
    
    wasConnectionMade(x,y, connector){
        return false;
    }

}

class Atom {

    constructor(values){
        
        for(var key in values) {
            this.key = values[key];
        }
        
        this.children = [];
        
        this.x = 0;
        this.y = 0;
        this.radius = 20;
        this.defaultColor = '#F3EFEF';
        this.selectedColor = 'green';
        this.selected = false;
        this.color = '#F3EFEF';
        this.name = "name";
        this.parentMolecule = null;
        this.codeBlock = "";
        this.defaultCodeBlock = "";
        this.isMoving = false;
        
    }
    
    draw() {
    
        this.inputX = this.x - this.radius
        this.outputX = this.x + this.radius
        
        this.children.forEach(child => {
            child.draw();       
        });
        
        c.beginPath();
        c.fillStyle = this.color;
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.textAlign = "start"; 
        c.fillText(this.name, this.x + this.radius, this.y-this.radius);
        c.fill();
        c.closePath();
    }
    
    addIO(type, name, target, valueType){
        
        //compute the baseline offset from parent node
        var offset;
        if (type == "input"){
            offset = -1* target.radius;
        }
        else{
            offset = target.radius;
        }
        
        //compute hover offset from parent node
        //find the number of elements of the same type already in the array 
        var numberOfSameTypeIO = target.children.filter(child => child.type == type).length;
        //multiply that number by an offset to find the new x offset
        var hoverOffsetComputed = numberOfSameTypeIO * -30;
        
        var input = new AttachmentPoint({
            parentMolecule: target, 
            defaultOffsetX: offset, 
            defaultOffsetY: 0,
            hoverOffsetX: offset,
            hoverOffsetY: hoverOffsetComputed,
            type: type,
            valueType: valueType,
            name: name,
            uniqueID: generateUniqueID(),
            atomType: "AttachmentPoint"
        });
        target.children.push(input);
    }
    
    clickDown(x,y){
        //Returns true if something was done with the click
        
        
        var clickProcessed = false;
        
        this.children.forEach(child => {
            if(child.clickDown(x,y) == true){
                clickProcessed = true;
            }
        });
        
        //If none of the children processed the click
        if(!clickProcessed){
        
            var distFromClick = distBetweenPoints(x, this.x, y, this.y);
            
            if (distFromClick < this.radius){
                this.color = this.selectedColor;
                this.isMoving = true;
                this.selected = true;
                this.updateSidebar();
                
                this.sendToRender();
                
                clickProcessed = true;
            }
            else{
                this.color = this.defaultColor;
                this.selected = false;
            }
            
        }
        
        return clickProcessed; 
    }

    doubleClick(x,y){
        //returns true if something was done with the click
        
        
        var clickProcessed = false;
        
        var distFromClick = distBetweenPoints(x, this.x, y, this.y);
        
        if (distFromClick < this.radius){
            clickProcessed = true;
        }
        
        return clickProcessed; 
    }

    clickUp(x,y){
        this.isMoving = false;
        
        this.children.forEach(child => {
            child.clickUp(x,y);     
        });
    }

    clickMove(x,y){
        if (this.isMoving == true){
            this.x = x;
            this.y = y;
        }
        
        this.children.forEach(child => {
            child.clickMove(x,y);       
        });
    }
    
    keyPress(key){
        //runs whenver a key is pressed
        if (key == 'Delete'){
            if(this.selected == true){
                this.deleteNode();
            }
        }
        
        this.children.forEach(child => {
            child.keyPress(key);
        });
    }
    
    updateSidebar(){
        //updates the sidebar to display information about this node
        
        //remove everything in the sideBar now
        while (sideBar.firstChild) {
            sideBar.removeChild(sideBar.firstChild);
        }
        
        //add the name as a title
        var name = document.createElement('h1');
        name.textContent = this.name;
        name.setAttribute("style","text-align:center;");
        sideBar.appendChild(name);
        
        //Create a list element
        var valueList = document.createElement("ul");
        sideBar.appendChild(valueList);
        valueList.setAttribute("class", "sidebar-list");
        
        //Add options to set all of the inputs
        this.children.forEach(child => {
            if(child.type == 'input' && child.valueType != 'geometry'){
                createEditableValueListItem(valueList,child,"value", child.name, true);
            }
        });
        
        return valueList;
    }
    
    deleteNode(){
        //deletes this node and all of it's children
        
        this.children.forEach(child => {
            child.deleteSelf();       
        });
        
        this.parent.nodesOnTheScreen.splice(this.parent.nodesOnTheScreen.indexOf(this),1); //remove this node from the list
    }
    
    update() {
        
        this.children.forEach(child => {
            child.update();     
        });
        
        this.draw()
    }
    
    serialize(savedObject){
        //savedObject is only used by Molecule type atoms
        var object = {
            atomType: this.atomType,
            name: this.name,
            x: this.x,
            y: this.y,
            uniqueID: this.uniqueID
        }
        return object;
    }
    
    updateCodeBlock(){
        //Substitue the result from each input for the ~...~ section with it's name
        
        var regex = /~(.*?)~/gi;
        this.codeBlock = this.defaultCodeBlock.replace(regex, x => {
            return this.findIOValue(x);
        });
        
        //Set the output nodes with name 'geometry' to be the generated code
        this.children.forEach(child => {
            if(child.valueType == 'geometry' && child.type == 'output'){
                child.setValue(this.codeBlock);
            }
        });
        
        //If this molecule is selected, send the updated value to the renderer
        if (this.selected){
            this.sendToRender();
        }
    }
    
    sendToRender(){
        //Send code to JSCAD to render
        if (this.codeBlock != ""){
            var toRender = "function main () {return " + this.codeBlock + "}"
            
            //console.log("To render: " + toRender);
            
            window.loadDesign(toRender,"MaslowCreate");
        }
        //Send something invisible just to wipe the rendering
        else{
            var toRender = "function main () {return sphere({r: .0001, center: true})}"
            window.loadDesign(toRender,"MaslowCreate");
        }
    }
    
    findIOValue(ioName){
        //find the value of an input for a given name
        
        ioName = ioName.split('~').join('');
        var ioValue = null;
        
        this.children.forEach(child => {
            if(child.name == ioName && child.type == "input"){
                ioValue = child.getValue();
            }
        });
        
        return ioValue;
    }
}
