import { reverseFaceOrientationsOfGraph, taggedGraph, taggedGroup } from './jsxcad-geometry.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OBJFile = function () {
  function OBJFile(fileContents, defaultModelName) {
    _classCallCheck(this, OBJFile);

    this._reset();
    this.fileContents = fileContents;
    this.defaultModelName = defaultModelName || 'untitled';
  }

  _createClass(OBJFile, [{
    key: '_reset',
    value: function _reset() {
      this.result = {
        models: [],
        materialLibraries: []
      };
      this.currentMaterial = '';
      this.currentGroup = '';
      this.smoothingGroup = 0;
    }
  }, {
    key: 'parse',
    value: function parse() {
      this._reset();

      var _stripComments = function _stripComments(lineString) {
        var commentIndex = lineString.indexOf('#');
        if (commentIndex > -1) {
          return lineString.substring(0, commentIndex);
        }
        return lineString;
      };

      var lines = this.fileContents.split('\n');
      for (var i = 0; i < lines.length; i += 1) {
        var line = _stripComments(lines[i]);

        var lineItems = line.replace(/\s\s+/g, ' ').trim().split(' ');

        switch (lineItems[0].toLowerCase()) {
          case 'o':
            // Start A New Model
            this._parseObject(lineItems);
            break;
          case 'g':
            // Start a new polygon group
            this._parseGroup(lineItems);
            break;
          case 'v':
            // Define a vertex for the current model
            this._parseVertexCoords(lineItems);
            break;
          case 'vt':
            // Texture Coords
            this._parseTextureCoords(lineItems);
            break;
          case 'vn':
            // Define a vertex normal for the current model
            this._parseVertexNormal(lineItems);
            break;
          case 's':
            // Smooth shading statement
            this._parseSmoothShadingStatement(lineItems);
            break;
          case 'f':
            // Define a Face/Polygon
            this._parsePolygon(lineItems);
            break;
          case 'mtllib':
            // Reference to a material library file (.mtl)
            this._parseMtlLib(lineItems);
            break;
          case 'usemtl':
            // Sets the current material to be applied to polygons defined from this point forward
            this._parseUseMtl(lineItems);
            break;
        }
      }

      return this.result;
    }
  }, {
    key: '_currentModel',
    value: function _currentModel() {
      if (this.result.models.length == 0) {
        this.result.models.push({
          name: this.defaultModelName,
          vertices: [],
          textureCoords: [],
          vertexNormals: [],
          faces: []
        });
        this.currentGroup = '';
        this.smoothingGroup = 0;
      }

      return this.result.models[this.result.models.length - 1];
    }
  }, {
    key: '_parseObject',
    value: function _parseObject(lineItems) {
      var modelName = lineItems.length >= 2 ? lineItems[1] : this.defaultModelName;
      this.result.models.push({
        name: modelName,
        vertices: [],
        textureCoords: [],
        vertexNormals: [],
        faces: []
      });
      this.currentGroup = '';
      this.smoothingGroup = 0;
    }
  }, {
    key: '_parseGroup',
    value: function _parseGroup(lineItems) {
      if (lineItems.length != 2) {
        throw 'Group statements must have exactly 1 argument (eg. g group_1)';
      }

      this.currentGroup = lineItems[1];
    }
  }, {
    key: '_parseVertexCoords',
    value: function _parseVertexCoords(lineItems) {
      var x = lineItems.length >= 2 ? parseFloat(lineItems[1]) : 0.0;
      var y = lineItems.length >= 3 ? parseFloat(lineItems[2]) : 0.0;
      var z = lineItems.length >= 4 ? parseFloat(lineItems[3]) : 0.0;

      this._currentModel().vertices.push({ x: x, y: y, z: z });
    }
  }, {
    key: '_parseTextureCoords',
    value: function _parseTextureCoords(lineItems) {
      var u = lineItems.length >= 2 ? parseFloat(lineItems[1]) : 0.0;
      var v = lineItems.length >= 3 ? parseFloat(lineItems[2]) : 0.0;
      var w = lineItems.length >= 4 ? parseFloat(lineItems[3]) : 0.0;

      this._currentModel().textureCoords.push({ u: u, v: v, w: w });
    }
  }, {
    key: '_parseVertexNormal',
    value: function _parseVertexNormal(lineItems) {
      var x = lineItems.length >= 2 ? parseFloat(lineItems[1]) : 0.0;
      var y = lineItems.length >= 3 ? parseFloat(lineItems[2]) : 0.0;
      var z = lineItems.length >= 4 ? parseFloat(lineItems[3]) : 0.0;

      this._currentModel().vertexNormals.push({ x: x, y: y, z: z });
    }
  }, {
    key: '_parsePolygon',
    value: function _parsePolygon(lineItems) {
      var totalVertices = lineItems.length - 1;
      if (totalVertices < 3) {
        throw 'Face statement has less than 3 vertices' + this.filePath + this.lineNumber;
      }

      var face = {
        material: this.currentMaterial,
        group: this.currentGroup,
        smoothingGroup: this.smoothingGroup,
        vertices: []
      };

      for (var i = 0; i < totalVertices; i += 1) {
        var vertexString = lineItems[i + 1];
        var vertexValues = vertexString.split('/');

        if (vertexValues.length < 1 || vertexValues.length > 3) {
          throw 'Two many values (separated by /) for a single vertex' + this.filePath + this.lineNumber;
        }

        var vertexIndex = 0;
        var textureCoordsIndex = 0;
        var vertexNormalIndex = 0;
        vertexIndex = parseInt(vertexValues[0]);
        if (vertexValues.length > 1 && !vertexValues[1] == '') {
          textureCoordsIndex = parseInt(vertexValues[1]);
        }
        if (vertexValues.length > 2) {
          vertexNormalIndex = parseInt(vertexValues[2]);
        }

        if (vertexIndex == 0) {
          throw 'Faces uses invalid vertex index of 0';
        }

        // Negative vertex indices refer to the nth last defined vertex
        // convert these to postive indices for simplicity
        if (vertexIndex < 0) {
          vertexIndex = this._currentModel().vertices.length + 1 + vertexIndex;
        }

        face.vertices.push({
          vertexIndex: vertexIndex,
          textureCoordsIndex: textureCoordsIndex,
          vertexNormalIndex: vertexNormalIndex
        });
      }
      this._currentModel().faces.push(face);
    }
  }, {
    key: '_parseMtlLib',
    value: function _parseMtlLib(lineItems) {
      if (lineItems.length >= 2) {
        this.result.materialLibraries.push(lineItems[1]);
      }
    }
  }, {
    key: '_parseUseMtl',
    value: function _parseUseMtl(lineItems) {
      if (lineItems.length >= 2) {
        this.currentMaterial = lineItems[1];
      }
    }
  }, {
    key: '_parseSmoothShadingStatement',
    value: function _parseSmoothShadingStatement(lineItems) {
      if (lineItems.length != 2) {
        throw 'Smoothing group statements must have exactly 1 argument (eg. s <number|off>)';
      }

      var groupNumber = lineItems[1].toLowerCase() == 'off' ? 0 : parseInt(lineItems[1]);
      this.smoothingGroup = groupNumber;
    }
  }]);

  return OBJFile;
}();

var OBJFile_1 = OBJFile;

const fromObjSync = (data, { invert = false } = {}) => {
  const { models } = new OBJFile_1(new TextDecoder('utf8').decode(data)).parse();

  const group = [];

  for (const model of models) {
    const { vertices, faces } = model;

    let graph = { points: [], exactPoints: [], edges: [], facets: [] };

    for (const { x, y, z } of vertices) {
      graph.points.push([x, y, z]);
    }

    for (const { vertices } of faces) {
      const facet = graph.facets.length;
      const firstEdgeId = graph.edges.length;
      let edge;
      for (const { vertexIndex } of vertices) {
        edge = { point: vertexIndex - 1, next: graph.edges.length + 1, facet };
        graph.edges.push(edge);
      }
      edge.next = firstEdgeId;
      graph.facets[facet] = { edge: firstEdgeId };
    }
    if (invert) {
      graph = reverseFaceOrientationsOfGraph(graph);
    }
    group.push(taggedGraph({}, graph));
  }

  return taggedGroup({}, ...group);
};

const fromObj = async (data, options = {}) => fromObjSync(data, options);

export { fromObj, fromObjSync };
