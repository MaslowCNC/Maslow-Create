import AttachmentPoint from './attachmentpoint'
import GlobalVariables from '../globalvariables'

export default class Atom {

    constructor(values){
        //Setup default values
        this.children = []
        
        this.x = 0
        this.y = 0
        this.radius = 20
        this.defaultColor = '#F3EFEF'
        this.selectedColor = '#484848'
        this.strokeColor = '#484848'
        this.selected = false
        this.color = '#F3EFEF'
        this.name = 'name'
        this.parentMolecule = null
        this.value = GlobalVariables.api.sphere()
        this.isMoving = false
        this.x = 0
        this.y = 0
        this.alertMessage = ''
        this.processing = false
        

        for(var key in values) {
            this[key] = values[key]
        }
        
    }
    
    setValues(values){
        //Assign the object to have the passed in values
        
        for(var key in values) {
            this[key] = values[key]
        }
        
        if (typeof this.ioValues !== 'undefined') {
            this.ioValues.forEach(ioValue => { //for each saved value
                this.children.forEach(io => {  //Find the matching IO and set it to be the saved value
                    if(ioValue.name == io.name && io.type == 'input'){
                        io.setValue(ioValue.ioValue)
                    }
                })
            })
        }
    }
    
    draw() {   
        this.children.forEach(child => {
            child.draw()       
        })
      
        if(this.processing){
            GlobalVariables.c.fillStyle = 'blue'
        }else{
            GlobalVariables.c.fillStyle = this.color
        }
        GlobalVariables.c.beginPath()
        GlobalVariables.c.font = '10px Work Sans'

        //make it impossible to draw atoms too close to the edge
        //not sure what x left margin should be because if it's too close it would cover expanded text
        var canvasFlow = document.querySelector('#flow-canvas')
        if (this.x < this.radius){
            this.x = this.radius
        }
        else if (this.y<this.radius){
            this.y = this.radius 
        }
        else if (this.x + this.radius > canvasFlow.width/GlobalVariables.scale1){
            this.x = canvasFlow.width/GlobalVariables.scale1 - this.radius
        }
        else if (this.y + this.radius > canvasFlow.height/GlobalVariables.scale1){
            this.y = canvasFlow.height/GlobalVariables.scale1 - this.radius
        }
        GlobalVariables.c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        GlobalVariables.c.textAlign = 'start' 
        GlobalVariables.c.fillText(this.name, this.x + this.radius, this.y-this.radius)
        GlobalVariables.c.fill()
        GlobalVariables.c.strokeStyle = this.strokeColor
        GlobalVariables.c.lineWidth = 1
        GlobalVariables.c.stroke()
        GlobalVariables.c.closePath()
      
        if (this.alertMessage.length > 0){
            //Draw Alert block  
            GlobalVariables.c.beginPath()
            const padding = 10
            GlobalVariables.c.fillStyle = 'red'
            GlobalVariables.c.rect(
                this.x + this.radius - padding/2, 
                this.y - this.radius + padding/2, 
                GlobalVariables.c.measureText(this.alertMessage).width + padding, 
                - (parseInt(GlobalVariables.c.font) + padding))
            GlobalVariables.c.fill()
            GlobalVariables.c.strokeStyle = 'black'
            GlobalVariables.c.lineWidth = 1
            GlobalVariables.c.stroke()
            GlobalVariables.c.closePath()

            GlobalVariables.c.beginPath()
            GlobalVariables.c.fillStyle = 'black'
            GlobalVariables.c.fillText(this.alertMessage, this.x + this.radius, this.y - this.radius) 
            GlobalVariables.c.closePath()
        }
    }
    
    addIO(type, name, target, valueType, defaultValue){
        
        if(target.children.find(o => (o.name === name && o.type === type))== undefined){ //Check to make sure there isn't already an IO with the same type and name
            //compute the baseline offset from parent node
            var offset
            if (type == 'input'){
                offset = -1* target.scaledRadius
            }
            else{
                offset = target.scaledRadius
            }
            var input = new AttachmentPoint({
                parentMolecule: target,
                defaultOffsetX: offset,
                defaultOffsetY: 0,
                type: type,
                valueType: valueType,
                name: name,
                value: defaultValue,
                defaultValue: defaultValue,
                uniqueID: GlobalVariables.generateUniqueID(),
                atomType: 'AttachmentPoint'
            })
            
            target.children.push(input)
        }
    }
    
    removeIO(type, name, target){
        //Remove the target IO attachment point
        
        target.children.forEach(io => {
            if(io.name == name && io.type == type){
                io.deleteSelf()
                target.children.splice(target.children.indexOf(io),1)
            }
        })
    }

    setAlert(message){
        this.color = 'orange'
        this.alertMessage = String(message)

    }

    clearAlert(){
        this.color = this.defaultColor
        this.alertMessage = ''
    }
    
    clickDown(x,y, clickProcessed){
        //Returns true if something was done with the click
        
        this.children.forEach(child => {
            if(child.clickDown(x,y, clickProcessed) == true){
                clickProcessed = true
            }
        })
        
        //If none of the children processed the click see if the atom should, if not clicked, then deselect
        if(!clickProcessed && GlobalVariables.distBetweenPoints(x, this.x, y, this.y) < this.radius){
            this.color = this.selectedColor
            this.isMoving = true
            this.selected = true
            this.strokeColor = this.defaultColor
            this.updateSidebar()
            this.sendToRender()
            clickProcessed = true
        }
        else{
            this.color = this.defaultColor
            this.strokeColor = this.selectedColor
            this.selected = false
        }
        
        return clickProcessed 
    }

    doubleClick(x,y){
        //returns true if something was done with the click
        
        
        var clickProcessed = false
        
        var distFromClick = GlobalVariables.distBetweenPoints(x, this.x, y, this.y)
        
        if (distFromClick < this.x){
            clickProcessed = true
        }
        
        return clickProcessed 
    }

    clickUp(x,y){
        this.isMoving = false
        
        this.children.forEach(child => {
            child.clickUp(x,y)     
        })
    }

    clickMove(x,y){
        if (this.isMoving == true){
            this.x = x
            this.y = y
        }
        
        this.children.forEach(child => {
            child.clickMove(x,y)       
        })
    }
    
    keyPress(key){
        //runs whenever a key is pressed
        if (['Delete', 'Backspace'].includes(key)){
            if(this.selected == true && document.getElementsByTagName('BODY')[0] == document.activeElement){
                //If this atom is selected AND the body is active (meaning we are not typing in a text box)
                this.deleteNode()
            }
        }
        
        this.children.forEach(child => {
            child.keyPress(key)
        })
    }
    
    updateSidebar(){
        //updates the sidebar to display information about this node
        
        var valueList = this.initializeSideBar()
        
        //Add options to set all of the inputs
        this.children.forEach(child => {
            if(child.type == 'input' && child.valueType != 'geometry'){
                this.createEditableValueListItem(valueList,child,'value', child.name, true)
            }
        })
        
        return valueList
    }
    
    initializeSideBar(){
        //remove everything in the sideBar now
        let sideBar = document.querySelector('.sideBar')
        while (sideBar.firstChild) {
            sideBar.removeChild(sideBar.firstChild)
        }
        
        //add the name as a title
        var name = document.createElement('h1')
        name.textContent = this.name
        name.setAttribute('class','doc-title')
        sideBar.appendChild(name)
        
        //Create a list element
        var valueList = document.createElement('ul')
        sideBar.appendChild(valueList)
        valueList.setAttribute('class', 'sidebar-list')
        
        return valueList
    }
    
    deleteNode(){
        //deletes this node and all of it's children
        
        this.children.forEach(child => {
            child.deleteSelf()       
        })
        
        this.parent.nodesOnTheScreen.splice(this.parent.nodesOnTheScreen.indexOf(this),1) //remove this node from the list
        
        GlobalVariables.currentMolecule.backgroundClick()
    }
    
    update() {
        
        this.children.forEach(child => {
            child.update()     
        })
        
        this.draw()
    }
    
    serialize(){
        
        var ioValues = []
        this.children.forEach(io => {
            if (typeof io.getValue() == 'number' && io.type == 'input'){
                var saveIO = {
                    name: io.name,
                    ioValue: io.getValue()
                }
                ioValues.push(saveIO)
            }
        })
        
        var object = {
            atomType: this.atomType,
            name: this.name,
            x: this.x,
            y: this.y,
            uniqueID: this.uniqueID,
            ioValues: ioValues
        }
        
        return object
    }
    
    requestReadme(){
        //request any contributions from this atom to the readme
        
        return []
    }
    
    updateValue(){
        this.displayAndPropogate()
    }
    
    displayAndPropogate(){
        //If this molecule is selected, send the updated value to the renderer
        if (this.selected){
            this.sendToRender()
        }
        
        //Set the output nodes with name 'geometry' to be the generated code
        this.children.forEach(child => {
            if(child.valueType == 'geometry' && child.type == 'output'){
                child.setValue(this.value)
            }
        })
    }
    
    basicThreadValueProcessing(values, key){
        this.processing = true
        
        const computeValue = async (values, key) => {
            try{
                return await GlobalVariables.ask({values: values, key: key})
            }
            catch(err){
                this.setAlert(err)
            }
        }
        
        this.clearAlert()
        
        computeValue(values, key).then(result => {
            if (result != -1 ){
                this.value = GlobalVariables.api.Shape.fromGeometry(result)
                this.displayAndPropogate()
            }else{
                this.setAlert("Unable to compute")
            }
            this.processing = false
        })
    }
    
    sendToRender(){
        //Send code to JSxCAD to render
        try{
            GlobalVariables.display.writeToDisplay(this.value)
        }
        catch(err){
            this.setAlert(err)    
        }

    }
    
    findIOValue(ioName){
        //find the value of an input for a given name
        
        ioName = ioName.split('~').join('')
        var ioValue = null
        
        this.children.forEach(child => {
            if(child.name == ioName && child.type == 'input'){
                ioValue = child.getValue()
            }
        })
        
        return ioValue
    }
    
    createEditableValueListItem(list,object,key, label, resultShouldBeNumber, callBack){
        var listElement = document.createElement('LI')
        list.appendChild(listElement)
        
        
        //Div which contains the entire element
        var div = document.createElement('div')
        listElement.appendChild(div)
        div.setAttribute('class', 'sidebar-item sidebar-editable-div')
        
        //Left div which displays the label
        var labelDiv = document.createElement('div')
        div.appendChild(labelDiv)
        var labelText = document.createTextNode(label + ':')
        labelDiv.appendChild(labelText)
        labelDiv.setAttribute('class', 'sidebar-subitem label-item')
        
        
        //Right div which is editable and displays the value
        var valueTextDiv = document.createElement('div')
        div.appendChild(valueTextDiv)
        var valueText = document.createTextNode(object[key])
        valueTextDiv.appendChild(valueText)
        valueTextDiv.setAttribute('contenteditable', 'true')
        valueTextDiv.setAttribute('class', 'sidebar-subitem editing-item')
        var thisID = label+GlobalVariables.generateUniqueID()
        valueTextDiv.setAttribute('id', thisID)
        
        
        document.getElementById(thisID).addEventListener('focusout', () => {
            var valueInBox = document.getElementById(thisID).textContent
            if(resultShouldBeNumber){
                valueInBox = parseFloat(valueInBox)
            }
            
            //If the target is an attachmentPoint then call the setter function
            if(object instanceof AttachmentPoint){
                object.setValue(valueInBox)
            }
            else{
                object[key] = valueInBox
                callBack(valueInBox)
            }
        })
        
        //prevent the return key from being used when editing a value
        document.getElementById(thisID).addEventListener('keypress', function(evt) {
            if (evt.which === 13) {
                evt.preventDefault()
                document.getElementById(thisID).blur()  //shift focus away if someone presses enter
            }
        })

    }
    
    createNonEditableValueListItem(list,object,key, label){
        var listElement = document.createElement('LI')
        list.appendChild(listElement)
        
        
        //Div which contains the entire element
        var div = document.createElement('div')
        listElement.appendChild(div)
        div.setAttribute('class', 'sidebar-item sidebar-editable-div')
        
        //Left div which displays the label
        var labelDiv = document.createElement('div')
        div.appendChild(labelDiv)
        var labelText = document.createTextNode(label + ':')
        labelDiv.appendChild(labelText)
        labelDiv.setAttribute('class', 'sidebar-subitem label-item')
        
        
        //Right div which is editable and displays the value
        var valueTextDiv = document.createElement('div')
        div.appendChild(valueTextDiv)
        var valueText = document.createTextNode(object[key])
        valueTextDiv.appendChild(valueText)
        valueTextDiv.setAttribute('contenteditable', 'false')
        valueTextDiv.setAttribute('class', 'sidebar-subitem noediting-item')
        var thisID = label+GlobalVariables.generateUniqueID()
        valueTextDiv.setAttribute('id', thisID)
        

    }

    createDropDown(list,parent,options,selectedOption, description){
        var listElement = document.createElement('LI')
        list.appendChild(listElement)
        
        
        //Div which contains the entire element
        var div = document.createElement('div')
        listElement.appendChild(div)
        div.setAttribute('class', 'sidebar-item')
        
        //Left div which displays the label
        var labelDiv = document.createElement('div')
        div.appendChild(labelDiv)
        var labelText = document.createTextNode(description)
        labelDiv.appendChild(labelText)
        labelDiv.setAttribute('class', 'sidebar-subitem')
        
        
        //Right div which is editable and displays the value
        var valueTextDiv = document.createElement('div')
        div.appendChild(valueTextDiv)
        var dropDown = document.createElement('select')
        options.forEach(option => {
            var op = new Option()
            op.value = options.findIndex(thisOption => thisOption === option)
            op.text = option
            dropDown.options.add(op)
        })
        valueTextDiv.appendChild(dropDown)
        valueTextDiv.setAttribute('class', 'sidebar-subitem')
        
        dropDown.selectedIndex = selectedOption //display the current selection
        
        dropDown.addEventListener(
            'change',
            function() { parent.changeEquation(dropDown.value) },
            false
        )
    }

    createButton(list,parent,buttonText,functionToCall){
        var listElement = document.createElement('LI')
        list.appendChild(listElement)
        
        
        //Div which contains the entire element
        var div = document.createElement('div')
        listElement.appendChild(div)
        div.setAttribute('class', 'sidebar-item-no-hover')
        
        
        //Right div which is button
        var valueTextDiv = document.createElement('div')
        div.appendChild(valueTextDiv)
        var button = document.createElement('button')
        var buttonTextNode = document.createTextNode(buttonText)
        button.setAttribute('class', 'sidebar_button')
        button.appendChild(buttonTextNode)
        valueTextDiv.appendChild(button)
        valueTextDiv.setAttribute('class', 'sidebar-subitem')
        
        button.addEventListener(
            'mousedown',
            function() { functionToCall(parent) } ,
            false
        )
    }

}
