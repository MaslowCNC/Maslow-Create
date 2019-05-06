import GlobalVariables from './globalvariables.js'

const howManyInputPortsAvailable = function(target){
    var portsAvailable = 0
    target.children.forEach(io => {
        if(io.type == 'input' && io.connectors.length == 0){   //if this port is available
            portsAvailable = portsAvailable + 1  //Add one to the count
        }
    })
    return portsAvailable
}

const deleteEmptyPort = function(target){
    target.children.forEach(io => {
        if(io.type == 'input' && io.connectors.length == 0 && howManyInputPortsAvailable(target) >= 2){
            target.removeIO('input', io.name, this)
        }
    })
}

export const addOrDeletePorts = (target) => {
    //Because a molecule loads with no connectors attached to the ports and we don't want them to delete before
    //They are conencted to we use teh ioValues list to keep track of them
    target.children.forEach(child => {
        target.ioValues.forEach(ioValue => {
            if (child.name == ioValue.name && child.connectors.length > 0){
                target.ioValues.splice(target.ioValues.indexOf(ioValue),1) //Let's remove it from the ioValues list
            }
        })
    })
    
    //Add or delete ports as needed
    if(howManyInputPortsAvailable(target) == 0){ //We need to make a new port available
        target.addIO('input', '2D shape ' + GlobalVariables.generateUniqueID(), target, 'geometry', '')
        target.addedIO = true
    }
    if(howManyInputPortsAvailable(target) >= 2 && target.ioValues.length <= 1){  //We need to remove the empty port
        deleteEmptyPort(target)
        target.updateValue()
    }
}