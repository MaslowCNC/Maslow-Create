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
            
            //Add the molecule's output FIXME...this should use the place atom function
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
        
        //var toRender = "function main () {\n    return molecule" + this.uniqueID + ".code()\n}\n\n" + this.serialize()
        
        //window.loadDesign(toRender,"MaslowCreate");
    },
    
    updateCodeBlock: function(){
        //Grab the code from the output object
        
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
    
    serialize: function(savedObject){
        //Save this molecule.
        
        //This one is a little confusing. Basically each molecule saves like an atom, but also creates a second object 
        //record of itself in the object "savedObject" object. If this is the topLevel molecule we need to create the 
        //savedObject object here to pass to lower levels.
        
        if(this.topLevel == true){
            //Create a new blank project to save to
            savedObject = {molecules: []}
        }
            
        var allElementsCode = new Array();
        var allAtoms = [];
        var allConnectors = [];
        
        
        this.nodesOnTheScreen.forEach(atom => {
            if (atom.codeBlock != ""){
                allElementsCode.push(atom.codeBlock);
            }
            
            allAtoms.push(atom.serialize(savedObject));
            
            atom.children.forEach(attachmentPoint => {
                if(attachmentPoint.type == "output"){
                    attachmentPoint.connectors.forEach(connector => {
                        allConnectors.push(connector.serialize());
                    });
                }
            });
        });
        
        var thisAsObject = {
            atomType: this.atomType,
            name: this.name,
            uniqueID: this.uniqueID,
            topLevel: this.topLevel,
            allAtoms: allAtoms,
            allConnectors: allConnectors
        }
        
        //Add an object record of this object
        savedObject.molecules.push(thisAsObject);
            
        if(this.topLevel == true){
            //If this is the top level, return the generated object
            return savedObject;
        }
        else{
            //If not, return just a placeholder for this molecule
            var object = {
                atomType: this.atomType,
                name: this.name,
                x: this.x,
                y: this.y,
                uniqueID: this.uniqueID
            }
            
            return JSON.stringify(object);
        }
    },
        
    deserialize: function(moleculeList, moleculeID){
        
        //Find the target molecule in the list
        moleculeObject = moleculeList.filter((molecule) => { return molecule.uniqueID == moleculeID;})[0];
        
        //Grab the name and ID
        this.uniqueID = moleculeObject.uniqueID;
        this.name = moleculeObject.name;
        this.topLevel = moleculeObject.topLevel;
        
        console.log("Molecule object before placing atoms:");
        console.log(moleculeObject);
        
        //Place the atoms
        moleculeObject.allAtoms.forEach(atom => {
            this.placeAtom(JSON.parse(atom), moleculeList);
        });
        
                
        console.log("Placing connectors for: " + moleculeObject.uniqueID);
        console.log(moleculeObject);
        
        moleculeObject = moleculeList.filter((molecule) => { return molecule.uniqueID == moleculeID;})[0];
        
        //Place the connectors
        moleculeObject.allConnectors.forEach(connector => {
            this.placeConnector(JSON.parse(connector));
        });
    },
    
    placeAtom: function(atomObj, moleculeList){
        
        //Place the atom - note that types not listed in availableTypes will not be placed with no warning (ie go up one level)
        availableTypes.forEach(type => {
            if (type.atomType == atomObj.atomType){
                var atom = type.create({
                    parent: this,
                    name: type.name,
                    atomType: type.atomType,
                    uniqueID: generateUniqueID()
                });
                
                //Add all of the passed attributes into the object
                for(var key in atomObj) atom[key]=atomObj[key];
                
                //If this is a molecule, deserialize it
                if(atom.atomType == "Molecule" && moleculeList != null){
                    atom.deserialize(moleculeList, atom.uniqueID);
                }
                
                this.nodesOnTheScreen.push(atom);
            }
        });
        
        if(atomObj.atomType == "Output"){
            //re-asign output ID numbers if a new one is supposed to be placed
            this.nodesOnTheScreen.forEach(atom => {
                if(atom.atomType == "Output"){
                    atom.setID(atomObj.uniqueID);
                }
            });
        }
    },
    
    placeConnector: function(connectorObj){
        var connector;
        var cp1NotFound = true;
        var cp2NotFound = true;
        var ap2;
        
        
        console.log("Looking for: " + connectorObj.ap1ID + " or " + connectorObj.ap2ID + " in:");
        console.log(this.nodesOnTheScreen);
        
        this.nodesOnTheScreen.forEach(atom => {
            //Find the output node
            
            if (atom.uniqueID == connectorObj.ap1ID){
                atom.children.forEach(child => {
                    if(child.name == connectorObj.ap1Name && child.type == "output"){
                        //console.log("AP1 found");
                        connector = Connector.create({
                            atomType: "Connector",
                            attachmentPoint1: child,
                            parentMolecule:  atom
                        });
                        cp1NotFound = false;
                    }
                });
            }
            //Find the input node
            if (atom.uniqueID == connectorObj.ap2ID){
                atom.children.forEach(child => {
                    if(child.name == connectorObj.ap2Name && child.type == "input"){
                        //console.log("AP2 Found");
                        cp2NotFound = false;
                        ap2 = child;
                    }
                });
            }
        });
        
        if(cp1NotFound || cp2NotFound){
            console.log("Unable to create connector");
            return;
        }
        
        connector.attachmentPoint2 = ap2;
        
        //Store the connector
        connector.attachmentPoint1.connectors.push(connector);
        
        //Update the connection
        connector.attachmentPoint1.parentMolecule.updateCodeBlock();
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