export default const extractBomTags = (geometry) => {
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