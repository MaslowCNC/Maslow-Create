import GlobalVariables from './globalvariables.js'
//This module is used to create atoms which do not have a set number of inputs, but instead always have one input free.

/**
 * Computes the number of inputs which are curently available on a target atom.
 * @param {object} target - The atom which should have it's number of inputs computed.
 */ 
const howManyInputPortsAvailable = function(target){
    var portsAvailable = 0
    target.inputs.forEach(io => {
        if(io.type == 'input' && io.connectors.length == 0){   //if this port is available
            portsAvailable = portsAvailable + 1  //Add one to the count
        }
    })
    return portsAvailable
}

/**
 * Deletes one free input from an atom which has more than one free input available.
 * @param {object} target - The atom which should have one input deleted (if there are more than two free).
 */ 
const deleteEmptyPort = function(target){
    target.inputs.forEach(io => {
        if(io.type == 'input' && io.connectors.length == 0){
            target.removeIO('input', io.name, target)
        }
    })
}

/**
 * Adds or deletes inputs from a target atom until there is exactly one input available.
 * @param {object} target - The atom which should have it's number of inputs adjusted.
 */ 
export const addOrDeletePorts = (target) => {
    //Because a molecule loads with no connectors attached to the ports and we don't want them to delete before
    //They are connected to we use the ioValues list to keep track of them
    target.inputs.forEach(child => {
        target.ioValues.forEach(ioValue => {
            if (child.name == ioValue.name && child.connectors.length > 0){
                target.ioValues.splice(target.ioValues.indexOf(ioValue),1) //Let's remove it from the ioValues list
            }
        })
    })
    
    //Add or delete ports as needed
    if(howManyInputPortsAvailable(target) == 0){ //We need to make a new port available
        target.addIO('input', '3D shape ' + GlobalVariables.generateUniqueID(), target, 'geometry', '')
    }
    if(howManyInputPortsAvailable(target) >= 2){  //We need to remove the empty port
        deleteEmptyPort(target)
        target.updateValue()
    }
}