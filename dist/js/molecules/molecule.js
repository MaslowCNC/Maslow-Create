var Molecule = Atom.create({
    children: [], 
    name: "Molecule",
    atomType: "Molecule",
    topLevel: false, //a flag to signal if this node is the top level node
    
    create: function(values){
        var instance = Atom.create.call(this, values);
        instance.nodesOnTheScreen = [];
        
        //Add the button to go up one level
        if (!instance.topLevel){
            goUpOneLevel = UpOneLevelBtn.create({
                parentMolecule: instance, 
                x: 50,
                y: 50,
                parent: instance,
                atomType: "UpOneLevelBtn",
                uniqueID: generateUniqueID()
            });
            instance.nodesOnTheScreen.push(goUpOneLevel);
            
            //Add the molecule's output
            output = Output.create({
                parentMolecule: instance, 
                x: canvas.width - 50,
                y: canvas.height/2,
                parent: instance,
                name: "Output",
                atomType: "Output",
                uniqueID: generateUniqueID()
            });
            instance.nodesOnTheScreen.push(output);
        }
        return instance;
    },
    
    draw: function(){
        Atom.draw.call(this); //Super call to draw the rest
        
        //draw the circle in the middle
        c.beginPath();
        c.fillStyle = "#949294";
        c.arc(this.x, this.y, this.radius/2, 0, Math.PI * 2, false);
        c.closePath();
        c.fill();
        
    },
    
    doubleClick: function(x,y){
        //returns true if something was done with the click
        
        
        var clickProcessed = false;
        
        var distFromClick = distBetweenPoints(x, this.x, y, this.y);
        
        if (distFromClick < this.radius){
            currentMolecule = this; //set this to be the currently displayed molecule
            clickProcessed = true;
        }
        
        return clickProcessed; 
    },
    
    backgroundClick: function(){
        
        this.updateSidebar();
        
        var toRender = "function main () {\n    return molecule" + this.uniqueID + "()\n}\n\n" + this.generateFunction()
        
        window.loadDesign(toRender,"MaslowCreate");
    },
    
    updateCodeBlock: function(){
        //Grab the code from the output object
        
        console.log("Molecule update code block ran");
        
        //Grab values from the inputs and push them out to the input objects
        this.children.forEach(child => {
            if(child.valueType == 'geometry' && child.type == 'input'){
                this.nodesOnTheScreen.forEach(atom => {
                    if(atom.atomType == "Input" && child.name == atom.name){
                        atom.setOutput(child.getValue());
                    }
                });
            }
        });
        
        //Grab the value from the Molecule's output and set it to be the molecule's code block so that clicking on the molecule will display what it is outputting
        this.nodesOnTheScreen.forEach(atom => {
            if(atom.atomType == 'Output'){
                this.codeBlock = atom.codeBlock;
            }
        });
        
        //Set the output nodes with type 'geometry' to be the generated code
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
    
    updateSidebar: function(){
        //Update the side bar to make it possible to change the molecule name
        
        var valueList = Atom.updateSidebar.call(this); //call the super function
        
        createEditableValueListItem(valueList,this,"name", "Name", false);
        
    },
    
    setValue: function(newName){
        //Called by the sidebar to set the name
        this.name = newName;
    },
    
    generateFunction: function(){
        //Generate the function created by this molecule
        
        var allElements = new Array();
        
        this.nodesOnTheScreen.forEach(atom => {
            if (atom.codeBlock != ""){
                allElements.push(atom.codeBlock);
            }
        });
        
        var nodes =  {node1: 'test', node2: 'more test'};
        var nodesString = CircularJSON.stringify(this, this.stripFat, 4);
        nodesString = nodesString.replace(/\n/gi, "\n    ");
        
        var thisFunction = "function molecule" + this.uniqueID + " () {"
            +"\n    var containedNodes = " + nodesString + ";"
            +"\n    return [\n        " + allElements.join(",\n        ") 
            +"\n    ];"
        +"\n}"
        
        return thisFunction;
    },
    
    stripFat: function(name, val) {
        //Strips out the excess variables we don't want to store in our file
        
        var variablesToIgnore = ["showHoverText", "hoverDetectRadius", "codeBlock", "selected", "isMoving"];
        
        if(variablesToIgnore.indexOf(name) > -1){
            return undefined;
        }
        else{
            return val;
        }
    }
});


var UpOneLevelBtn = Atom.create({
    name: "Go Up One Level",
    atomType: "UpOneLevelBtn",
    children: [],
    color: '#F3EFEF',
    defaultColor: '#F3EFEF',
    selectedColor: '#F3EFEF',
    radius: 30,
    
    create: function(values){
        var instance = Atom.create.call(this, values);
        return instance;
    },
    
    draw: function() {
        
        this.children.forEach(child => {
            child.draw();       
        });
        
        
        c.fillStyle = this.color;
        
        c.textAlign = "start"; 
        c.fillText(this.name, this.x, this.y-(this.radius-5));

        var shaftWidth = 7;
        
        c.beginPath();
        c.moveTo(this.x, this.y - this.radius/2);
        c.lineTo(this.x + this.radius/2, this.y);
        c.lineTo(this.x + shaftWidth, this.y);
        c.lineTo(this.x + shaftWidth, this.y + this.radius/2);
        c.lineTo(this.x - shaftWidth, this.y + this.radius/2);
        c.lineTo(this.x - shaftWidth, this.y);
        c.lineTo(this.x - this.radius/2, this.y);
        c.fill();
        c.closePath();

    },
    
    doubleClick: function(x,y){
        //returns true if something was done with the click
        
        var clickProcessed = false;
        var distFromClick = distBetweenPoints(x, this.x, y, this.y);
        
        if (distFromClick < this.radius){
            this.parentMolecule.updateCodeBlock(); //Updates the code block of the parent molecule
            currentMolecule = this.parentMolecule.parent; //set parent this to be the currently displayed molecule
            clickProcessed = true;
        }
        
        return clickProcessed; 
    }
});