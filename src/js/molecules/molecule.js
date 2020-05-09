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
         * A list of things which should be displayed on the the top level sideBar when in toplevel mode.
         * @type {array}
         */
        this.runModeSidebarAdditions = []
        
        this.setValues(values)
        
        //Add the molecule's output
        this.placeAtom({
            parentMolecule: this, 
            x: GlobalVariables.pixelsToWidth(GlobalVariables.canvas.width - 20),
            y: GlobalVariables.pixelsToHeight(GlobalVariables.canvas.height/2),
            parent: this,
            name: 'Output',
            atomType: 'Output'
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
        super.draw() //Super call to draw the rest
        
        //draw the circle in the middle
        GlobalVariables.c.beginPath()
        GlobalVariables.c.fillStyle = this.centerColor
        GlobalVariables.c.arc(GlobalVariables.widthToPixels(this.x), GlobalVariables.heightToPixels(this.y), GlobalVariables.widthToPixels(this.radius)/2, 0, Math.PI * 2, false)
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
            GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(atom => {
                atom.selected = false
            })
            GlobalVariables.currentMolecule = this //set this to be the currently displayed molecule
            GlobalVariables.currentMolecule.backgroundClick()
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
        this.selected = true
        this.updateSidebar()
        this.sendToRender()
    }

    /**
     * Pushes serialized atoms into array if selected
     */
    copy(){
        this.nodesOnTheScreen.forEach(atom => {
            if(atom.selected){
                GlobalVariables.atomsToCopy.push(atom.serialize())
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
    updateValue(){
        this.output.waitOnComingInformation()
        if(this.inputs.every(x => x.ready)){
            
            this.clearAlert()
            
            //Grab values from the inputs and push them out to the input objects
            this.inputs.forEach(moleculeInput => {
                this.nodesOnTheScreen.forEach(atom => {
                    if(atom.atomType == 'Input' && moleculeInput.name == atom.name){
                        if(atom.getOutput() != moleculeInput.getValue() && atom.output.connectors.length > 0){//Don't update the input if it hasn't changed
                            //Sets to true processing variable??
                            this.processing = true
                            atom.updateValue()
                        }
                    }
                })
            })
        }
    }
    
    /**
     * Trigger the output to propogate.
     */ 
    propogate(){
        //Set the output nodes with type 'geometry' to be the generated code
        if(this.output){
            this.output.setValue(this.value)
        }
        
        //If this molecule is selected, send the updated value to the renderer
        if(this.selected){
            this.sendToRender()
        }
    }
    
    /**
     * Walks through each of the atoms in this molecule and begins propogation from them if they have no inputs to wait for
     */ 
    beginPropogation(){
        //Run for this molecule
        super.beginPropogation()
        
        //Catch the corner case where this has no inputs which means it won't be marked as processing by super
        if(this.inputs.length == 0){
            this.processing = true
        }
        
        // Run for every atom in this molecule
        this.nodesOnTheScreen.forEach(node => {
            node.beginPropogation()
        })
        
    }
    
    /**
     * Updates the side bar to display options like 'go to parent' and 'load a different project'. What is displayed depends on if this atom is the top level, and if we are using run mode.
     */ 
    updateSidebar(){
        //Update the side bar to make it possible to change the molecule name
        
        var valueList = super.initializeSideBar() 
        
        this.createEditableValueListItem(valueList,this,'name','Name', false)

        if(this.topLevel){
            //If we are the top level molecule 
            this.createSegmentSlider(valueList)

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
        
        this.displaySimpleBOM(valueList)
        
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
        rangeElement.setAttribute('min', '.1')
        rangeElement.setAttribute('max', '10')
        rangeElement.setAttribute('step', '.3')
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
        
        if(this.value != null){
            try{
                extractBomTags(this.value).then(bomList => {
                    
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
                })
            }catch(err){
                this.setAlert("Unable to read BOM")
            }
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
            
            var div = document.createElement('h2')
            div.setAttribute('style','text-align:center;')
            list.appendChild(div)
            var valueText = document.createTextNode('ReadMe')
            div.appendChild(valueText)
            
            var x = document.createElement('HR')
            list.appendChild(x)
            
            this.createMarkdownListItem(list,readmeContent)
        }
    }
    
    /**
     * Replace the currently displayed molecule with the parent of this molecule...moves the user up one level.
     */
    goToParentMolecule(){
        //Go to the parent molecule if there is one
        if(!GlobalVariables.currentMolecule.topLevel){
            this.nodesOnTheScreen.forEach(atom => {
                atom.selected = false
            })
            GlobalVariables.currentMolecule = GlobalVariables.currentMolecule.parent //set parent this to be the currently displayed molecule
            GlobalVariables.currentMolecule.backgroundClick()
        }
    }
    
    /**
     * Check to see if any of this molecules children have contributions to make to the README file. Children closer to the top left will be applied first. TODO: No contribution should be made if it's just a title.
     */
    requestReadme(){
        var generatedReadme = super.requestReadme()
        generatedReadme.push('## ' + this.name)
        
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
        
        return thisAsObject
    }
    
    /**
     * Load the children of this from a JSON representation
     * @param {object} json - A json representation of the molecule
     */
    deserialize(json){
        //Find the target molecule in the list
        let promiseArray = []
        
        this.setValues(json) //Grab the values of everything from the passed object
        
        if(json.allAtoms){
            json.allAtoms.forEach(atom => { //Place the atoms
                const promise = this.placeAtom(atom, false)
                promiseArray.push(promise)
            })
        }
        
        return Promise.all(promiseArray).then( ()=> { //Once all the atoms are placed we can finish
            
            //Place the connectors
            if(json.allConnectors){
                json.allConnectors.forEach(connector => {
                    this.placeConnector(connector)
                })
            }
            
            this.setValues([])//Call set values again with an empty list to trigger loading of IO values from memory
            if(this.topLevel){
                this.backgroundClick()
                this.beginPropogation()
            }
        })
    }
    
    /**
     * Dump the stored copies of any geometry in this molecule to free up ram.
     */ 
    dumpBuffer(keepThisValue){
        
        //Preserve the output of this molecule if we need to keep using it
        if(!keepThisValue){
            super.dumpBuffer()
        }
        
        this.nodesOnTheScreen.forEach(atom => {
            atom.dumpBuffer()
        })
    }
    
    /**
     * Places a new atom inside the molecule
     * @param {object} newAtomObj - An object defining the new atom to be placed
     * @param {array} moleculeList - Only passed if we are placing an instance of Molecule.
     * @param {object} typesList - A dictionary of all of the available types with references to their constructors
     * @param {boolean} unlock - A flag to indicate if this atom should spawn in the unlocked state.
     */
    async placeAtom(newAtomObj, unlock){
        
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
                    
                    //If this is an output, check to make sure there are no existing outputs, and if there are delete the existing one because there can only be one
                    if(atom.atomType == 'Output'){
                        //Check for existing outputs
                        this.nodesOnTheScreen.forEach(atom => {
                            if(atom.atomType == 'Output'){
                                atom.deleteOutputAtom() //Remove them
                            }
                        })
                    }
                    
                    //If this is a github molecule load it from the web
                    if(atom.atomType == 'GitHubMolecule'){
                        promise = atom.loadProjectByID(atom.projectID)
                    }
                    
                    //Add the atom to the list to display
                    this.nodesOnTheScreen.push(atom)
                    
                    if(unlock){
                        
                        //Make this molecule spawn with all of it's parent's inputs
                        if(atom.atomType == 'Molecule'){ //Not GitHubMolecule
                            atom.copyInputsFromParent()
                        }
                        
                        //Make begin propogation from an atom when it is placed
                        if(promise != null){
                            promise.then( ()=> {
                                atom.beginPropogation()
                            })
                        }
                        else{
                            atom.beginPropogation()
                        }
                        
                        //Fake a click on the newly placed atom
                        const downEvt = new MouseEvent('mousedown', {
                            clientX: atom.x,
                            clientY: atom.y
                        })
                        const upEvt = new MouseEvent('mouseup', {
                            clientX: atom.x,
                            clientY: atom.y
                        })
                        
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
            var connector = new Connector({
                atomType: 'Connector',
                attachmentPoint1: outputAttachmentPoint,
                attachmentPoint2: inputAttachmentPoint,
            })
            connector.attachmentPoint1.connectors.push(connector)   //Give input and output references to the connector (this should probably happen in the connector constructor)
            connector.attachmentPoint2.connectors.push(connector)
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
                GlobalVariables.ask({values: [this.value], key: "bounding box"}).then(result => {
                    if (result != -1 ){
                        GlobalVariables.display.zoomCameraToFit(result)
                    }else{
                        console.warn("Unable to compute bounding box")
                    }
                })
            }
        }
    }
}