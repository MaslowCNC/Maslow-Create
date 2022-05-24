import { Object3D, PerspectiveCamera, Scene, AxesHelper, SpotLight, WebGLRenderer, Raycaster, Vector2, EventDispatcher, MeshBasicMaterial, Vector3, Mesh, BoxGeometry, ArrowHelper, MeshPhysicalMaterial, MeshPhongMaterial, MeshNormalMaterial, ImageBitmapLoader, CanvasTexture, RepeatWrapping, Group, Shape, Path, ShapeGeometry, EdgesGeometry, LineSegments, LineBasicMaterial, BufferGeometry, Float32BufferAttribute, WireframeGeometry, PointsMaterial, Points, VertexColors, Color, Matrix4, Box3, Matrix3, Quaternion, GridHelper, PlaneGeometry, MeshStandardMaterial, Layers, TrackballControls } from './jsxcad-algorithm-threejs.js';
import { toRgbFromTags } from './jsxcad-algorithm-color.js';
import { toThreejsMaterialFromTags } from './jsxcad-algorithm-material.js';
import { toPlane } from './jsxcad-math-poly3.js';

const GEOMETRY_LAYER = 0;
const SKETCH_LAYER = 1;

const createResizer = ({
  camera,
  controls,
  renderer,
  viewerElement,
}) => {
  const resize = () => {
    const width = viewerElement.clientWidth;
    const height = viewerElement.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    for (const control of controls) {
      control.update();
    }
    renderer.setSize(width, height);
    return { width, height };
  };

  return { resize };
};

const buildScene = ({
  canvas,
  width,
  height,
  view,
  withAxes = true,
  renderer,
  preserveDrawingBuffer = false,
}) => {
  const { target = [0, 0, 0], position = [40, 40, 40], up = [0, 1, 1] } = view;
  Object3D.DefaultUp.set(...up);

  const camera = new PerspectiveCamera(27, width / height, 1, 1000000);
  camera.position.set(...position);
  camera.up.set(...up);
  camera.lookAt(...target);
  camera.userData.dressing = true;

  const scene = new Scene();
  scene.add(camera);

  if (withAxes) {
    const axes = new AxesHelper(5);
    axes.layers.set(SKETCH_LAYER);
    scene.add(axes);
  }

  {
    // const light = new DirectionalLight(0xffffff, 0.25);
    const light = new SpotLight(0xffffff, 0.7);
    light.target = camera;
    light.position.set(0.1, 0.1, 1);
    light.userData.dressing = true;
    camera.add(light);
  }

  {
    // Add spot light for shadows.
    const spotLight = new SpotLight(0xffffff, 0.75);
    spotLight.position.set(20, 20, 20);
    spotLight.castShadow = true;
    spotLight.receiveShadow = true;
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.mapSize.width = 1024 * 2;
    spotLight.shadow.mapSize.height = 1024 * 2;
    spotLight.userData.dressing = true;
    scene.add(spotLight);
  }

  if (renderer === undefined) {
    renderer = new WebGLRenderer({
      antialias: true,
      canvas,
      preserveDrawingBuffer,
    });
    renderer.autoClear = false;
    renderer.setSize(width, height, /* updateStyle= */ false);
    renderer.setClearColor(0xffffff);
    renderer.antiAlias = false;
    renderer.inputGamma = true;
    renderer.outputGamma = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style =
      'padding-left: 5px; padding-right: 5px; padding-bottom: 5px; position: absolute; z-index: 1';

    renderer.shadowMap.enabled = true;
    // renderer.shadowMapType = BasicShadowMap;
  }
  return { camera, canvas: renderer.domElement, renderer, scene };
};

let geometryRaycaster = new Raycaster();
geometryRaycaster.layers.set(GEOMETRY_LAYER);

let sketchRaycaster = new Raycaster();
sketchRaycaster.layers.set(SKETCH_LAYER);

const cast = (raycaster, position, camera, objects) => {
  raycaster.setFromCamera(position, camera);
  const intersects = raycaster.intersectObjects(objects, true);

  for (const { face, object, point } of intersects) {
    if (!object.userData.tangible) {
      continue;
    }
    if (face) {
      const { normal } = face;
      const ray = [
        [point.x, point.y, point.z],
        [normal.x, normal.y, normal.z],
      ];
      return { ray, object };
    } else {
      return { point, object };
    }
  }
};

const raycast = (x, y, camera, objects) => {
  const position = new Vector2(x, y);
  return (
    cast(sketchRaycaster, position, camera, objects) ||
    cast(geometryRaycaster, position, camera, objects) ||
    {}
  );
};

// global document

class AnchorControls extends EventDispatcher {
  constructor(_camera, _domElement, _scene) {
    super();

    const _material = new MeshBasicMaterial({
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      transparent: true,
      opacity: 0.5,
    });

    const yellow = _material.clone();
    yellow.color.setHex(0xffff00);

    const red = _material.clone();
    red.color.setHex(0xff0000);

    const green = _material.clone();
    green.color.setHex(0x00ff00);

    const blue = _material.clone();
    blue.color.setHex(0x0000ff);

    const _xAxis = new Vector3();
    const _yAxis = new Vector3();
    const _zAxis = new Vector3();

    let _step = 1;
    let _object = null;

    let _at = new Mesh(new BoxGeometry(1, 1, 1), yellow);

    let _to = new Mesh(new BoxGeometry(0.5, 0.5, 0.5), red);
    let _toArrow = new ArrowHelper();

    let _up = new Mesh(new BoxGeometry(0.5, 0.5, 0.5), blue);
    let _upArrow = new ArrowHelper();

    _at.visible = false;
    _at.layers.set(SKETCH_LAYER);
    _at.userData.dressing = true;
    _scene.add(_at);

    _to.visible = false;
    _to.layers.set(SKETCH_LAYER);
    _to.userData.dressing = true;
    _scene.add(_to);

    _toArrow.layers.set(SKETCH_LAYER);
    _toArrow.setColor(0xff0000);
    _toArrow.userData.dressing = true;
    _at.add(_toArrow);

    _up.visible = false;
    _up.layers.set(SKETCH_LAYER);
    _up.userData.dressing = true;
    _scene.add(_up);

    _upArrow.layers.set(SKETCH_LAYER);
    _upArrow.setColor(0x0000ff);
    _upArrow.userData.dressing = true;
    _at.add(_upArrow);

    const deleteObject = () => {
      if (!_object) {
        return;
      }
      // We just hide the object, because we might be copying it later.
      _object.visible = false;
    };

    const placeObject = (original, { at }) => {
      const copy = original.clone();
      // We change the material sometimes, so make a copy.
      copy.material = copy.material.clone();
      if (at) {
        copy.position.copy(at.position);
      }
      // Record the time this was produced.
      copy.userData.created = new Date();
      // This is not quite right -- we might be pasting elsewhere.
      original.parent.add(copy);
    };

    const enable = () => {
      _domElement.addEventListener('pointerdown', onPointerDown);
      _domElement.tabIndex = 1; // Make the canvas focusable.
    };

    const disable = () => {
      _domElement.removeEventListener('pointerdown', onPointerDown);
    };

    // Something in the outside environment changed.
    const change = () => {
      // if (!_object) { return; }

      // Find a best fit between camera and world axes.
      const x = new Vector3();
      x.set(1, 0, 0);
      // The y axis is backward.
      const y = new Vector3();
      y.set(0, -1, 0);
      const z = new Vector3();
      z.set(0, 0, 1);

      // Invalidate the axes so errors become obvious.
      _xAxis.set(NaN, NaN, NaN);
      _yAxis.set(NaN, NaN, NaN);
      _zAxis.set(NaN, NaN, NaN);

      // This could be more efficient, since we don't need to consider axes already asigned.
      const fit = (v, cameraAxis) => {
        const xDot = x.dot(v);
        const xFit = Math.abs(xDot);

        const yDot = y.dot(v);
        const yFit = Math.abs(yDot);

        const zDot = z.dot(v);
        const zFit = Math.abs(zDot);

        if (xFit >= yFit && xFit >= zFit) {
          cameraAxis.copy(x);
          if (xDot < 0) {
            cameraAxis.negate();
          }
        } else if (yFit >= xFit && yFit >= zFit) {
          cameraAxis.copy(y);
          if (yDot < 0) {
            cameraAxis.negate();
          }
        } else {
          cameraAxis.copy(z);
          if (zDot < 0) {
            cameraAxis.negate();
          }
        }
      };

      const cx = new Vector3();
      const cy = new Vector3();
      const cz = new Vector3();
      _camera.matrixWorld.extractBasis(cx, cy, cz);

      fit(cx, _xAxis);
      fit(cy, _yAxis);
      fit(cz, _zAxis);
    };

    // We're changing our state.
    const update = () => {
      if (_object) {
        _object.position.copy(_at.position);
      }
      const up = new Vector3();
      up.subVectors(_up.position, _at.position);
      up.normalize();
      if (_object) {
        _object.up.copy(up);
        _object.lookAt(_to.position);
      }
      _at.scale.set(_step, _step, _step);
      _to.scale.set(_step / 2, _step / 2, _step / 2);
      _up.scale.set(_step / 2, _step / 2, _step / 2);
      const dir = new Vector3();
      dir.subVectors(_to.position, _at.position).normalize();
      _toArrow.setDirection(dir);
      _toArrow.setLength(_step * 5);
      dir.subVectors(_up.position, _at.position).normalize();
      _upArrow.setDirection(dir);
      _upArrow.setLength(_step * 2);
      this.dispatchEvent({
        type: 'change',
        at: _at,
        to: _to,
        up: _up,
        object: _object,
      });
    };

    const attach = (object) => {
      detach();
      _object = object;
      _object.material.transparent = true;
      _object.material.opacity *= 0.5;
      for (const child of _object.children) {
        const { isOutline } = child.userData;
        if (isOutline) {
          child.visible = true;
        }
      }
      _at.material.color.setHex(0xff4500); // orange red
      _at.visible = true;
      _to.visible = true;
      _up.visible = true;

      _at.position.set(0, 0, 0);
      _object.localToWorld(_at.position);

      _to.position.set(0, 0, 1);
      _object.localToWorld(_to.position);

      _up.position.set(0, 1, 0);
      _object.localToWorld(_up.position);

      change();
      update();

      _domElement.addEventListener('keydown', onKeyDown);
      this.dispatchEvent({ type: 'change' });
    };

    const detach = () => {
      if (_object === null) {
        return;
      }
      _object.material.opacity /= 0.5;
      for (const child of _object.children) {
        const { isOutline, hasShowOutline } = child.userData;
        if (isOutline && !hasShowOutline) {
          child.visible = false;
        }
      }
      _object = null;
      _at.material.color.setHex(0xffff00); // yellow
      this.dispatchEvent({ type: 'change', object: null });
    };

    const dispose = () => detach();

    const onKeyDown = (event) => {
      // if (!_object) return;

      if (event.getModifierState('Control')) {
        this.dispatchEvent({
          at: _at,
          deleteObject,
          object: _object,
          placeObject,
          type: 'keydown',
          event,
          to: _to,
          up: _up,
        });
      } else {
        // These exclude control keys.
        switch (event.key) {
          // step
          case '1':
            _step = 100.0;
            break;
          case '2':
            _step = 50.0;
            break;
          case '3':
            _step = 25.0;
            break;
          case '4':
            _step = 10.0;
            break;
          case '5':
            _step = 5.0;
            break;
          case '6':
            _step = 2.5;
            break;
          case '7':
            _step = 1.0;
            break;
          case '8':
            _step = 0.5;
            break;
          case '9':
            _step = 0.25;
            break;
          case '0':
            _step = 0.1;
            break;

          // at
          case 'ArrowRight':
          case 'd':
            _at.position.addScaledVector(_xAxis, _step);
            {
              _up.position.addScaledVector(_xAxis, _step);
            }
            {
              _to.position.addScaledVector(_xAxis, _step);
            }
            break;
          case 'ArrowLeft':
          case 'a':
            _at.position.addScaledVector(_xAxis, -_step);
            {
              _up.position.addScaledVector(_xAxis, -_step);
            }
            {
              _to.position.addScaledVector(_xAxis, -_step);
            }
            break;
          case 'ArrowUp':
          case 'w':
            _at.position.addScaledVector(_yAxis, _step);
            {
              _up.position.addScaledVector(_yAxis, _step);
            }
            {
              _to.position.addScaledVector(_yAxis, _step);
            }
            break;
          case 'ArrowDown':
          case 's':
            _at.position.addScaledVector(_yAxis, -_step);
            {
              _up.position.addScaledVector(_yAxis, -_step);
            }
            {
              _to.position.addScaledVector(_yAxis, -_step);
            }
            break;
          case 'PageDown':
          case 'e':
            _at.position.addScaledVector(_zAxis, _step);
            {
              _up.position.addScaledVector(_zAxis, _step);
            }
            {
              _to.position.addScaledVector(_zAxis, _step);
            }
            break;
          case 'PageUp':
          case 'q':
            _at.position.addScaledVector(_zAxis, -_step);
            {
              _up.position.addScaledVector(_zAxis, -_step);
            }
            {
              _to.position.addScaledVector(_zAxis, -_step);
            }
            break;

          // to
          case 'h':
            _to.position.addScaledVector(_xAxis, _step);
            break;
          case 'f':
            _to.position.addScaledVector(_xAxis, -_step);
            break;
          case 't':
            _to.position.addScaledVector(_yAxis, _step);
            break;
          case 'g':
            _to.position.addScaledVector(_yAxis, -_step);
            break;
          case 'y':
            _to.position.addScaledVector(_zAxis, _step);
            break;
          case 'r':
            _to.position.addScaledVector(_zAxis, -_step);
            break;

          // up
          case 'l':
            _to.position.addScaledVector(_xAxis, _step);
            break;
          case 'j':
            _to.position.addScaledVector(_xAxis, -_step);
            break;
          case 'i':
            _to.position.addScaledVector(_yAxis, _step);
            break;
          case 'k':
            _to.position.addScaledVector(_yAxis, -_step);
            break;
          case 'o':
            _to.position.addScaledVector(_zAxis, _step);
            break;
          case 'u':
            _to.position.addScaledVector(_zAxis, -_step);
            break;

          // Pass on other keystrokes
          default:
            this.dispatchEvent({
              at: _at,
              deleteObject,
              event,
              object: _object,
              placeObject,
              to: _to,
              type: 'keydown',
              up: _up,
            });
            break;
        }
      }

      update();
    };

    const onPointerDown = (event) => {
      const rect = event.target.getBoundingClientRect();
      const x = ((event.clientX - rect.x) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.y) / rect.height) * 2 + 1;
      const { object } = raycast(x, y, _camera, [_scene]);
      if (!object) {
        detach();
      } else {
        attach(object);
      }
    };

    // API

    this.attach = attach;
    this.change = change;
    this.detach = detach;
    this.dispose = dispose;
    this.disable = disable;
    this.enable = enable;
  }
}

const setColor = (
  definitions,
  tags = [],
  parameters = {},
  otherwise = [0, 0, 0]
) => {
  let rgb = toRgbFromTags(tags, definitions, null);
  if (rgb === null) {
    rgb = otherwise;
  }
  if (rgb === null) {
    return;
  }
  const [r, g, b] = rgb;
  const color = ((r << 16) | (g << 8) | b) >>> 0;
  parameters.color = color;
  return parameters;
};

// Map of url to texture promises;
const textureCache = new Map();

const loadTexture = (url) => {
  if (!textureCache.has(url)) {
    textureCache.set(
      url,
      new Promise((resolve, reject) => {
        const loader = new ImageBitmapLoader();
        loader.setOptions({ imageOrientation: 'flipY' });
        loader.load(
          url,
          (imageBitmap) => {
            const texture = new CanvasTexture(imageBitmap);
            texture.wrapS = texture.wrapT = RepeatWrapping;
            texture.offset.set(0, 0);
            texture.repeat.set(1, 1);
            resolve(texture);
          },
          (progress) => console.log(`Loading: ${url}`),
          reject
        );
      })
    );
  }
  return textureCache.get(url);
};

const merge = async (properties, parameters) => {
  for (const key of Object.keys(properties)) {
    if (key === 'map') {
      parameters[key] = await loadTexture(properties[key]);
    } else {
      parameters[key] = properties[key];
    }
  }
};

const setMaterial = async (definitions, tags, parameters) => {
  const threejsMaterial = toThreejsMaterialFromTags(tags, definitions);
  if (threejsMaterial !== undefined) {
    await merge(threejsMaterial, parameters);
    return threejsMaterial;
  }
};

const buildMeshMaterial = async (definitions, tags) => {
  if (tags !== undefined) {
    const parameters = {};
    const color = setColor(definitions, tags, parameters, null);
    const material = await setMaterial(definitions, tags, parameters);
    if (material) {
      return new MeshPhysicalMaterial(parameters);
    } else if (color) {
      await merge(
        toThreejsMaterialFromTags(['material:color'], definitions),
        parameters
      );
      parameters.emissive = parameters.color;
      return new MeshPhongMaterial(parameters);
    }
  }

  // Else, default to normal material.
  return new MeshNormalMaterial();
};

// FIX: Found it somewhere -- attribute.
const applyBoxUVImpl = (geom, transformMatrix, bbox, bboxMaxSize) => {
  const coords = [];
  coords.length = (2 * geom.attributes.position.array.length) / 3;

  if (geom.attributes.uv === undefined) {
    geom.setAttribute('uv', new Float32BufferAttribute(coords, 2));
  }

  // maps 3 verts of 1 face on the better side of the cube
  // side of the cube can be XY, XZ or YZ
  const makeUVs = (v0, v1, v2) => {
    // pre-rotate the model so that cube sides match world axis
    v0.applyMatrix4(transformMatrix);
    v1.applyMatrix4(transformMatrix);
    v2.applyMatrix4(transformMatrix);

    // get normal of the face, to know into which cube side it maps better
    let n = new Vector3();
    n.crossVectors(v1.clone().sub(v0), v1.clone().sub(v2)).normalize();

    n.x = Math.abs(n.x);
    n.y = Math.abs(n.y);
    n.z = Math.abs(n.z);

    let uv0 = new Vector2();
    let uv1 = new Vector2();
    let uv2 = new Vector2();
    // xz mapping
    if (n.y > n.x && n.y > n.z) {
      uv0.x = (v0.x - bbox.min.x) / bboxMaxSize;
      uv0.y = (bbox.max.z - v0.z) / bboxMaxSize;

      uv1.x = (v1.x - bbox.min.x) / bboxMaxSize;
      uv1.y = (bbox.max.z - v1.z) / bboxMaxSize;

      uv2.x = (v2.x - bbox.min.x) / bboxMaxSize;
      uv2.y = (bbox.max.z - v2.z) / bboxMaxSize;
    } else if (n.x > n.y && n.x > n.z) {
      uv0.x = (v0.z - bbox.min.z) / bboxMaxSize;
      uv0.y = (v0.y - bbox.min.y) / bboxMaxSize;

      uv1.x = (v1.z - bbox.min.z) / bboxMaxSize;
      uv1.y = (v1.y - bbox.min.y) / bboxMaxSize;

      uv2.x = (v2.z - bbox.min.z) / bboxMaxSize;
      uv2.y = (v2.y - bbox.min.y) / bboxMaxSize;
    } else if (n.z > n.y && n.z > n.x) {
      uv0.x = (v0.x - bbox.min.x) / bboxMaxSize;
      uv0.y = (v0.y - bbox.min.y) / bboxMaxSize;

      uv1.x = (v1.x - bbox.min.x) / bboxMaxSize;
      uv1.y = (v1.y - bbox.min.y) / bboxMaxSize;

      uv2.x = (v2.x - bbox.min.x) / bboxMaxSize;
      uv2.y = (v2.y - bbox.min.y) / bboxMaxSize;
    }

    return { uv0, uv1, uv2 };
  };

  if (geom.index) {
    // is it indexed buffer geometry?
    for (let vi = 0; vi < geom.index.array.length; vi += 3) {
      const idx0 = geom.index.array[vi];
      const idx1 = geom.index.array[vi + 1];
      const idx2 = geom.index.array[vi + 2];

      const vx0 = geom.attributes.position.array[3 * idx0];
      const vy0 = geom.attributes.position.array[3 * idx0 + 1];
      const vz0 = geom.attributes.position.array[3 * idx0 + 2];

      const vx1 = geom.attributes.position.array[3 * idx1];
      const vy1 = geom.attributes.position.array[3 * idx1 + 1];
      const vz1 = geom.attributes.position.array[3 * idx1 + 2];

      const vx2 = geom.attributes.position.array[3 * idx2];
      const vy2 = geom.attributes.position.array[3 * idx2 + 1];
      const vz2 = geom.attributes.position.array[3 * idx2 + 2];

      const v0 = new Vector3(vx0, vy0, vz0);
      const v1 = new Vector3(vx1, vy1, vz1);
      const v2 = new Vector3(vx2, vy2, vz2);

      const uvs = makeUVs(v0, v1, v2);

      coords[2 * idx0] = uvs.uv0.x;
      coords[2 * idx0 + 1] = uvs.uv0.y;

      coords[2 * idx1] = uvs.uv1.x;
      coords[2 * idx1 + 1] = uvs.uv1.y;

      coords[2 * idx2] = uvs.uv2.x;
      coords[2 * idx2 + 1] = uvs.uv2.y;
    }
  } else {
    for (let vi = 0; vi < geom.attributes.position.array.length; vi += 9) {
      const vx0 = geom.attributes.position.array[vi];
      const vy0 = geom.attributes.position.array[vi + 1];
      const vz0 = geom.attributes.position.array[vi + 2];

      const vx1 = geom.attributes.position.array[vi + 3];
      const vy1 = geom.attributes.position.array[vi + 4];
      const vz1 = geom.attributes.position.array[vi + 5];

      const vx2 = geom.attributes.position.array[vi + 6];
      const vy2 = geom.attributes.position.array[vi + 7];
      const vz2 = geom.attributes.position.array[vi + 8];

      const v0 = new Vector3(vx0, vy0, vz0);
      const v1 = new Vector3(vx1, vy1, vz1);
      const v2 = new Vector3(vx2, vy2, vz2);

      const uvs = makeUVs(v0, v1, v2);

      const idx0 = vi / 3;
      const idx1 = idx0 + 1;
      const idx2 = idx0 + 2;

      coords[2 * idx0] = uvs.uv0.x;
      coords[2 * idx0 + 1] = uvs.uv0.y;

      coords[2 * idx1] = uvs.uv1.x;
      coords[2 * idx1 + 1] = uvs.uv1.y;

      coords[2 * idx2] = uvs.uv2.x;
      coords[2 * idx2 + 1] = uvs.uv2.y;
    }
  }

  geom.attributes.uv.array = new Float32Array(coords);
};

const applyBoxUV = (bufferGeometry, transformMatrix, boxSize) => {
  if (transformMatrix === undefined) {
    transformMatrix = new Matrix4();
  }

  if (boxSize === undefined) {
    const geom = bufferGeometry;
    geom.computeBoundingBox();
    const bbox = geom.boundingBox;

    const bboxSizeX = bbox.max.x - bbox.min.x;
    const bboxSizeY = bbox.max.y - bbox.min.y;
    const bboxSizeZ = bbox.max.z - bbox.min.z;

    boxSize = Math.max(bboxSizeX, bboxSizeY, bboxSizeZ);
  }

  const uvBbox = new Box3(
    new Vector3(-boxSize / 2, -boxSize / 2, -boxSize / 2),
    new Vector3(boxSize / 2, boxSize / 2, boxSize / 2)
  );

  applyBoxUVImpl(bufferGeometry, transformMatrix, uvBbox, boxSize);
};

const updateUserData = (geometry, scene, userData) => {
  if (geometry.tags) {
    for (const tag of geometry.tags) {
      if (tag.startsWith('editId:')) {
        userData.editId = tag.substring(7);
      } else if (tag.startsWith('editType:')) {
        userData.editType = tag.substring(9);
      } else if (tag.startsWith('viewId:')) {
        userData.viewId = tag.substring(7);
      } else if (tag.startsWith('viewType:')) {
        userData.viewType = tag.substring(9);
      } else if (tag.startsWith('groupChildId:')) {
        // Deprecate these.
        userData.groupChildId = parseInt(tag.substring(13));
      }
    }
    userData.tags = geometry.tags;
  }
};

// https://gist.github.com/kevinmoran/b45980723e53edeb8a5a43c49f134724
const orient = (mesh, source, target, offset) => {
  const translation = new Matrix4();
  translation.makeTranslation(0, 0, -offset);
  mesh.applyMatrix4(translation);

  const cosA = target.clone().dot(source);

  if (cosA === 1) {
    return;
  }

  if (cosA === -1) {
    const w = 1;
    const cosAlpha = -1;
    const sinAlpha = 0;
    const matrix4 = new Matrix4();

    matrix4.set(
      w,
      0,
      0,
      0,
      0,
      cosAlpha,
      -sinAlpha,
      0,
      0,
      sinAlpha,
      cosAlpha,
      0,
      0,
      0,
      0,
      w
    );
    mesh.applyMatrix4(matrix4);
    return;
  }

  // Otherwise we need to build a matrix.

  const axis = new Vector3();
  axis.crossVectors(target, source);
  const k = 1 / (1 + cosA);

  const matrix3 = new Matrix3();
  matrix3.set(
    axis.x * axis.x * k + cosA,
    axis.y * axis.x * k - axis.z,
    axis.z * axis.x * k + axis.y,
    axis.x * axis.y * k + axis.z,
    axis.y * axis.y * k + cosA,
    axis.z * axis.y * k - axis.x,
    axis.x * axis.z * k - axis.y,
    axis.y * axis.z * k + axis.x,
    axis.z * axis.z * k + cosA
  );

  const matrix4 = new Matrix4();
  matrix4.setFromMatrix3(matrix3);

  const position = new Vector3();
  const quaternion = new Quaternion();
  const scale = new Vector3();

  matrix4.decompose(position, quaternion, scale);

  console.log(`QQ/position: ${JSON.stringify(position)}`);
  console.log(`QQ/quaternion: ${JSON.stringify(quaternion)}`);
  console.log(`QQ/scale: ${JSON.stringify(scale)}`);

  mesh.applyMatrix4(matrix4);
};

const buildMeshes = async ({
  geometry,
  scene,
  render,
  definitions,
  pageSize = [],
}) => {
  if (geometry === undefined) {
    return;
  }
  const { tags = [] } = geometry;
  const layer = tags.includes('show:overlay') ? SKETCH_LAYER : GEOMETRY_LAYER;
  let mesh;
  switch (geometry.type) {
    case 'layout': {
      const [width, length] = geometry.layout.size;
      pageSize[0] = width;
      pageSize[1] = length;
      break;
    }
    case 'sketch':
    case 'displayGeometry':
    case 'group':
    case 'item':
    case 'plan':
      break;
    case 'segments': {
      const { segments } = geometry;
      const bufferGeometry = new BufferGeometry();
      const material = new LineBasicMaterial({
        color: new Color(setColor(definitions, tags, {}, [0, 0, 0]).color),
      });
      const positions = [];
      for (const segment of segments) {
        const [start, end] = segment;
        const [aX = 0, aY = 0, aZ = 0] = start;
        const [bX = 0, bY = 0, bZ = 0] = end;
        positions.push(aX, aY, aZ, bX, bY, bZ);
      }
      bufferGeometry.setAttribute(
        'position',
        new Float32BufferAttribute(positions, 3)
      );
      mesh = new LineSegments(bufferGeometry, material);
      mesh.layers.set(layer);
      updateUserData(geometry, scene, mesh.userData);
      scene.add(mesh);
      break;
    }
    case 'paths': {
      let transparent = false;
      let opacity = 1;
      const { paths } = geometry;
      const bufferGeometry = new BufferGeometry();
      const material = new LineBasicMaterial({
        color: 0xffffff,
        vertexColors: VertexColors,
        transparent,
        opacity,
      });
      const color = new Color(setColor(definitions, tags, {}, [0, 0, 0]).color);
      const pathColors = [];
      const positions = [];
      for (const path of paths) {
        const entry = { start: Math.floor(positions.length / 3), length: 0 };
        let last = path.length - 1;
        for (let nth = 0; nth < path.length; last = nth, nth += 1) {
          const start = path[last];
          const end = path[nth];
          if (start === null || end === null) continue;
          if (!start.every(isFinite) || !end.every(isFinite)) {
            // Not sure where these non-finite path values are coming from.
            continue;
          }
          const [aX = 0, aY = 0, aZ = 0] = start;
          const [bX = 0, bY = 0, bZ = 0] = end;
          pathColors.push(
            color.r,
            color.g,
            color.b,
            opacity,
            color.r,
            color.g,
            color.b,
            opacity
          );
          if (!isFinite(aX)) throw Error('die');
          if (!isFinite(aY)) throw Error('die');
          if (!isFinite(aZ)) throw Error('die');
          if (!isFinite(bX)) throw Error('die');
          if (!isFinite(bY)) throw Error('die');
          if (!isFinite(bZ)) throw Error('die');
          positions.push(aX, aY, aZ, bX, bY, bZ);
          entry.length += 2;
        }
        if (entry.length > 0) ;
      }
      bufferGeometry.setAttribute(
        'position',
        new Float32BufferAttribute(positions, 3)
      );
      bufferGeometry.setAttribute(
        'color',
        new Float32BufferAttribute(pathColors, 4)
      );
      mesh = new LineSegments(bufferGeometry, material);
      mesh.layers.set(layer);
      updateUserData(geometry, scene, mesh.userData);
      scene.add(mesh);
      break;
    }
    case 'points': {
      const { points } = geometry;
      const threeGeometry = new BufferGeometry();
      const material = new PointsMaterial({
        color: setColor(definitions, tags, {}, [0, 0, 0]).color,
        size: 0.5,
      });
      const positions = [];
      for (const [aX = 0, aY = 0, aZ = 0] of points) {
        positions.push(aX, aY, aZ);
      }
      threeGeometry.setAttribute(
        'position',
        new Float32BufferAttribute(positions, 3)
      );
      mesh = new Points(threeGeometry, material);
      mesh.layers.set(layer);
      updateUserData(geometry, scene, mesh.userData);
      scene.add(mesh);
      break;
    }
    case 'triangles': {
      const prepareTriangles = (triangles) => {
        const normals = [];
        const positions = [];
        for (const triangle of triangles) {
          const plane = toPlane(triangle);
          if (plane === undefined) {
            continue;
          }
          const [px, py, pz] = plane;
          for (const [x = 0, y = 0, z = 0] of triangle) {
            normals.push(px, py, pz);
            positions.push(x, y, z);
          }
        }
        return { normals, positions };
      };

      const { triangles } = geometry;
      const { positions, normals } = prepareTriangles(triangles);
      const bufferGeometry = new BufferGeometry();
      bufferGeometry.setAttribute(
        'position',
        new Float32BufferAttribute(positions, 3)
      );
      bufferGeometry.setAttribute(
        'normal',
        new Float32BufferAttribute(normals, 3)
      );
      applyBoxUV(bufferGeometry);

      if (tags.includes('show:skin')) {
        const material = await buildMeshMaterial(definitions, tags);
        mesh = new Mesh(bufferGeometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.layers.set(layer);
        updateUserData(geometry, scene, mesh.userData);
        mesh.userData.tangible = true;
        if (tags.includes('type:void')) {
          material.transparent = true;
          material.depthWrite = false;
          material.opacity *= 0.1;
          mesh.castShadow = false;
          mesh.receiveShadow = false;
        }
      } else {
        mesh = new Group();
      }

      {
        const edges = new EdgesGeometry(bufferGeometry);
        const outline = new LineSegments(
          edges,
          new LineBasicMaterial({ color: 0x000000 })
        );
        outline.userData.isOutline = true;
        outline.userData.hasShowOutline = tags.includes('show:outline');
        outline.visible = outline.userData.hasShowOutline;
        mesh.add(outline);
      }

      if (tags.includes('show:wireframe')) {
        const edges = new WireframeGeometry(bufferGeometry);
        const outline = new LineSegments(
          edges,
          new LineBasicMaterial({ color: 0x000000 })
        );
        mesh.add(outline);
      }

      scene.add(mesh);
      break;
    }
    case 'polygonsWithHoles': {
      const normal = new Vector3(
        geometry.plane[0],
        geometry.plane[1],
        geometry.plane[2]
      ).normalize();
      const baseNormal = new Vector3(0, 0, 1);
      mesh = new Group();
      for (const { points, holes } of geometry.polygonsWithHoles) {
        const boundaryPoints = [];
        for (const point of points) {
          boundaryPoints.push(new Vector3(point[0], point[1], point[2]));
        }
        const shape = new Shape(boundaryPoints);
        for (const { points } of holes) {
          const holePoints = [];
          for (const point of points) {
            holePoints.push(new Vector3(point[0], point[1], point[2]));
          }
          shape.holes.push(new Path(holePoints));
        }
        const shapeGeometry = new ShapeGeometry(shape);
        const material = await buildMeshMaterial(definitions, tags);
        mesh.add(new Mesh(shapeGeometry, material));
        {
          const edges = new EdgesGeometry(shapeGeometry);
          const outline = new LineSegments(
            edges,
            new LineBasicMaterial({ color: 0x000000 })
          );
          outline.userData.isOutline = true;
          outline.userData.hasShowOutline = tags.includes('show:outline');
          outline.visible = outline.userData.hasShowOutline;
          mesh.add(outline);
        }
      }
      scene.add(mesh);
      // Need to handle the origin shift.
      orient(mesh, normal, baseNormal, geometry.plane[3]);
      break;
    }
    default:
      throw Error(`Non-display geometry: ${geometry.type}`);
  }

  if (mesh && geometry.matrix) {
    const matrix = new Matrix4();
    // Bypass matrix.set to use column-major ordering.
    for (let nth = 0; nth < 16; nth++) {
      matrix.elements[nth] = geometry.matrix[nth];
    }
    mesh.applyMatrix4(matrix);
    mesh.updateMatrix();
  }

  if (geometry.content) {
    if (mesh === undefined) {
      mesh = new Group();
      updateUserData({}, scene, mesh.userData);
      scene.add(mesh);
    }
    for (const content of geometry.content) {
      await buildMeshes({
        geometry: content,
        scene: mesh,
        layer,
        render,
        definitions,
      });
    }
  }
};

const moveToFit = ({
  view,
  camera,
  controls = [],
  scene,
  fitOffset = 1.2,
  withGrid = false,
  gridLayer = GEOMETRY_LAYER,
  pageSize = [],
  gridState = { objects: [], visible: withGrid },
} = {}) => {
  const { fit = true } = view;
  const [length = 100, width = 100] = pageSize;

  let box;

  scene.traverse((object) => {
    if (object instanceof GridHelper) {
      return;
    }
    if (object instanceof LineSegments || object instanceof Mesh) {
      const objectBox = new Box3();
      objectBox.setFromObject(object);
      if (
        !isFinite(objectBox.max.x) ||
        !isFinite(objectBox.max.y) ||
        !isFinite(objectBox.max.z) ||
        !isFinite(objectBox.min.x) ||
        !isFinite(objectBox.min.y) ||
        !isFinite(objectBox.min.z)
      ) {
        return;
      }
      if (box) {
        box = box.union(objectBox);
      } else {
        box = objectBox;
      }
    }
  });

  while (gridState.objects.length > 0) {
    const object = gridState.objects.pop();
    if (object.parent) {
      object.parent.remove(object);
    }
  }

  if (!box) {
    box = new Box3();
    box.setFromObject(scene);
  }

  if (withGrid) {
    const x = Math.max(Math.abs(box.min.x), Math.abs(box.max.x));
    const y = Math.max(Math.abs(box.min.y), Math.abs(box.max.y));
    const length = Math.max(x, y);
    const scale = Math.pow(10, Math.ceil(Math.log10(length)));
    const size = scale;
    {
      const grid = new GridHelper(size / 2, 50, 0x000040, 0x20a020);
      grid.material.transparent = true;
      grid.material.opacity = 0.5;
      grid.rotation.x = -Math.PI / 2;
      grid.position.set(0, 0, -0.1);
      grid.layers.set(gridLayer);
      grid.userData.tangible = false;
      grid.userData.dressing = true;
      grid.userData.grid = true;
      scene.add(grid);
      gridState.objects.push(grid);
    }
    {
      const grid = new GridHelper(size * 2, 20, 0x000040, 0xf04040);
      grid.material.transparent = true;
      grid.material.opacity = 0.5;
      grid.rotation.x = -Math.PI / 2;
      grid.position.set(0, 0, -0.05);
      grid.layers.set(gridLayer);
      grid.userData.tangible = false;
      grid.userData.dressing = true;
      grid.userData.grid = true;
      scene.add(grid);
      gridState.objects.push(grid);
    }
  }
  if (withGrid) {
    const plane = new Mesh(
      new PlaneGeometry(length, width),
      new MeshStandardMaterial({
        color: 0x00ff00,
        // depthWrite: false,
        transparent: true,
        opacity: 0.25,
      })
    );
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.position.set(0, 0, -0.05);
    plane.layers.set(gridLayer);
    plane.userData.tangible = false;
    plane.userData.dressing = true;
    plane.userData.grid = true;
    scene.add(plane);
    gridState.objects.push(plane);
  }

  if (!fit) {
    return;
  }

  for (const control of controls) {
    control.reset();
  }

  const center = box.getCenter(new Vector3());

  const size = {
    x: Math.max(Math.abs(box.min.x), Math.abs(box.max.x)),
    y: Math.max(Math.abs(box.min.y), Math.abs(box.max.y)),
    z: Math.max(Math.abs(box.min.z), Math.abs(box.max.z)),
  };

  const maxSize = Math.max(size.x, size.y, size.z);
  const fitHeightDistance =
    maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
  const fitWidthDistance = fitHeightDistance / (camera.aspect || 1);
  const zoomOut = 1.5;
  const distance =
    fitOffset * Math.max(fitHeightDistance, fitWidthDistance) * zoomOut;

  const target = new Vector3(0, 0, 0);

  const direction = target
    .clone()
    .sub(camera.position)
    .normalize()
    .multiplyScalar(distance);

  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();

  camera.position.copy(center).sub(direction);

  for (const control of controls) {
    control.update();
  }
};

/* global ResizeObserver, requestAnimationFrame */

const buildTrackballControls = ({
  camera,
  render,
  viewerElement,
  view = {},
}) => {
  const { target = [0, 0, 0] } = view;
  const trackballControls = new TrackballControls(camera, viewerElement);
  trackballControls.keys = [65, 83, 68];
  trackballControls.target.set(...target);
  trackballControls.update();
  trackballControls.zoomSpeed = 2.5;
  trackballControls.panSpeed = 1.25;
  trackballControls.rotateSpeed = 2.5;
  trackballControls.staticMoving = true;
  return { trackballControls };
};

const buildAnchorControls = ({
  camera,
  draggableObjects,
  endUpdating,
  scene,
  startUpdating,
  trackballControls,
  viewerElement,
}) => {
  const anchorControls = new AnchorControls(camera, viewerElement, scene);
  anchorControls.enable();
  return { anchorControls };
};

const orbitDisplay = async (
  {
    view = {},
    geometry,
    path,
    canvas,
    withAxes = false,
    withGrid = true,
    gridLayer = GEOMETRY_LAYER,
    definitions,
  } = {},
  page
) => {
  const width = page.offsetWidth;
  const height = page.offsetHeight;

  const geometryLayers = new Layers();
  geometryLayers.set(GEOMETRY_LAYER);

  const planLayers = new Layers();
  planLayers.set(SKETCH_LAYER);

  const {
    camera,
    canvas: displayCanvas,
    renderer,
    scene,
  } = buildScene({
    canvas,
    width,
    height,
    view,
    geometryLayers,
    planLayers,
    withAxes,
  });

  let isUpdating = false;

  let trackballControls;

  const update = () => {
    trackballControls.update();
    anchorControls.change();
    render();
    if (isUpdating) {
      requestAnimationFrame(update);
    }
  };

  const startUpdating = () => {
    if (!isUpdating) {
      isUpdating = true;
      update();
    }
  };

  const endUpdating = () => {
    isUpdating = false;
  };

  let isRendering = false;

  const doRender = () => {
    renderer.clear();
    camera.layers.set(GEOMETRY_LAYER);
    renderer.render(scene, camera);

    renderer.clearDepth();

    camera.layers.set(SKETCH_LAYER);
    renderer.render(scene, camera);

    isRendering = false;
  };

  const render = () => {
    if (isRendering) {
      return;
    }
    isRendering = true;
    requestAnimationFrame(doRender);
  };

  if (!canvas) {
    page.appendChild(displayCanvas);
  }

  ({ trackballControls } = buildTrackballControls({
    camera,
    render,
    view,
    viewerElement: displayCanvas,
  }));

  const { anchorControls } = buildAnchorControls({
    camera,
    endUpdating,
    render,
    scene,
    startUpdating,
    trackballControls,
    view,
    viewerElement: displayCanvas,
  });

  anchorControls.addEventListener('change', update);

  const { resize } = createResizer({
    camera,
    controls: [trackballControls],
    renderer,
    viewerElement: page,
  });

  new ResizeObserver(() => {
    resize();
    render();
  }).observe(page);

  const pageSize = [];

  const gridState = {
    objects: [],
    visible: withGrid,
  };

  const updateFit = () =>
    moveToFit({
      view,
      camera,
      controls: [trackballControls],
      scene,
      withGrid: true,
      gridLayer,
      pageSize,
      gridState,
    });

  const showGrid = (visible) => {
    if (gridState.visible !== visible) {
      gridState.visible = visible;
      for (const object of gridState.objects) {
        object.visible = visible;
      }
      render();
    }
  };

  showGrid(withGrid);

  let moveToFitDone = false;

  const updateGeometry = async (geometry, { fit = true, timestamp } = {}) => {
    for (const object of [...scene.children]) {
      if (
        !object.userData.dressing &&
        (!timestamp ||
          !object.userData.created ||
          object.userData.created < timestamp)
      ) {
        // If the object isn't dressing and was created before the update time, then it should be obsolete.
        scene.remove(object);
      }
    }

    view = { ...view, fit };

    await buildMeshes({
      geometry,
      scene,
      render,
      definitions,
      pageSize,
    });

    if (!moveToFitDone) {
      moveToFitDone = true;
      updateFit();
    }

    render();
  };

  if (geometry) {
    await updateGeometry(geometry);
  }

  trackballControls.addEventListener('start', startUpdating);
  trackballControls.addEventListener('end', endUpdating);

  return {
    camera,
    canvas: displayCanvas,
    anchorControls,
    render,
    renderer,
    scene,
    showGrid,
    trackballControls,
    updateFit,
    updateGeometry,
  };
};

let locked = false;
const pending = [];

const acquire = async () => {
  if (locked) {
    return new Promise((resolve, reject) => pending.push(resolve));
  } else {
    locked = true;
  }
};

const release = async () => {
  if (pending.length > 0) {
    const resolve = pending.pop();
    resolve(true);
  } else {
    locked = false;
  }
};

const staticDisplay = async (
  {
    view = {},
    canvas,
    geometry,
    withAxes = false,
    withGrid = true,
    definitions,
  } = {},
  page
) => {
  if (locked === true) await acquire();
  locked = true;

  const datasets = [];
  const width = page.offsetWidth;
  const height = page.offsetHeight;

  const geometryLayers = new Layers();
  geometryLayers.set(GEOMETRY_LAYER);

  const planLayers = new Layers();
  planLayers.set(SKETCH_LAYER);

  const {
    camera,
    canvas: displayCanvas,
    renderer,
    scene,
  } = buildScene({
    canvas,
    width,
    height,
    view,
    geometryLayers,
    planLayers,
    withAxes,
    preserveDrawingBuffer: true,
  });

  const render = () => {
    renderer.clear();
    camera.layers.set(GEOMETRY_LAYER);
    renderer.render(scene, camera);

    renderer.clearDepth();

    camera.layers.set(SKETCH_LAYER);
    renderer.render(scene, camera);
  };

  const pageSize = [];

  await buildMeshes({ datasets, geometry, scene, definitions, pageSize });

  moveToFit({ datasets, view, camera, scene, withGrid, pageSize });

  render();

  await release();

  return { canvas: displayCanvas, renderer };
};

const UP = [0, 0.0001, 1];

const staticView = async (
  shape,
  {
    target = [0, 0, 0],
    position = [0, 0, 0],
    up = UP,
    width = 256,
    height = 128,
    withAxes = false,
    withGrid = false,
    definitions,
    canvas,
  } = {}
) => {
  const { canvas: rendererCanvas } = await staticDisplay(
    {
      view: { target, position, up },
      canvas,
      geometry: shape.toDisplayGeometry(),
      withAxes,
      withGrid,
      definitions,
    },
    { offsetWidth: width, offsetHeight: height }
  );
  return rendererCanvas;
};

const dataUrl = async (shape, options) => {
  const dataUrl = (await staticView(shape, options)).toDataURL('png');
  return dataUrl;
};

const image = async (shape, options) => {
  const image = document.createElement('img');
  const dataUrl = (await staticView(shape, options)).toDataURL('png');
  image.src = dataUrl;
  return image;
};

const orbitView = async (
  shape,
  { target, position, up = UP, width = 256, height = 128, definitions } = {}
) => {
  const container = document.createElement('div');
  container.style = `width: ${width}px; height: ${height}px`;

  const geometry = shape.toKeptGeometry();
  const view = { target, position, up };

  await orbitDisplay({ geometry, view, definitions }, container);
  return container;
};

const addVoxel = ({ editId, point, scene, threejsMesh }) => {
  const box = new BoxGeometry(1, 1, 1);
  const mesh = new Mesh(box, threejsMesh.material);
  mesh.userData.editId = editId;
  mesh.userData.ephemeral = true;
  mesh.userData.tangible = true;
  mesh.position.set(...point);
  scene.add(mesh);
};

const round = (value, resolution) =>
  Math.round(value / resolution) * resolution;

const getWorldPosition = (object, resolution = 0.01) => {
  const vector = new Vector3();
  object.getWorldPosition(vector);
  return [
    round(vector.x, resolution),
    round(vector.y, resolution),
    round(vector.z, resolution),
  ];
};

export { addVoxel, buildMeshes, buildScene, createResizer, dataUrl, getWorldPosition, image, orbitDisplay, orbitView, raycast, staticDisplay, staticView };
