
/**
 * This class defines a BOMEntry object which is used to define one entry in a bill of materials.
 */ 
export class BOMEntry {
    /**
     * The constructor returns a new blank BOMEntry object.
     */ 
    constructor(){
        /** 
         * The name of the item.
         * @type {string}
         */
        this.BOMitemName  = 'name'
        /** 
         * The number of this item needed.
         * @type {number}
         */
        this.numberNeeded = 1
        /** 
         * The cost of one of this item in USD.
         * @type {number}
         */
        this.costUSD      = 0
        /** 
         * A link to where to purchase the item.
         * @type {string}
         */
        this.source       = 'www.example.com'
        /** 
         * The total number of this item needed for this part. Should this be removed in favor of  forcing the parts to be modeled? Probably nobody would bother.
         * @type {number}
         */
        this.totalNeeded  = this.numberNeeded //Scaled by the number of this instance
        /** 
         * This atom's radius as displayed on the screen is 1/72 width
         * @type {number}
         */
        this.radius = 1/65
        /**
         * This atom's height as drawn on the screen
         */
        this.height
    }
}

/**
 * Computes and returns an array of BOMEntry objects after looking at the tags of a geometry.
 * @param {object} geometry - The geometry which should be scanned for tags.
 */ 
export const extractBomTags = function(assembly){
    
    //Catch empty input
    if(assembly == null){
        return []
    }
    
    //Extract all of the tags
    var tags = []
    assembly.forEach(item => {
        tags = tags.concat(item.tags)
    })
    
    // Filter for only bomItems
    var bomItems = tags.filter(item => {
        return item.substring(2, 13) == "BOMitemName"
    })
    
    bomItems = bomItems.map(JSON.parse)
    
    // Consolidate similar items into a single item
    var compiledArray = []
    bomItems.forEach(function (bomElement) {
        if (!this[bomElement.BOMitemName]) {                    //If the list of items doesn't already have one of these
            this[bomElement.BOMitemName] = new BOMEntry             //Create one
            this[bomElement.BOMitemName].numberNeeded = 0           //Set the number needed to zerio initially
            this[bomElement.BOMitemName].BOMitemName = bomElement.BOMitemName   //With the information from the item
            this[bomElement.BOMitemName].source = bomElement.source
            compiledArray.push(this[bomElement.BOMitemName])
        }
        this[bomElement.BOMitemName].numberNeeded += bomElement.numberNeeded
        this[bomElement.BOMitemName].costUSD += bomElement.costUSD
    }, Object.create(null))
    
    // Alphabetize by source
    compiledArray = compiledArray.sort((a,b) => (a.source > b.source) ? 1 : ((b.source > a.source) ? -1 : 0)) 
    
    return compiledArray
}
