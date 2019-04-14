import AttachmentPoint from './attachmentpoint'
import GlobalVariables from '../globalvariables'

export default class Atom {

    constructor(values){
        //Setup default values
        this.children = [];
        
        this.x = 0;
        this.y = 0;
        this.radius = 20;
        this.defaultColor = '#F3EFEF';
        this.selectedColor = "#484848";
        this.strokeColor = "#484848";
        this.selected = false;
        this.color = '#F3EFEF';
        this.name = "name";
        this.parentMolecule = null;
        this.codeBlock = null;
        this.isMoving = false;
        this.x = 0;
        this.y = 0;
        

        for(var key in values) {
            this[key] = values[key];
        }
        
    }
    
    setValues(values){
        //Assign the object to have the passed in values
        
        for(var key in values) {
            this[key] = values[key];
        }
        
        if (typeof this.ioValues !== 'undefined') {
            this.ioValues.forEach(ioValue => { //for each saved value
                this.children.forEach(io => {  //Find the matching IO and set it to be the saved value
                    if(ioValue.name == io.name && io.type == "input"){
                        io.setValue(ioValue.ioValue);
                    }
                });
            });
        }
    }
    
    draw() {
        
        this.children.forEach(child => {
            child.draw();       
        });
      
        GlobalVariables.c.beginPath();
        GlobalVariables.c.fillStyle = this.color;
        GlobalVariables.c.font = "10px Work Sans";

        //make it impossible to draw atoms too close to the edge
        //not sure what x left margin should be because if it's too close it would cover expanded text
        var canvasFlow = document.querySelector('#flow-canvas');
        if (this.x < this.radius*3){
                this.x+= this.radius*3; 
                //for attachment point draw adjustment
                this.x = this.radius*3;    
                GlobalVariables.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        }
        else if (this.y<this.radius*2){
                this.y += this.radius; 
                  //for attachment point draw adjustment
                this.y += this.radius; 
                GlobalVariables.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        }
        else if (this.x + this.radius*2 > canvasFlow.width/GlobalVariables.scale1){
                this.x -= this.radius*2; 
                  //for attachment point draw adjustment
                this.x -= this.radius*2; 
                GlobalVariables.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        }
        else if (this.y+ this.radius*2 > canvasFlow.height/GlobalVariables.scale1){
                this.y-= this.radius; 
                  //for attachment point draw adjustment
                this.y -= this.radius; 
                GlobalVariables.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        }
        else{
        GlobalVariables.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        }
        GlobalVariables.c.textAlign = "start"; 
        GlobalVariables.c.fillText(this.name, this.x + this.radius, this.y-this.radius);
        GlobalVariables.c.fill();
        GlobalVariables.c.strokeStyle = this.strokeColor;
        GlobalVariables.c.lineWidth = 1;
        GlobalVariables.c.stroke();
        GlobalVariables.c.closePath();
    }
    
    addIO(type, name, target, valueType, defaultValue){
        
        if(target.children.find(o => (o.name === name && o.type === type))== undefined){ //Check to make sure there isn't already an IO with the same type and name
            //compute the baseline offset from parent node
            var offset;
            if (type == "input"){
                offset = -1* target.scaledRadius;
            }
            else{
                offset = target.scaledRadius;
            }
            var input = new AttachmentPoint({
                parentMolecule: target,
                defaultOffsetX: offset,
                defaultOffsetY: 0,
                type: type,
                valueType: valueType,
                name: name,
                value: defaultValue,
                uniqueID: GlobalVariables.generateUniqueID(),
                atomType: "AttachmentPoint"
            });
            
            target.children.push(input);
        }
    }
    
    removeIO(type, name, target){
        //Remove the target IO attachment point
        
        this.children.forEach(io => {
            if(io.name == name && io.type == type){
                io.deleteSelf();
                this.children.splice(this.children.indexOf(io),1);
            }
        });
    }
    
    clickDown(x,y, clickProcessed){
        //Returns true if something was done with the click
        
        this.children.forEach(child => {
            if(child.clickDown(x,y, clickProcessed) == true){
                clickProcessed = true;
            }
        });
        
        //If none of the children processed the click see if the atom should, if not clicked, then deselect
        if(!clickProcessed && GlobalVariables.distBetweenPoints(x, this.x, y, this.y) < this.radius){
            this.color = this.selectedColor;
            this.isMoving = true;
            this.selected = true;
             this.strokeColor = this.defaultColor;
            this.updateSidebar();
            this.sendToRender();
            clickProcessed = true;
        }
        else{
            this.color = this.defaultColor;
            this.strokeColor = this.selectedColor;
            this.selected = false;
        }
        
        return clickProcessed; 
    }

    doubleClick(x,y){
        //returns true if something was done with the click
        
        
        var clickProcessed = false;
        
        var distFromClick = GlobalVariables.distBetweenPoints(x, this.x, y, this.y);
        
        if (distFromClick < this.x){
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
        //runs whenever a key is pressed
        if (['Delete', 'Backspace'].includes(key)){
            if(this.selected == true && document.getElementsByTagName("BODY")[0] == document.activeElement){
                //If this atom is selected AND the body is active (meaning we are not typing in a text box)
                this.deleteNode();
            }
        }
        
        this.children.forEach(child => {
            child.keyPress(key);
        });
    }
    
    updateSidebar(){
        //updates the sidebar to display information about this node
        
        var valueList = this.initializeSideBar();
        
        //Add options to set all of the inputs
        this.children.forEach(child => {
            if(child.type == 'input' && child.valueType != 'geometry'){
                this.createEditableValueListItem(valueList,child,"value", child.name, true);
            }
        });
        
        return valueList;
    }
    
    initializeSideBar(){
        //remove everything in the sideBar now
        while (GlobalVariables.sideBar.firstChild) {
            GlobalVariables.sideBar.removeChild(GlobalVariables.sideBar.firstChild);
        }
        
        //add the name as a title
        var name = document.createElement('h1');
        name.textContent = this.name;
        name.setAttribute("class","doc-title");
        GlobalVariables.sideBar.appendChild(name);
        
        //Create a list element
        var valueList = document.createElement("ul");
        GlobalVariables.sideBar.appendChild(valueList);
        valueList.setAttribute("class", "sidebar-list");
        
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
        
        var ioValues = [];
        this.children.forEach(io => {
            if (typeof io.getValue() == "number" && io.type == "input"){
                var saveIO = {
                    name: io.name,
                    ioValue: io.getValue()
                };
                ioValues.push(saveIO);
            }
        });
        
        var object = {
            atomType: this.atomType,
            name: this.name,
            x: this.x,
            y: this.y,
            uniqueID: this.uniqueID,
            ioValues: ioValues
        }
        
        return object;
    }
    
    requestBOM(){
        //Placeholder
        return [];
    }
    
    requestReadme(){
        //request any contributions from this atom to the readme
        
        return [];
    }
    
    updateCodeBlock(){
        
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
        //Send code to JSxCAD to render
        try {
            GlobalVariables.api.writeStl({ path: 'window' },this.codeBlock);
        }
        catch(err) {
            console.log("Oh no can't render that");
            //console.log(err);
            GlobalVariables.api.writeStl({ path: 'window' },GlobalVariables.api.sphere(.1));
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
    
    createEditableValueListItem(list,object,key, label, resultShouldBeNumber){
        var listElement = document.createElement("LI");
        list.appendChild(listElement);
        
        
        //Div which contains the entire element
        var div = document.createElement("div");
        listElement.appendChild(div);
        div.setAttribute("class", "sidebar-item sidebar-editable-div");
        
        //Left div which displays the label
        var labelDiv = document.createElement("div");
        div.appendChild(labelDiv);
        var labelText = document.createTextNode(label + ":");
        labelDiv.appendChild(labelText);
        labelDiv.setAttribute("class", "sidebar-subitem label-item");
        
        
        //Right div which is editable and displays the value
        var valueTextDiv = document.createElement("div");
        div.appendChild(valueTextDiv);
        var valueText = document.createTextNode(object[key]);
        valueTextDiv.appendChild(valueText);
        valueTextDiv.setAttribute("contenteditable", "true");
        valueTextDiv.setAttribute("class", "sidebar-subitem editing-item");
        var thisID = label+GlobalVariables.generateUniqueID();
        valueTextDiv.setAttribute("id", thisID);
        
        
        document.getElementById(thisID).addEventListener('focusout', event => {
            var valueInBox = document.getElementById(thisID).textContent;
            if(resultShouldBeNumber){
                valueInBox = parseFloat(valueInBox);
            }
            
            //If the target is an attachmentPoint then call the setter function
            if(object instanceof AttachmentPoint){
                object.setValue(valueInBox);
            }
            else{
                object[key] = valueInBox;
            }
        });
        
        //prevent the return key from being used when editing a value
        document.getElementById(thisID).addEventListener('keypress', function(evt) {
            if (evt.which === 13) {
                evt.preventDefault();
                document.getElementById(thisID).blur();  //shift focus away if someone presses enter
            }
        });

    }
    
    createNonEditableValueListItem(list,object,key, label, resultShouldBeNumber){
        var listElement = document.createElement("LI");
        list.appendChild(listElement);
        
        
        //Div which contains the entire element
        var div = document.createElement("div");
        listElement.appendChild(div);
        div.setAttribute("class", "sidebar-item");
        
        //Left div which displays the label
        var labelDiv = document.createElement("div");
        div.appendChild(labelDiv);
        var labelText = document.createTextNode(label + ":");
        labelDiv.appendChild(labelText);
        labelDiv.setAttribute("class", "sidebar-subitem");
        
        
        //Right div which is editable and displays the value
        var valueTextDiv = document.createElement("div");
        div.appendChild(valueTextDiv);
        var valueText = document.createTextNode(object[key]);
        valueTextDiv.appendChild(valueText);
        valueTextDiv.setAttribute("contenteditable", "false");
        valueTextDiv.setAttribute("class", "sidebar-subitem");
        var thisID = label+GlobalVariables.generateUniqueID();
        valueTextDiv.setAttribute("id", thisID);
        

    }

    createDropDown(list,parent,options,selectedOption, description){
        var listElement = document.createElement("LI");
        list.appendChild(listElement);
        
        
        //Div which contains the entire element
        var div = document.createElement("div");
        listElement.appendChild(div);
        div.setAttribute("class", "sidebar-item");
        
        //Left div which displays the label
        var labelDiv = document.createElement("div");
        div.appendChild(labelDiv);
        var labelText = document.createTextNode(description);
        labelDiv.appendChild(labelText);
        labelDiv.setAttribute("class", "sidebar-subitem");
        
        
        //Right div which is editable and displays the value
        var valueTextDiv = document.createElement("div");
        div.appendChild(valueTextDiv);
        var dropDown = document.createElement("select");
        options.forEach(option => {
            var op = new Option();
            op.value = options.findIndex(thisOption => thisOption === option);
            op.text = option;
            dropDown.options.add(op);
        });
        valueTextDiv.appendChild(dropDown);
        valueTextDiv.setAttribute("class", "sidebar-subitem");
        
        dropDown.selectedIndex = selectedOption; //display the current selection
        
        dropDown.addEventListener(
            'change',
            function() { parent.changeEquation(dropDown.value); },
            false
        );
    }

    createButton(list,parent,buttonText,functionToCall){
        var listElement = document.createElement("LI");
        list.appendChild(listElement);
        
        
        //Div which contains the entire element
        var div = document.createElement("div");
        listElement.appendChild(div);
        div.setAttribute("class", "sidebar-item-no-hover");
        
        
        //Right div which is button
        var valueTextDiv = document.createElement("div");
        div.appendChild(valueTextDiv);
        var button = document.createElement("button");
        var buttonTextNode = document.createTextNode(buttonText);
        button.setAttribute("class", "sidebar_button");
        button.appendChild(buttonTextNode);
        valueTextDiv.appendChild(button);
        valueTextDiv.setAttribute("class", "sidebar-subitem");
        
        button.addEventListener(
            'mousedown',
            function() { functionToCall(parent); } ,
            false
        );
    }

}
