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
        this.numberNeeded = 0
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
    }
}

/**
 * Computes and returns an array of BOMEntry objects after looking at the tags of a geometry.
 * @param {object} geometry - The geometry which should be scanned for tags.
 */ 
export const extractBomTags = (geometry) => {
    
    var bomItems = []
    
    const walk = (geometry) => {
        //Grab any available tags
        if(geometry.tags){
            geometry.tags.forEach(tag => {
                if(tag.substring(0,11) == 'user/{"BOMi'){
                    bomItems.push(JSON.parse(tag.substring(5)))
                }
            })
        }
        
        //Walk deeper if there is deeper to go
        if (geometry.disjointAssembly) {
            geometry.disjointAssembly.forEach(walk)
        }
        else if (geometry.lazyGeometry) {
            walk(geometry.lazyGeometry)
        }
        else if (geometry.geometry) {
            walk(geometry.geometry)
        }
        else{
            return
        }
    }
    
    if(geometry != null){
        walk(geometry)
    }
    
    
    //Consolidate similar items into a single item
    var result = [];
    bomItems.forEach(function (bomElement) {
        if (!this[bomElement.BOMitemName]) {
            this[bomElement.BOMitemName] = new BOMEntry;
            this[bomElement.BOMitemName].BOMitemName = bomElement.BOMitemName
            this[bomElement.BOMitemName].source = bomElement.source
            result.push(this[bomElement.BOMitemName]);
        }
        this[bomElement.BOMitemName].numberNeeded += bomElement.numberNeeded;
        this[bomElement.BOMitemName].costUSD += bomElement.costUSD;
    }, Object.create(null));
    
    
    return result
}
