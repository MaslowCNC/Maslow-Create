
// Node prototype objects

var AttachmentPoint = {
    
    defaultRadius: 8,
    expandedRadius: 14,
    radius: 8,
    
    hoverDetectRadius: 8,
    hoverOffsetX: 0,
    hoverOffsetY: 30,
    uniqueID: 0,
    defaultOffsetX: 0,
    defaultOffsetY: 0,
    offsetX: 0,
    offsetY: 0,
    showHoverText: false,
    atomType: "AttachmentPoint",
    
    valueType: "number", //options are number, geometry, array
    type: "output",
    value: 10, //The default input value when nothing is connected

    create: function(values){
        var instance = Object.create(this);
        Object.keys(values).forEach(function(key) {
            instance[key] = values[key];
        });
        
        instance.connectors = [];
        
        instance.offsetX = instance.defaultOffsetX;
        instance.offsetY = instance.defaultOffsetY;
        instance.x = instance.parentMolecule.x + instance.offsetX;
        instance.y = instance.parentMolecule.y + instance.offsetY;
        return instance;
    },
    
    draw: function() {
        
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
        
    },

    clickDown: function(x,y){
        if(distBetweenPoints (this.x, x, this.y, y) < this.defaultRadius){
            
            if(this.type == 'output'){                  //begin to extend a connector from this if it is an output
                var connector = Connector.create({
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
    },

    clickUp: function(x,y){
        this.connectors.forEach(connector => {
            connector.clickUp(x, y);       
        });
    },

    clickMove: function(x,y){
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
    },
    
    keyPress: function(key){
        this.connectors.forEach(connector => {
            connector.keyPress(key);       
        });
    },
    
    deleteSelf: function(){
        //remove any connectors which were attached to this attachment point
        
        this.connectors.forEach(connector => {
            connector.deleteSelf();       
        });
    },
    
    updateSidebar: function(){
        this.parent.updateSidebar();
    },
    
    wasConnectionMade: function(x,y, connector){
        //this function returns itself if the cordinates passed in are within itself
        if (distBetweenPoints(this.x, x, this.y, y) < this.radius && this.type == 'input'){  //If we have released the mouse here and this is an input...
            
            if(this.connectors.length > 0){ //Don't accept a second connection to an input
                return false;
            }
            
            this.connectors.push(connector);
            return this;
        }
        return false;
    },
    
    getValue: function(){
        return this.value;
    },
    
    setValue: function(newValue){
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
    },
    
    update: function() {
        this.x = this.parentMolecule.x + this.offsetX;
        this.y = this.parentMolecule.y + this.offsetY;
        this.draw()
        
        this.connectors.forEach(connector => {
            connector.update();       
        });
    }
}

var Connector =  {
    
    isMoving: true,
    color: 'black',
    atomType: "Connector",
    selected: false,
    attachmentPoint1: null,
    attachmentPoint2: null,

    create: function(values){
        var instance = Object.create(this);
        Object.keys(values).forEach(function(key) {
            instance[key] = values[key];
        });
        
        instance.startX = instance.parentMolecule.outputX;
        instance.startY = instance.parentMolecule.y;
        
        return instance;
    },
    
    draw: function() {
        
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
    },

    clickUp: function(x,y){
        
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
    },

    clickMove: function(x,y){
        if (this.isMoving == true){
            this.endX = x;
            this.endY = y;
        }
    },
    
    keyPress: function(key){
        if(this.selected){
            if (key == 'Delete'){
                this.deleteSelf();
            }
        }
    },
    
    deleteSelf: function(){
        
        if(this.attachmentPoint2 != null){
            this.attachmentPoint2.connectors = []; //free up the point to which this was attached
        }
        
        this.attachmentPoint1.connectors.splice(this.attachmentPoint1.connectors.indexOf(this),1); //remove this connector from the output it is attached to
    },
    
    propogate: function(){
        //takes the input and passes it to the output
        this.attachmentPoint2.setValue(this.attachmentPoint1.getValue());
    },
    
    update: function() {
        
        this.startX = this.attachmentPoint1.x
        this.startY = this.attachmentPoint1.y
        if (this.attachmentPoint2){  //check to see if the attachment point is defined
            this.endX = this.attachmentPoint2.x;
            this.endY = this.attachmentPoint2.y;
        }
        this.draw()
    },
    
    
    
    wasConnectionMade: function(x,y, connector){
        return false;
    }

}

var Atom = {
    x: 0,
    y:  0,
    radius: 20,
    defaultColor: '#F3EFEF',
    selectedColor: 'green',
    selected: false,
    color: '#F3EFEF',
    name: "name",
    parentMolecule: null,
    codeBlock: "",
    defaultCodeBlock: "",
    isMoving: false,
    
    create: function(values){
        var instance = Object.create(this);
        Object.keys(values).forEach(function(key) {
            instance[key] = values[key];
        });
        
        instance.children = [];
        
        return instance;
    },
    
    draw: function() {
    
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
    },
    
    addIO: function(type, name, target, valueType){
        
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
        
        input = AttachmentPoint.create({
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
    },
    
    clickDown: function(x,y){
        //returns true if something was done with the click
        
        
        var clickProcessed = false;
        
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
        
        this.children.forEach(child => {
            if(child.clickDown(x,y) == true){
                clickProcessed = true;
            }
        });
        
        return clickProcessed; 
    },

    doubleClick: function(x,y){
        //returns true if something was done with the click
        
        
        var clickProcessed = false;
        
        var distFromClick = distBetweenPoints(x, this.x, y, this.y);
        
        if (distFromClick < this.radius){
            clickProcessed = true;
        }
        
        return clickProcessed; 
    },

    clickUp: function(x,y){
        this.isMoving = false;
        
        this.children.forEach(child => {
            child.clickUp(x,y);     
        });
    },

    clickMove: function(x,y){
        if (this.isMoving == true){
            this.x = x;
            this.y = y;
        }
        
        this.children.forEach(child => {
            child.clickMove(x,y);       
        });
    },
    
    keyPress: function(key){
        //runs whenver a key is pressed
        if (key == 'Delete'){
            if(this.selected == true){
                this.deleteNode();
            }
        }
        
        this.children.forEach(child => {
            child.keyPress(key);
        });
    },
    
    updateSidebar: function(){
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
        valueList = document.createElement("ul");
        sideBar.appendChild(valueList);
        valueList.setAttribute("class", "sidebar-list");
        
        //Add options to set all of the inputs
        this.children.forEach(child => {
            if(child.type == 'input' && child.valueType != 'geometry'){
                createEditableValueListItem(valueList,child,"value", child.name, true);
            }
        });
        
        return valueList;
    },
    
    deleteNode: function(){
        //deletes this node and all of it's children
        
        this.children.forEach(child => {
            child.deleteSelf();       
        });
        
        this.parent.nodesOnTheScreen.splice(this.parent.nodesOnTheScreen.indexOf(this),1); //remove this node from the list
    },
    
    update: function() {
        
        this.children.forEach(child => {
            child.update();     
        });
        
        this.draw()
    },
    
    updateCodeBlock: function(){
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
    },
    
    sendToRender: function(){
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
    }, 
    
    findIOValue: function(ioName){
        //find the value of an input for a given name
        
        ioName = ioName.split('~').join('');
        ioValue = null;
        
        this.children.forEach(child => {
            if(child.name == ioName && child.type == "input"){
                ioValue = child.getValue();
            }
        });
        
        return ioValue;
    }
}
