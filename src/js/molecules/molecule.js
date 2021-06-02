import Atom from '../prototypes/atom.js'
import Connector from '../prototypes/connector.js'
import GlobalVariables from '../globalvariables.js'
//import saveAs from '../lib/FileSaver.js'
import { extractBomTags } from '../BOM.js'

/**
 * This class creates the Molecule atom.
 */
export default class Molecule extends Atom{
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        
        super(values)
        
        /** 
         * A list of all of the atoms within this Molecule which should be drawn on the screen as objects.
         * @type {array}
         */
        this.nodesOnTheScreen = []
        /** 
         * An array of the molecules inputs. Is this not inherited from atom?
         * @type {array}
         */
        this.inputs = []
        /** 
         * This atom's type
         * @type {string}
         */
        this.name = 'Molecule'
        /** 
         * A description of this atom
         * @type {string}
         */
        this.description = "Molecules provide an organizational structure to contain atoms. Double click on a molecule to enter it. Use the up arrow in the upper right hand corner of the screen to go up one level."
        /** 
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Molecule'
        /** 
         * The color for the middle dot in the molecule
         * @type {string}
         */
        this.centerColor = '#949294'
        /** 
         * A flag to indicate if this molecule is the top level molecule.
         * @type {boolean}
         */
        this.topLevel = false
        /** 
         * A flag to indicate if this molecule should simplify it's output.
         * @type {boolean}
         */
        this.simplify = false
        /** 
         * A list of things which should be displayed on the the top level sideBar when in toplevel mode.
         * @type {array}
         */
        this.runModeSidebarAdditions = []
        
        /** 
         * The total number of atoms contained in this molecule
         * @type {integer}
         */
        this.totalAtomCount = 1
        /** 
         * The total number of atoms contained in this molecule which are waiting to process
         * @type {integer}
         */
        this.toProcess = 0
        /**
         * A flag to indicate if this molecule was waiting propagation. If it is it will take place
         *the next time we go up one level.
         * @type {number}
         */
        this.awaitingPropagationFlag = false
        
        this.setValues(values)
        
        //Add the molecule's output
        this.placeAtom({
            parentMolecule: this, 
            x: GlobalVariables.pixelsToWidth(GlobalVariables.canvas.width - 20),
            y: GlobalVariables.pixelsToHeight(GlobalVariables.canvas.height/2),
            parent: this,
            name: 'Output',
            atomType: 'Output',
            uniqueID: GlobalVariables.generateUniqueID()
        }, false)
    }
    
    /**
     * Gives this molecule inputs with the same names as all of it's parent's inputs
     */ 
    copyInputsFromParent(){
        if(this.parent){
            this.parent.nodesOnTheScreen.forEach(node => {
                if(node.atomType == "Input"){
                    this.placeAtom({
                        parentMolecule: this,
                        y: node.y,
                        parent: this,
                        name: node.name,
                        atomType: 'Input',
                        uniqueID: GlobalVariables.generateUniqueID()
                    }, null, GlobalVariables.availableTypes, true)
                }
            })
        } 
    }
    
    /**
     * Add the center dot to the molecule
     */ 
    draw(){
        const percentLoaded = 1-this.toProcess/this.totalAtomCount
        if(this.toProcess > 1){
            this.processing = true
        }
        else{
            this.processing = false
        }
        
        super.draw() //Super call to draw the rest
        
        //draw the circle in the middle
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = this.centerColor
        GlobalVariables.c.moveTo(GlobalVariables.widthToPixels(this.x), GlobalVariables.heightToPixels(this.y))
        GlobalVariables.c.arc(GlobalVariables.widthToPixels(this.x), GlobalVariables.heightToPixels(this.y), GlobalVariables.widthToPixels(this.radius)/2, 0, percentLoaded*Math.PI * 2, false)
        GlobalVariables.c.closePath()
        GlobalVariables.c.fill()
    }
    
    /**
     * Set the atom's response to a mouse click up. If the atom is moving this makes it stop moving.
     * @param {number} x - The X cordinate of the click
     * @param {number} y - The Y cordinate of the click
     */ 
    clickUp(x,y){
        super.clickUp(x,y)
        GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(atom =>{
            atom.isMoving = false
        })
    }

    /**
     * Handle double clicks by replacing the molecule currently on the screen with this one, esentially diving into it.
     * @param {number} x - The x cordinate of the click
     * @param {number} y - The y cordinate of the click
     */ 
    doubleClick(x,y){
        //returns true if something was done with the click
        x = GlobalVariables.pixelsToWidth(x)
        y = GlobalVariables.pixelsToHeight(y)
        
        var clickProcessed = false
        
        var distFromClick = GlobalVariables.distBetweenPoints(x, this.x, y, this.y)
        
        if (distFromClick < this.radius*2){
            GlobalVariables.currentMolecule = this //set this to be the currently displayed molecule
            GlobalVariables.currentMolecule.backgroundClick()
            /**
            * Deselects Atom
            * @type {boolean}
            */
            this.selected = false
            clickProcessed = true
        }
        
        return clickProcessed 
    }
    
    /**
     * Handle a background click (a click which doesn't land on one of the contained molecules) by deselected everything and displaying a 3D rendering of this molecules output.
     */ 
    backgroundClick(){
        /**
         * Flag that the atom is now selected.
         */
        if(this.selected == false){
            this.selected = true
            this.updateSidebar()
            this.sendToRender()   //This is might need to be removed because it was happening too often during loading
        }
    }

    /**
     * Pushes serialized atoms into array if selected
     */
    copy(){
        this.nodesOnTheScreen.forEach(atom => {
            if(atom.selected){
                GlobalVariables.atomsSelected.push(atom.serialize())
            }
        })
    }
    
    /**
     * Unselect this molecule
     */ 
    deselect(){
        this.selected = false

    }
    
    /**
     * Grab values from the inputs and push them out to the input atoms.
     */ 
    updateValue(targetName){
        
        //Molecules are fully transparent so we don't wait for all of the inputs to begin processing the things inside
        
        //Tell the correct input to update
        this.nodesOnTheScreen.forEach(atom => { //Scan all the input atoms
            if(atom.atomType == 'Input' && atom.name == targetName){  //When there is a match
                atom.updateValue() //Tell that input to update it's value
            }
        })
    }
    
    /**
     * Called when this molecules value changes
     */ 
    propogate(){
        //Set the output nodes with type 'geometry' to be the generated code
        if(this.simplify){
            try{
                this.processing = true
                const values = {key: "simplify", readPath: this.inputPath, writePath: this.path}
                window.ask(values).then( () => {
                    this.processing = false
                    this.pushPropogation();
                })
            }catch(err){this.setAlert(err)}
        }
        else{
            this.pushPropogation();
        }
    }
    
    /**
     * Called when this molecules value changes
     */ 
    pushPropogation(){
        if(this != GlobalVariables.currentMolecule){
            this.output.setValue(this.path)
            this.output.ready = true
        }
        else{
            this.awaitingPropagationFlag = true
        }
        
        //If this molecule is selected, send the updated value to the renderer
        if(this.selected){
            this.sendToRender()
        }
    }
    
    /**
     * Walks through each of the atoms in this molecule and begins Propagation from them if they have no inputs to wait for
     */ 
    beginPropagation(){
        
        //Tell every atom inside this molecule to begin Propagation
        this.nodesOnTheScreen.forEach(node => {
            node.beginPropagation()
        })
        
        //Generate the simplified path if needed
        if(this.simplify){
            /** 
             * Keeps a reference to the input path
             * @type {string}
             */
            this.inputPath = this.path
            this.generatePath()
        }
    }
    
    /**
     * Walks through each of the atoms in this molecule and takes a census of how many there are and how many are currently waiting to be processed.
     */
    census(){
        this.totalAtomCount = 0
        this.toProcess = 0
        
        this.nodesOnTheScreen.forEach(atom => {
            const newInformation = atom.census()
            this.totalAtomCount = this.totalAtomCount + newInformation[0]
            this.toProcess      = this.toProcess + newInformation[1]
        })
        
        if(this.topLevel && this.selected){
            this.updateSidebar()
        }
        
        return [this.totalAtomCount, this.toProcess]
    }
    
    /**
     * Called when the simplify check box is checked or unchecked.
     */
    setSimplifyFlag(anEvent){
        this.simplify = anEvent.target.checked
        if(this.simplify){
            this.inputPath = this.path
            this.generatePath() //Resets the molecule path to be something unique
        }
        else{  //Changes the path back to be the output atom
            this.nodesOnTheScreen.forEach(atom => {
                if(atom.atomType == "Output"){
                    this.path = atom.loadTree()
                }
            })
        }
        this.propogate()
    }
    
    /**
     * Updates the side bar to display options like 'go to parent' and 'load a different project'. What is displayed depends on if this atom is the top level, and if we are using run mode.
     */ 
    updateSidebar(){
        //Update the side bar to make it possible to change the molecule name
        
        var valueList = super.initializeSideBar() 

        if(!this.topLevel){
            this.createEditableValueListItem(valueList,this,'name','Name', false)
        }
        else if(this.topLevel){
            //If we are the top level molecule 
            this.createSegmentSlider(valueList)
        }
        
        //Display the percent loaded while loading
        const percentLoaded = 100*(1-this.toProcess/this.totalAtomCount)
        if(this.toProcess > 0 && this.topLevel){
            this.createNonEditableValueListItem(valueList,{percentLoaded:percentLoaded.toFixed(0) + "%"},"percentLoaded",'Loading')
        }
        
        //removes 3d view menu on background click
        let viewerBar = document.querySelector('#viewer_bar')
        if(viewerBar && viewerBar.firstChild){
            while (viewerBar.firstChild) {
                viewerBar.removeChild(viewerBar.firstChild)
                viewerBar.setAttribute('style', 'background-color:none;')
            }
        }
        
        
        
        //Add options to set all of the inputs
        this.inputs.forEach(child => {
            if(child.type == 'input' && child.valueType != 'geometry'){
                this.createEditableValueListItem(valueList,child,'value', child.name, true)
            }
        })
        
        //Add the check box to simplify
        this.createCheckbox(valueList,"Simplify output",this.simplify,(anEvent)=>{this.setSimplifyFlag(anEvent)})
        
        //Only bother to generate the bom if we are not currently processing data
        if(this.toProcess == 0){
            this.displaySimpleBOM(valueList)
        }
        
        this.displaySidebarReadme(valueList)
        
        return valueList
        
    }

    /**
     * Creates segment length slider and passes value to Global Variables
     */ 
    createSegmentSlider(valueList){
        //Creates value slider
        var rangeElement = document.createElement('input')
        //Div which contains the entire element
        var div = document.createElement('div')
        div.setAttribute('class', 'slider-container')
        valueList.appendChild(div)
        var rangeLabel = document.createElement('label')
        rangeLabel.textContent = "Display quality/Length of Segments"
        div.appendChild(rangeLabel)
        rangeLabel.appendChild(rangeElement)
        rangeElement.setAttribute('type', 'range')
        rangeElement.setAttribute('min', '.001')
        rangeElement.setAttribute('max', '1')
        rangeElement.setAttribute('step', '.05')
        rangeElement.setAttribute('class', 'slider')
        rangeElement.setAttribute('value', GlobalVariables.circleSegmentSize)
            
        var rangeValueLabel = document.createElement('ul')
        rangeValueLabel.innerHTML= '<li>Export</li><li>Draft</li> '
        rangeValueLabel.setAttribute('class', 'range-labels')
        rangeLabel.appendChild(rangeValueLabel)

        var rangeValue = document.createElement('p')
        rangeValue.textContent = rangeElement.value
        rangeLabel.appendChild(rangeValue)


        //on slider change send value to global variables
        rangeElement.oninput = function() {
            rangeValue.textContent = this.value
            GlobalVariables.circleSegmentSize = this.value
            
        }
        
        rangeElement.addEventListener('mouseup', () => {
            GlobalVariables.topLevelMolecule.refreshCircles()
        })
    }
    
    /**
     * Used to trigger all of the circle atoms within a molecule and all of the molecules within it to update their value. Used when the number of segments changes.
     */ 
    refreshCircles(){
        this.nodesOnTheScreen.forEach(atom => {
            if(atom.atomType == "Circle"){
                atom.updateValue()
            }
            else if(atom.atomType == "Molecule" || atom.atomType == "GitHubMolecule"){
                atom.refreshCircles()
            }
        })
    }
    
    /**
     * Creates a simple BOM list which cannot be edited. The generated element is added to the passed list.
     * @param {object} list - The HTML object to append the created element to.
     */ 
    displaySimpleBOM(list){
        try{
            
            const placementFunction = (bomList) => {
                
                if(bomList.length > 0){
                
                    list.appendChild(document.createElement('br'))
                    list.appendChild(document.createElement('br'))
                    
                    var div = document.createElement('h3')
                    div.setAttribute('style','text-align:center;')
                    list.appendChild(div)
                    var valueText = document.createTextNode('Bill Of Materials')
                    div.appendChild(valueText)
                    
                    var x = document.createElement('HR')
                    list.appendChild(x)
                    
                    bomList.forEach(bomEntry => {
                        this.createNonEditableValueListItem(list,bomEntry,'numberNeeded', bomEntry.BOMitemName, false)
                    })
                }
            }
            
            extractBomTags(this.path, placementFunction)
            
        }catch(err){
            this.setAlert("Unable to read BOM")
        }
    }
    
    /**
     * Creates markdown version of the readme content for this atom in the sidebar
     * @param {object} list - The HTML object to append the created element to.
     */ 
    displaySidebarReadme(list){
        
        
        var readmeContent = ""
        
        this.requestReadme().forEach(item => {
            
            readmeContent = readmeContent + item + "\n\n\n"
        })
        
        if(readmeContent.length > 0){    //If there is anything to say
        
            list.appendChild(document.createElement('br'))
            list.appendChild(document.createElement('br'))

            var div = document.createElement('h3')
            div.setAttribute('style','float:right;')
           
            list.appendChild(div)
            var valueText = document.createTextNode(`- ReadMe`)
            div.appendChild(valueText)
            
            var x = document.createElement('HR')
            x.setAttribute('style','width:100%;')
            list.appendChild(x)
            
            this.createMarkdownListItem(list,readmeContent)
        }
    }
    
    /**
     * Replace the currently displayed molecule with the parent of this molecule...moves the user up one level.
     */
    goToParentMolecule(){
        //Go to the parent molecule if there is one
        if(!this.topLevel){
            this.nodesOnTheScreen.forEach(atom => {
                atom.selected = false
            })
            
            GlobalVariables.currentMolecule = this.parent //set parent this to be the currently displayed molecule
            GlobalVariables.currentMolecule.backgroundClick()
            
            //Push any changes up to the next level if there are any changes waiting in the output
            if(this.awaitingPropagationFlag == true){
                this.propogate()
                this.awaitingPropagationFlag = false
            }
        }
    }
    
    /**
     * Check to see if any of this molecules children have contributions to make to the README file. Children closer to the top left will be applied first. TODO: No contribution should be made if it's just a title.
     */
    requestReadme(){
        var generatedReadme = super.requestReadme()
        
        var sortableAtomsList = this.nodesOnTheScreen
        sortableAtomsList.sort(function(a, b){return GlobalVariables.distBetweenPoints(a.x, 0, a.y, 0)-GlobalVariables.distBetweenPoints(b.x, 0, b.y, 0)})
        
        sortableAtomsList.forEach(atom => {
            generatedReadme = generatedReadme.concat(atom.requestReadme())
        })
        
        //Check to see if any of the children added anything if not, remove the bit we added
        if(generatedReadme[generatedReadme.length - 1] == '## ' + this.name){
            generatedReadme.pop()
        }
        
        return generatedReadme
    }
    
    /**
     * Generates and returns a object represntation of this molecule and all of its children.
     */
    serialize(){
        
        var allAtoms = [] //An array of all the atoms contained in this molecule
        var allConnectors = [] //An array of all the connectors contained in this molecule
        
        this.nodesOnTheScreen.forEach(atom => {
            //Store a representation of the atom
            allAtoms.push(atom.serialize())
            //Store a representation of the atom's connectors
            if(atom.output){
                atom.output.connectors.forEach(connector => {
                    allConnectors.push(connector.serialize())
                })
            }
        })
        
        var thisAsObject = super.serialize()    //Do the atom serialization to create an object, then add all the bits of this one to it
        thisAsObject.topLevel = this.topLevel
        thisAsObject.allAtoms = allAtoms
        thisAsObject.allConnectors = allConnectors
        thisAsObject.fileTypeVersion = 1
        thisAsObject.simplify= this.simplify
        
        return thisAsObject
    }
    
    /**
     * Load the children of this from a JSON representation
     * @param {object} json - A json representation of the molecule
     * @param {object} values - An array of values to apply to this molecule before deserializing it's contents. Used by githubmolecules to set top level correctly
     */
    deserialize(json, values = {}){
        //Find the target molecule in the list
        let promiseArray = []
        
        this.setValues(json) //Grab the values of everything from the passed object
        this.setValues(values) //Over write those values with the passed ones where needed
        
        if(json.allAtoms){
            json.allAtoms.forEach(atom => { //Place the atoms
                const promise = this.placeAtom(atom, false)
                promiseArray.push(promise)
                this.setValues([]) //Call set values again with an empty list to trigger loading of IO values from memory
            })
        }
        
        return Promise.all(promiseArray).then( ()=> { //Once all the atoms are placed we can finish
            
            this.setValues([])//Call set values again with an empty list to trigger loading of IO values from memory
            
            //Place the connectors
            if(json.allConnectors){
                json.allConnectors.forEach(connector => {
                    this.placeConnector(connector)
                })
            }
            
            if(this.topLevel){
                
                GlobalVariables.totalAtomCount = GlobalVariables.numberOfAtomsToLoad
                
                this.census()
                this.loadTree()  //Walks back up the tree from this molecule loading input values from any connected atoms
                
                const splits = this.path.split('/')
                const values = {key: "getPathsList", prefacePath: splits[0]+'/'+splits[1]}
                window.ask(values).then( answer => {
                    
                    GlobalVariables.availablePaths = answer
                    this.beginPropagation()
                    
                })
                this.backgroundClick()
            }
        })
    }
    
    /**
     * Delete this molecule and everything in it.
     */ 
    deleteNode(){
        
        //make a copy of the nodes on the screen array since we will be modifying it
        const copyOfNodesOnTheScreen = [...this.nodesOnTheScreen]
        
        copyOfNodesOnTheScreen.forEach(node => {
            node.deleteNode()
        })
        
        super.deleteNode()
    }
    
    /**
     * Triggers the loadTree process from this molecules output
     */ 
    loadTree(){
        //We want to walk the tree from this's output and anything which has nothing coming out of it. Basically all the graph end points.
        
        this.nodesOnTheScreen.forEach(atom => {
            //If we have found this molecule's output atom use it to update the path here
            if(atom.atomType == "Output"){
                this.path = atom.loadTree()
                this.inputPath = this.path
            }
            //If we have found an atom with nothing connected to it
            if(atom.output){
                if(atom.output.connectors.length == 0){
                    atom.loadTree()
                }
            }
        })
        
        this.output.value = this.path
        return this.path
    }
    
    /**
     * Places a new atom inside the molecule
     * @param {object} newAtomObj - An object defining the new atom to be placed
     * @param {array} moleculeList - Only passed if we are placing an instance of Molecule.
     * @param {object} typesList - A dictionary of all of the available types with references to their constructors
     * @param {boolean} unlock - A flag to indicate if this atom should spawn in the unlocked state.
     */
    async placeAtom(newAtomObj, unlock){
        
        GlobalVariables.numberOfAtomsToLoad = GlobalVariables.numberOfAtomsToLoad + 1 //Indicate that one more atom needs to be loaded
        
        try{
            var promise = null
            
            for(var key in GlobalVariables.availableTypes) {
                if (GlobalVariables.availableTypes[key].atomType == newAtomObj.atomType){
                    newAtomObj.parent = this
                    var atom = new GlobalVariables.availableTypes[key].creator(newAtomObj)
                    
                    //reassign the name of the Inputs to preserve linking
                    if(atom.atomType == 'Input' && typeof newAtomObj.name !== 'undefined'){
                        atom.name = newAtomObj.name
                        atom.draw() //The poling happens in draw :roll_eyes:
                    }

                    //If this is a molecule, de-serialize it
                    if(atom.atomType == 'Molecule'){
                        promise = atom.deserialize(newAtomObj)
                    }
                    
                    //If this is a github molecule load it from the web
                    if(atom.atomType == 'GitHubMolecule'){
                        promise = atom.loadProjectByID(atom.projectID)
                        if(unlock){
                            promise.then( ()=> {
                                atom.beginPropagation()
                            })
                        }
                    }
                    
                    //If this is an output, check to make sure there are no existing outputs, and if there are delete the existing one because there can only be one
                    if(atom.atomType == 'Output'){
                        //Check for existing outputs
                        this.nodesOnTheScreen.forEach(atom => {
                            if(atom.atomType == 'Output'){
                                atom.deleteOutputAtom() //Remove them
                            }
                        })
                    }
                    
                    //Add the atom to the list to display
                    this.nodesOnTheScreen.push(atom)
                    
                    if(unlock){
                        
                        //Make this molecule spawn with all of it's parent's inputs
                        if(atom.atomType == 'Molecule'){ //Not GitHubMolecule
                            atom.copyInputsFromParent()
                        }
                        
                        //Make begin propagation from an atom when it is placed
                        // if(promise != null){
                        // promise.then( ()=> {
                        // atom.beginPropagation()
                        // })
                        // }
                        // else{
                        // atom.beginPropagation()
                        // }
                        
                        //Fake a click on the newly placed atom
                        const downEvt = new MouseEvent('mousedown', {
                            clientX: atom.x,
                            clientY: atom.y
                        })
                        const upEvt = new MouseEvent('mouseup', {
                            clientX: atom.x,
                            clientY: atom.y
                        })
                        
                        atom.updateValue()
                        
                        document.getElementById('flow-canvas').dispatchEvent(downEvt)
                        document.getElementById('flow-canvas').dispatchEvent(upEvt)
                    }
                }
            }
            return promise
        }catch(err){
            console.warn("Unable to place: " + newAtomObj)
            console.warn(err)
            return Promise.resolve()
        }

    }
    
    /**
     * Places a new connector within the molecule
     * @param {object} connectorObj - An object represntation of the connector specifying its inputs and outputs.
     */
    placeConnector(connectorObj){
        
        var outputAttachmentPoint = false
        var inputAttachmentPoint = false
        
        this.nodesOnTheScreen.forEach(atom => {             //Check each atom on the screen
            if (atom.uniqueID == connectorObj.ap1ID){           //When we have found the output atom
                outputAttachmentPoint = atom.output
            }
            if (atom.uniqueID == connectorObj.ap2ID){           //When we have found the input atom
                atom.inputs.forEach(input => {                  //Check each of its inputs
                    if(input.name == connectorObj.ap2Name){
                        inputAttachmentPoint = input                //Until we find the one with the right name
                    }
                })
            }
        })
        
        if(outputAttachmentPoint && inputAttachmentPoint){             //If we have found the output and input
            new Connector({
                atomType: 'Connector',
                attachmentPoint1: outputAttachmentPoint,
                attachmentPoint2: inputAttachmentPoint,
            })
        }
        else{
            console.warn("Unable to place connector")
        }
    }
    
    /**
     * Sends the output of this molecule to be displayed in the 3D view.
     */
    sendToRender(){
        super.sendToRender()
        if(this.value != null){
            if(this.topLevel){
                this.basicThreadValueProcessing(this.value, "bounding box")
            }
        }
    }
}