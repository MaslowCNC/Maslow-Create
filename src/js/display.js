import GlobalVariables from './globalvariables'
//import { api, solidToThreejsDatasets, watchFile} from './JSxCAD.js'

export default class Display {

    constructor(){
        GlobalVariables.api = require('@jsxcad/api-v1')
        this.convert = require('@jsxcad/convert-threejs')
        this.datasets = []
        this.camera
        this.controls
        this.scene
        this.renderer
        this.stats
        this.mesh
        this.gui
        this.targetDiv = document.getElementById('viewerContext')
        
        //Add the JSXCAD window
        this.camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 10500);
        [this.camera.position.x, this.camera.position.y, this.camera.position.z] = [0, -30, 50]
        //
        this.controls = new THREE.TrackballControls(this.camera, this.targetDiv)
        this.controls.rotateSpeed = 4.0
        this.controls.zoomSpeed = 4.0
        this.controls.panSpeed = 2.0
        this.controls.noZoom = false
        this.controls.noPan = false
        this.controls.staticMoving = true
        this.controls.dynamicDampingFactor = 0.1
        this.controls.keys = [65, 83, 68]
        this.controls.addEventListener('change', () => { this.render() })
        //
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xB0AEB0)
        this.scene.add(this.camera)
        //
        var ambientLight = new THREE.AmbientLight(0x222222)
        this.scene.add(ambientLight)
        // var light1 = new THREE.PointLight(0xffffff, 0, 1);
        // camera.add(light1);
        var light2 = new THREE.DirectionalLight(0xffffff, 1)
        light2.position.set(1, 1, 1)
        this.camera.add(light2)

        //
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.targetDiv.appendChild(this.renderer.domElement)
        
        //watchFile('window', (file, { solids }) => {this.updateDisplayData(solids)})
        
        
        window.addEventListener('resize', () => { this.onWindowResize() }, false)
        this.onWindowResize()
    }
    
    makeMaterial(material){
        switch (material) {
        case 'metal':
            return new THREE.MeshStandardMaterial({
                color: 0x779aac,
                emissive: 0x7090a0,
                roughness: 0.65,
                metalness: 0.99,
            })
        default:
            return new THREE.MeshNormalMaterial()
        }
    }
    
    writeToDisplay(shape){
        //const returnValue = GlobalVariables.api.writeStl({ path: 'window' },shape)
        console.log("Before writing to file");
        try{
            this.updateDisplayData(this.convert.toThreejsGeometry(shape.toDisjointGeometry()));
        }catch(err){
            console.warn("can't display that")
            console.warn(err)
        }
    }
    
    updateDisplayData(threejsGeometry){
        console.log("Read back from file: ");
        console.log(threejsGeometry);
        // Delete any previous dataset in the window.
        while(this.scene.children.length > 0){ 
            this.scene.remove(this.scene.children[0]); 
        }
        
        let geometry = new THREE.BufferGeometry()
        let { positions, normals } = threejsGeometry.threejsSolid
        
        geometry.addAttribute('position', new THREE.Float32BufferAttribute( positions, 3))
        geometry.addAttribute('normal', new THREE.Float32BufferAttribute( normals, 3))
        let threeMaterial = new THREE.MeshStandardMaterial({
            color: 0x5f6670,
            emissive: 0x5f6670,
            roughness: 0.65,
            metalness: 0.40,
        })
        let mesh = new THREE.Mesh(geometry, threeMaterial)
        this.scene.add(mesh)
    }
    
    onWindowResize() {
        this.camera.aspect = this.targetDiv.clientWidth / (this.targetDiv.clientHeight - 1)
        this.camera.updateProjectionMatrix()
        this.controls.handleResize()
        this.renderer.setSize(this.targetDiv.clientWidth, this.targetDiv.clientHeight - 1)
    }
    
    render() {
        this.renderer.render( this.scene, this.camera )
    }
}