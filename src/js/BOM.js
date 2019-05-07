export class BOMEntry {
    constructor(){
        this.BOMitemName  = 'name'
        this.numberNeeded = 0
        this.costUSD      = 0
        this.source       = 'www.example.com'
        this.totalNeeded  = this.numberNeeded //Scaled by the number of this instance
    }
}

export const extractBomTags = (geometry) => {
    var bomItems = []
    const walk = (geometry) => {
        if (geometry.assembly) {
            geometry.assembly.forEach(walk)
        }
        else if (geometry.lazyGeometry) {
            walk(geometry.lazyGeometry)
        }
        else if (geometry.geometry) {
            walk(geometry.geometry)
        }
        else if (geometry.geometry) {
            walk(geometry.geometry)
        }
        else if(geometry.tags){
            geometry.tags.forEach(tag => {
                if(tag.substring(0,6) == '{"BOMi'){
                    bomItems.push(JSON.parse(tag))
                }
            })
        }
    }
    walk(geometry)
    return bomItems
}