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
    var i
    for (i = 0; i < target.inputs.length - 1; i++) {
        var io = target.inputs[i]
        if(io.type == 'input' && io.connectors.length == 0){
            target.removeIO('input', io.name, target)
            return
        }
    }
}

/**
 * Finds the highest number input currently used by this atom
 * @param {object} target - The atom which should be inspected for inputs.
 */ 
const findHighestInput = function(target){
    var maxInput = 0
    target.inputs.forEach( input => {
        maxInput = Math.max(maxInput, parseInt(input.name.match(/\d+$/)[0]))
    })
    return maxInput
}

/**
 * Adds or deletes inputs from a target atom until there is exactly one input available.
 * @param {object} target - The atom which should have it's number of inputs adjusted.
 */ 
export const addOrDeletePorts = (target) => {
    
    //Add or delete ports as needed
    if(howManyInputPortsAvailable(target) == 0){ //We need to make a new port available
        findHighestInput(target)
        target.addIO('input', '3D shape ' + (findHighestInput(target) + 1), target, 'geometry', '', true)
    }
    if(howManyInputPortsAvailable(target) >= 2){  //We need to remove the empty port
        deleteEmptyPort(target)
    }
}