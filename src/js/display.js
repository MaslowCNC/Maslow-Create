
import GlobalVariables from './globalvariables'
import { api, solidToThreejsDatasets, watchFile} from './JSxCAD.js'

export default class Display {

    constructor(){
        GlobalVariables.api = api
        
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
        
        watchFile('window', (file, { solids }) => {this.updateDisplayData(solids)})
        
        
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
        //this.renderWorker.postMessage(shape);
    }
    
    updateDisplayData(solids){
        // Delete any previous dataset in the window.
        for (const { mesh } of this.datasets) {
            this.scene.remove(mesh)
        }
        
        // display the returned data
        this.datasets = solidToThreejsDatasets({}, ...solids)
        for (const dataset of this.datasets) {
            let geometry = new THREE.BufferGeometry()
            let { properties = {}, indices, positions, normals } = dataset
            let { material, tags = [] } = properties
            geometry.setIndex( indices )
            geometry.addAttribute('position', new THREE.Float32BufferAttribute( positions, 3))
            geometry.addAttribute('normal', new THREE.Float32BufferAttribute( normals, 3))
            let threeMaterial = new THREE.MeshStandardMaterial({
                color: 0x5f6670,
                emissive: 0x5f6670,
                roughness: 0.65,
                metalness: 0.40,
            })
            dataset.mesh = new THREE.Mesh(geometry, threeMaterial)
            this.scene.add(dataset.mesh)
        }
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