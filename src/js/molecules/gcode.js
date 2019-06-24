import Atom from '../prototypes/atom.js'
import GlobalVariables from '../globalvariables.js'
import saveAs from '../lib/FileSaver.js'
import SVGReader from '../lib/SVGReader.js'

/**
 * This class creates the circle atom.
 */
export default class Gcode extends Atom {
    
    /**
     * The constructor function.
     * @param {object} values An array of values passed in which will be assigned to the class as this.x
     */ 
    constructor(values){
        
        super(values)
        
        /**
         * This atom's name
         * @type {string}
         */
        this.name = 'Gcode'
        /**
         * This atom's type
         * @type {string}
         */
        this.atomType = 'Gcode'
        
        this.addIO('input', 'geometry', this, 'geometry', GlobalVariables.api.sphere())
        this.addIO('input', 'tool size', this, 'number', 5.35)
        this.addIO('input', 'passes', this, 'number', 6)
        this.addIO('output', 'gcode', this, 'geometry', '')
        
        this.setValues(values)
        
        //generate the correct codeblock for this atom on creation
        this.updateValue()
    }
    
    /**
     * Generate a new .svg file from the input geometry, then compute a gcode path from it. Processing takes place in a worker thread
     */ 
    updateValue(){
        this.processing = true
        this.clearAlert()
        
        const computeSvg = async (values, key) => {
            try{
                return await GlobalVariables.ask({values: values, key: key})
            }catch(err){this.setAlert(err)}
        }
        
        try{
            const input = this.findIOValue('geometry')
            
            computeSvg([input.toLazyGeometry().toGeometry()], "svg").then(result => {
                if (result != -1 ){
                    
                    const bounds = input.measureBoundingBox()
                    const partThickness = bounds[1][2]-bounds[0][2]
                    
                    //convert that to gcode
                    this.value = this.svg2gcode(result, {
                        passes: this.findIOValue('passes'),
                        materialWidth: -1*partThickness,
                        bitWidth: this.findIOValue('tool size')
                    })
                    
                }else{
                    this.setAlert("Unable to compute")
                }
                this.processing = false
            })
        }catch(err){this.setAlert(err)}
    }
    
    /**
     * Add a button to download the generated gcode
     */ 
    updateSidebar(){
        var valueList =  super.updateSidebar() 
        
        this.createButton(valueList,this,'Download Gcode',() => {
            const blob = new Blob([this.value], {type: 'text/plain;charset=utf-8'})
            saveAs(blob, GlobalVariables.topLevelMolecule.name+'.nc')
        })
    }
    
    /**
     * Does nothing, just here to supress the normal send to render behavior
     */ 
    sendToRender(){
    }
    
    /**
     * This function was taken from github. It needs to be more well documented.
     */ 
    svg2gcode(svg, settings) {
        // clean off any preceding whitespace
        svg = svg.replace(/^[\n\r \t]/gm, '')
        settings = settings || {}
        settings.passes = settings.passes || 1
        settings.materialWidth = settings.materialWidth || 6
        settings.passWidth = settings.materialWidth/settings.passes
        settings.scale = settings.scale || 1
        settings.cutZ = settings.cutZ || 0 // cut z
        settings.safeZ = settings.safeZ || 10   // safe z
        settings.feedRate = settings.feedRate || 1400
        settings.seekRate = settings.seekRate || 1100
        settings.bitWidth = settings.bitWidth || 1 // in mm

        var
            scale=function(val) {
                return val * settings.scale
            },
            paths = SVGReader.parse(svg, {}).allcolors,
            gcode,
            path

        var idx = paths.length
        while(idx--) {
            var subidx = paths[idx].length
            var bounds = { x : Infinity , y : Infinity, x2 : -Infinity, y2: -Infinity, area : 0}

            // find lower and upper bounds
            while(subidx--) {
                if (paths[idx][subidx][0] < bounds.x) {
                    bounds.x = paths[idx][subidx][0]
                }

                if (paths[idx][subidx][1] < bounds.y) {
                    bounds.y = paths[idx][subidx][0]
                }

                if (paths[idx][subidx][0] > bounds.x2) {
                    bounds.x2 = paths[idx][subidx][0]
                }
                if (paths[idx][subidx][1] > bounds.y2) {
                    bounds.y2 = paths[idx][subidx][0]
                }
            }

            // calculate area
            bounds.area = (1 + bounds.x2 - bounds.x) * (1 + bounds.y2-bounds.y)
            paths[idx].bounds = bounds
        }

        // cut the inside parts first
        paths.sort(function(a, b) {
        // sort by area
            return (a.bounds.area < b.bounds.area) ? -1 : 1
        })

        gcode = [
            'G90',
            'G21',
            'G1 Z' + settings.safeZ,
            'G82',
            'M4'
        ]

        for (var pathIdx = 0, pathLength = paths.length; pathIdx < pathLength; pathIdx++) {
            path = paths[pathIdx]

            // seek to index 0
            gcode.push(['G1',
                'X' + scale(path[0].x),
                'Y' + scale(path[0].y),
                'F' + settings.seekRate
            ].join(' '))
        
            for (var p = settings.passWidth; p>=settings.materialWidth; p-=-1*settings.passWidth) {

                // begin the cut by dropping the tool to the work
                gcode.push(['G1',
                    'Z' + (settings.cutZ + p),
                    'F' + '200'
                ].join(' '))

                // keep track of the current path being cut, as we may need to reverse it
                var localPath = []
                for (var segmentIdx=0, segmentLength = path.length; segmentIdx<segmentLength; segmentIdx++) {
                    var segment = path[segmentIdx]

                    var localSegment = ['G1',
                        'X' + scale(segment.x),
                        'Y' + scale(segment.y),
                        'F' + settings.feedRate
                    ].join(' ')

                    // feed through the material
                    gcode.push(localSegment)
                    localPath.push(localSegment)

                    // if the path is not closed, reverse it, drop to the next cut depth and cut
                    // this handles lines
                    if (segmentIdx === segmentLength - 1 &&
                (segment.x !== path[0].x || segment.y !== path[0].y))
                    {

                        p+=settings.passWidth
                        if (p<settings.materialWidth) {
                            // begin the cut by dropping the tool to the work
                            gcode.push(['G1',
                                'Z' + (settings.cutZ + p),
                                'F' + '200'
                            ].join(' '))

                            Array.prototype.push.apply(gcode, localPath.reverse())
                        }
                    }
                }
            }

            // go safe
            gcode.push(['G1',
                'Z' + settings.safeZ,
                'F' + '300'
            ].join(' '))
        }

        // just wait there for a second
        gcode.push('G4 P1')

        // turn off the spindle
        gcode.push('M5')

        // go home
        gcode.push('G1 Z' + settings.safeZ + ' F300')
        gcode.push('G1 X0 Y0 F800')

        return gcode.join('\n')
    }
}