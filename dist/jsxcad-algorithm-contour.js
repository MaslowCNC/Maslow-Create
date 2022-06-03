import { link, taggedPoints } from './jsxcad-geometry.js';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var marchingsquares = createCommonjsModule(function (module, exports) {
/*!
* MarchingSquaresJS
* version 1.3.3
* https://github.com/RaumZeit/MarchingSquares.js
*
* @license GNU Affero General Public License.
* Copyright (c) 2015-2019 Ronny Lorenz <ronny@tbi.univie.ac.at>
*/


(function (global, factory) {
  factory(exports) ;
}(commonjsGlobal, (function (exports) {
  /*
   *  Compute the distance of a value 'v' from 'a' through linear interpolation
   *  between the values of 'a' and 'b'
   *
   *  Note, that we assume that 'a' and 'b' have unit distance (i.e. 1)
   */
  function linear(a, b, v) {
    if (a < b)
      return (v - a) / (b - a);

    return (a - v) / (a - b);
  }


  /*
   *  Compute the distance of a pair of values ('v0', 'v1') from 'a' through linear interpolation
   *  between the values of 'a' and 'b'
   *
   *  This function assumes that exactly one value, 'v0' or 'v1', is actually located
   *  between 'a' and 'b', and choses the right one automagically
   *
   *  Note, that we assume that 'a' and 'b' have unit distance (i.e. 1)
   */
  function linear_ab(a, b, v0, v1) {
    var tmp;

    if (v0 > v1) {
      tmp = v0;
      v0  = v1;
      v1  = tmp;
    }

    if (a < b) {
      if (a < v0)
        return (v0 - a) / (b - a);
      else
        return (v1 - a) / (b - a);
    } else if (a > v1) {
      return (a - v1) / (a - b);
    }

    return (a - v0) / (a - b);
  }


  /*
   *  Compute the distance of a pair of values ('v0', 'v1') from 'a' through linear interpolation
   *  between the values of 'a' and 'b'
   *
   *  This function automagically choses the value 'vN' that is closer to 'a'
   *
   *  Note, that we assume that 'a' and 'b' have unit distance (i.e. 1)
   */
  function linear_a(a, b, minV, maxV) {
    if (a < b)
      return (minV - a) / (b - a);

    return (a - maxV) / (a - b);
  }


  /*
   *  Compute the distance of a pair of values ('v0', 'v1') from 'a' through linear interpolation
   *  between the values of 'a' and 'b'
   *
   *  This function automagically choses the value 'vN' that is closer to 'b'
   *
   *  Note, that we assume that 'a' and 'b' have unit distance (i.e. 1)
   */
  function linear_b(a, b, minV, maxV) {
    if (a < b)
      return (maxV - a) / (b - a);

    return (a - minV) / (a - b);
  }

  function Options() {
    /* Settings common to all implemented algorithms */
    this.successCallback  = null;
    this.verbose          = false;
    this.polygons         = false;
    this.polygons_full    = false;
    this.linearRing       = true;
    this.noQuadTree       = false;
    this.noFrame          = false;
  }


  /* Compose settings specific to IsoBands algorithm */
  function isoBandOptions(userSettings) {
    var i,
      key,
      val,
      bandOptions,
      optionKeys;

    bandOptions   = new Options();
    userSettings  = userSettings ? userSettings : {};
    optionKeys    = Object.keys(bandOptions);

    for(i = 0; i < optionKeys.length; i++) {
      key = optionKeys[i];
      val = userSettings[key];
      if ((typeof val !== 'undefined') && (val !== null))
        bandOptions[key] = val;
    }

    /* restore compatibility */
    bandOptions.polygons_full  = !bandOptions.polygons;

    /* add interpolation functions (not yet user customizable) */
    bandOptions.interpolate   = linear_ab;
    bandOptions.interpolate_a = linear_a;
    bandOptions.interpolate_b = linear_b;

    return bandOptions;
  }


  /* Compose settings specific to IsoLines algorithm */
  function isoLineOptions(userSettings) {
    var i,
      key,
      val,
      lineOptions,
      optionKeys;

    lineOptions   = new Options();
    userSettings  = userSettings ? userSettings : {};
    optionKeys    = Object.keys(lineOptions);

    for(i = 0; i < optionKeys.length; i++) {
      key = optionKeys[i];
      val = userSettings[key];
      if ((typeof val !== 'undefined') && (val !== null))
        lineOptions[key] = val;
    }

    /* restore compatibility */
    lineOptions.polygons_full  = !lineOptions.polygons;

    /* add interpolation functions (not yet user customizable) */
    lineOptions.interpolate   = linear;

    return lineOptions;
  }

  function cell2Polygons(cell, x, y, settings) {
    var polygons = [];

    cell.polygons.forEach(function(p) {
      p.forEach(function(pp) {
        pp[0] += x;
        pp[1] += y;
      });

      if (settings.linearRing)
        p.push(p[0]);

      polygons.push(p);
    });

    return polygons;
  }

  function entry_coordinate(x, y, mode, path) {
    if (mode === 0) { /* down */
      x += 1;
      y += path[0][1];
    } else if (mode === 1) { /* left */
      x += path[0][0];
    } else if (mode === 2) { /* up */
      y += path[0][1];
    } else if (mode === 3) { /* right */
      x += path[0][0];
      y += 1;
    }

    return [ x, y ];
  }


  function skip_coordinate(x, y, mode) {
    if (mode === 0) { /* down */
      x++;
    } else if (mode === 1) ; else if (mode === 2) { /* up */
      y++;
    } else if (mode === 3) { /* right */
      x++;
      y++;
    }

    return [ x, y ];
  }


  function requireFrame(data, lowerBound, upperBound) {
    var frameRequired,
      cols,
      rows,
      i,
      j;

    frameRequired = true;
    cols          = data[0].length;
    rows          = data.length;

    for (j = 0; j < rows; j++) {
      if ((data[j][0] < lowerBound) ||
          (data[j][0] > upperBound) ||
          (data[j][cols - 1] < lowerBound) ||
          (data[j][cols - 1] > upperBound)) {
        frameRequired = false;
        break;
      }
    }

    if ((frameRequired) &&
        ((data[rows - 1][0] < lowerBound) ||
        (data[rows - 1][0] > upperBound) ||
        (data[rows - 1][cols - 1] < lowerBound) ||
        (data[rows - 1][cols - 1] > upperBound))) {
      frameRequired = false;
    }

    if (frameRequired)
      for (i = 0; i < cols - 1; i++) {
        if ((data[0][i] < lowerBound) ||
            (data[0][i] > upperBound) ||
            (data[rows - 1][i] < lowerBound) ||
            (data[rows - 1][i] > upperBound)) {
          frameRequired = false;
          break;
        }
      }


    return frameRequired;
  }


  function requireLineFrame(data, threshold) {
    var frameRequired,
      cols,
      rows,
      i,
      j;

    frameRequired = true;
    cols          = data[0].length;
    rows          = data.length;

    for (j = 0; j < rows; j++) {
      if ((data[j][0] >= threshold) ||
          (data[j][cols - 1] >= threshold)) {
        frameRequired = false;
        break;
      }
    }

    if ((frameRequired) &&
        ((data[rows - 1][0] >= threshold) ||
        (data[rows - 1][cols - 1] >= threshold))) {
      frameRequired = false;
    }

    if (frameRequired)
      for (i = 0; i < cols - 1; i++) {
        if ((data[0][i] >= threshold) ||
            (data[rows - 1][i] > threshold)) {
          frameRequired = false;
          break;
        }
      }

    return frameRequired;
  }


  function traceBandPaths(data, cellGrid, settings) {
    var nextedge,
      path,
      e,
      ee,
      s,
      ve,
      enter,
      x,
      y,
      finalized,
      origin,
      cc,
      dir,
      count,
      point,
      found_entry;

    var polygons = [];
    var rows = data.length - 1;
    var cols = data[0].length - 1;

    /*
     * directions for out-of-grid moves are:
     * 0 ... "down",
     * 1 ... "left",
     * 2 ... "up",
     * 3 ... "right"
     */
    var valid_entries = [ ['rt', 'rb'], /* down */
      ['br', 'bl'], /* left */
      ['lb', 'lt'], /* up */
      ['tl', 'tr']  /* right */
    ];
    var add_x         = [ 0, -1, 0, 1 ];
    var add_y         = [ -1, 0, 1, 0 ];
    var available_starts = [ 'bl', 'lb', 'lt', 'tl', 'tr', 'rt', 'rb', 'br' ];
    var entry_dir     =  {
      bl: 1, br: 1,
      lb: 2, lt: 2,
      tl: 3, tr: 3,
      rt: 0, rb: 0
    };

    if (requireFrame(data, settings.minV, settings.maxV)) {
      if (settings.linearRing)
        polygons.push([ [0, 0], [0, rows], [cols, rows], [cols, 0], [0, 0] ]);
      else
        polygons.push([ [0, 0], [0, rows], [cols, rows], [cols, 0] ]);
    }

    /* finally, start tracing back first polygon(s) */
    cellGrid.forEach(function(a, i) {
      a.forEach(function(cell, j) {
        nextedge = null;

        /* trace paths for all available edges that go through this cell */
        for (e = 0; e < 8; e++) {
          nextedge = available_starts[e];

          if (typeof cell.edges[nextedge] !== 'object')
            continue;

          /* start a new, full path */
          path              = [];
          ee                = cell.edges[nextedge];
          enter             = nextedge;
          x                 = i;
          y                 = j;
          finalized         = false;
          origin            = [ i + ee.path[0][0], j + ee.path[0][1] ];

          /* add start coordinate */
          path.push(origin);

          /* start traceback */
          while (!finalized) {
            cc = cellGrid[x][y];

            if (typeof cc.edges[enter] !== 'object')
              break;

            ee = cc.edges[enter];

            /* remove edge from cell */
            delete cc.edges[enter];

            /* add last point of edge to path arra, since we extend a polygon */
            point = ee.path[1];
            point[0] += x;
            point[1] += y;
            path.push(point);

            enter = ee.move.enter;
            x     = x + ee.move.x;
            y     = y + ee.move.y;

            /* handle out-of-grid moves */
            if ((typeof cellGrid[x] === 'undefined') ||
                (typeof cellGrid[x][y] === 'undefined')) {
              dir   = 0;
              count = 0;

              if (x === cols) {
                x--;
                dir = 0;  /* move downwards */
              } else if (x < 0) {
                x++;
                dir = 2;  /* move upwards */
              } else if (y === rows) {
                y--;
                dir = 3;  /* move right */
              } else if (y < 0) {
                y++;
                dir = 1;  /* move left */
              } else {
                throw new Error('Left the grid somewhere in the interior!');
              }

              if ((x === i) && (y === j) && (dir === entry_dir[nextedge])) {
                finalized = true;
                enter     = nextedge;
                break;
              }

              while (1) {
                found_entry = false;

                if (count > 4)
                  throw new Error('Direction change counter overflow! This should never happen!');

                if (!((typeof cellGrid[x] === 'undefined') ||
                      (typeof cellGrid[x][y] === 'undefined'))) {
                  cc = cellGrid[x][y];

                  /* check for re-entry */
                  for (s = 0; s < valid_entries[dir].length; s++) {
                    ve = valid_entries[dir][s];
                    if (typeof cc.edges[ve] === 'object') {
                      /* found re-entry */
                      ee = cc.edges[ve];
                      path.push(entry_coordinate(x, y, dir, ee.path));
                      enter = ve;
                      found_entry = true;
                      break;
                    }
                  }
                }

                if (found_entry) {
                  break;
                } else {
                  path.push(skip_coordinate(x, y, dir));

                  x += add_x[dir];
                  y += add_y[dir];

                  /* change direction if we'e moved out of grid again */
                  if ((typeof cellGrid[x] === 'undefined') ||
                      (typeof cellGrid[x][y] === 'undefined')) {
                    if (((dir === 0) && (y < 0)) ||
                        ((dir === 1) && (x < 0)) ||
                        ((dir === 2) && (y === rows)) ||
                        ((dir === 3) && (x === cols))) {
                      x -= add_x[dir];
                      y -= add_y[dir];

                      dir = (dir + 1) % 4;
                      count++;
                    }
                  }

                  if ((x === i) && (y === j) && (dir === entry_dir[nextedge])) {
                  /* we are back where we started off, so finalize the polygon */
                    finalized = true;
                    enter     = nextedge;
                    break;
                  }
                }
              }
            }
          }

          if ((settings.linearRing) &&
            ((path[path.length - 1][0] !== origin[0]) ||
            (path[path.length - 1][1] !== origin[1])))
            path.push(origin);

          polygons.push(path);
        } /* end forall entry sites */
      }); /* end foreach i */
    }); /* end foreach j */

    return polygons;
  }


  function traceLinePaths(data, cellGrid, settings) {
    var nextedge,
      e,
      ee,
      cc,
      path,
      enter,
      x,
      y,
      finalized,
      origin,
      point,
      dir,
      count,
      found_entry,
      ve;

    var polygons = [];
    var rows = data.length - 1;
    var cols = data[0].length - 1;

    /*
     * directions for out-of-grid moves are:
     * 0 ... "down",
     * 1 ... "left",
     * 2 ... "up",
     * 3 ... "right"
     */
    var valid_entries = [ 'right',  /* down */
      'bottom', /* left */
      'left',   /* up */
      'top'     /* right */
    ];
    var add_x         = [ 0, -1, 0, 1 ];
    var add_y         = [ -1, 0, 1, 0 ];
    var entry_dir     =  {
      bottom: 1,
      left: 2,
      top: 3,
      right: 0
    };

    /* first, detect whether we need any outer frame */
    if (!settings.noFrame)
      if (requireLineFrame(data, settings.threshold)) {
        if (settings.linearRing)
          polygons.push([ [0, 0], [0, rows], [cols, rows], [cols, 0], [0, 0] ]);
        else
          polygons.push([ [0, 0], [0, rows], [cols, rows], [cols, 0] ]);
      }

    /* finally, start tracing back first polygon(s) */

    cellGrid.forEach(function(a, i) {
      a.forEach(function(cell, j) {
        nextedge = null;

        /* trace paths for all available edges that go through this cell */
        for (e = 0; e < 4; e++) {
          nextedge = valid_entries[e];

          if (typeof cell.edges[nextedge] !== 'object')
            continue;

          /* start a new, full path */
          path              = [];
          ee                = cell.edges[nextedge];
          enter             = nextedge;
          x                 = i;
          y                 = j;
          finalized         = false;
          origin            = [ i + ee.path[0][0], j + ee.path[0][1] ];

          /* add start coordinate */
          path.push(origin);

          /* start traceback */
          while (!finalized) {
            cc = cellGrid[x][y];

            if (typeof cc.edges[enter] !== 'object')
              break;

            ee = cc.edges[enter];

            /* remove edge from cell */
            delete cc.edges[enter];

            /* add last point of edge to path arra, since we extend a polygon */
            point = ee.path[1];
            point[0] += x;
            point[1] += y;
            path.push(point);

            enter = ee.move.enter;
            x     = x + ee.move.x;
            y     = y + ee.move.y;

            /* handle out-of-grid moves */
            if ((typeof cellGrid[x] === 'undefined') ||
                (typeof cellGrid[x][y] === 'undefined')) {

              if (!settings.linearRing)
                break;

              dir   = 0;
              count = 0;

              if (x === cols) {
                x--;
                dir = 0;  /* move downwards */
              } else if (x < 0) {
                x++;
                dir = 2;  /* move upwards */
              } else if (y === rows) {
                y--;
                dir = 3;  /* move right */
              } else if (y < 0) {
                y++;
                dir = 1;  /* move left */
              }

              if ((x === i) && (y === j) && (dir === entry_dir[nextedge])) {
                finalized = true;
                enter     = nextedge;
                break;
              }

              while (1) {
                found_entry = false;

                if (count > 4)
                  throw new Error('Direction change counter overflow! This should never happen!');

                if (!((typeof cellGrid[x] === 'undefined') ||
                      (typeof cellGrid[x][y] === 'undefined'))) {
                  cc = cellGrid[x][y];

                  /* check for re-entry */
                  ve = valid_entries[dir];
                  if (typeof cc.edges[ve] === 'object') {
                    /* found re-entry */
                    ee = cc.edges[ve];
                    path.push(entry_coordinate(x, y, dir, ee.path));
                    enter = ve;
                    found_entry = true;
                    break;
                  }
                }

                if (found_entry) {
                  break;
                } else {
                  path.push(skip_coordinate(x, y, dir));

                  x += add_x[dir];
                  y += add_y[dir];

                  /* change direction if we'e moved out of grid again */
                  if ((typeof cellGrid[x] === 'undefined') ||
                    (typeof cellGrid[x][y] === 'undefined')) {
                    if (((dir === 0) && (y < 0)) ||
                        ((dir === 1) && (x < 0)) ||
                        ((dir === 2) && (y === rows)) ||
                        ((dir === 3) && (x === cols))) {
                      x -= add_x[dir];
                      y -= add_y[dir];

                      dir = (dir + 1) % 4;
                      count++;
                    }
                  }

                  if ((x === i) && (y === j) && (dir === entry_dir[nextedge])) {
                    /* we are back where we started off, so finalize the polygon */
                    finalized = true;
                    enter     = nextedge;
                    break;
                  }
                }
              }
            }
          }

          if ((settings.linearRing) &&
              ((path[path.length - 1][0] !== origin[0]) ||
              (path[path.length - 1][1] !== origin[1])))
            path.push(origin);

          polygons.push(path);
        } /* end forall entry sites */
      }); /* end foreach i */
    }); /* end foreach j */

    return polygons;
  }

  /* quadTree node constructor */
  function TreeNode(data, x, y, dx, dy) {
    var dx_tmp = dx,
      dy_tmp = dy,
      msb_x  = 0,
      msb_y  = 0;

    /* left-bottom corner of current quadrant */
    this.x = x;
    this.y = y;

    /* minimum value in subtree under this node */
    this.lowerBound = null;
    /* maximum value in subtree under this node */
    this.upperBound = null;

    /*
     *  child nodes are layed out in the following way:
     *
     *  (x, y + 1) ---- (x + 1, y + 1)
     *  |             |              |
     *  |      D      |      C       |
     *  |             |              |
     *  |----------------------------|
     *  |             |              |
     *  |      A      |      B       |
     *  |             |              |
     *  (x, y) ------------ (x + 1, y)
     */
    this.childA = null;
    this.childB = null;
    this.childC = null;
    this.childD = null;

    if ((dx === 1) && (dy === 1)) {
      /* do not further subdivision */
      this.lowerBound = Math.min(
        data[y][x],
        data[y][x + 1],
        data[y + 1][x + 1],
        data[y + 1][x]
      );
      this.upperBound = Math.max(
        data[y][x],
        data[y][x + 1],
        data[y + 1][x + 1],
        data[y + 1][x]
      );
    } else {
      /* get most significant bit from dx */
      if (dx > 1) {
        while (dx_tmp !== 0) {
          dx_tmp = dx_tmp >> 1;
          msb_x++;
        }

        if (dx === (1 << (msb_x - 1)))
          msb_x--;

        dx_tmp = 1 << (msb_x - 1);
      }

      /* get most significant bit from dx */
      if (dy > 1) {
        while (dy_tmp !== 0) {
          dy_tmp = dy_tmp >> 1;
          msb_y++;
        }

        if (dy === (1 << (msb_y - 1)))
          msb_y--;

        dy_tmp = 1 << (msb_y - 1);
      }

      this.childA = new TreeNode(data, x, y, dx_tmp, dy_tmp);
      this.lowerBound = this.childA.lowerBound;
      this.upperBound = this.childA.upperBound;

      if (dx - dx_tmp > 0) {
        this.childB = new TreeNode(data, x + dx_tmp, y, dx - dx_tmp, dy_tmp);
        this.lowerBound = Math.min(this.lowerBound, this.childB.lowerBound);
        this.upperBound = Math.max(this.upperBound, this.childB.upperBound);

        if (dy - dy_tmp > 0) {
          this.childC = new TreeNode(data, x + dx_tmp, y + dy_tmp, dx - dx_tmp, dy - dy_tmp);
          this.lowerBound = Math.min(this.lowerBound, this.childC.lowerBound);
          this.upperBound = Math.max(this.upperBound, this.childC.upperBound);
        }
      }

      if (dy - dy_tmp > 0) {
        this.childD = new TreeNode(data, x, y + dy_tmp, dx_tmp, dy - dy_tmp);
        this.lowerBound = Math.min(this.lowerBound, this.childD.lowerBound);
        this.upperBound = Math.max(this.upperBound, this.childD.upperBound);
      }
    }
  }


  /**
   *  Retrieve a list of cells within a particular range of values by
   *  recursivly traversing the quad tree to it's leaves.
   *
   *  @param  subsumed  If 'true' include all cells that are completely
   *                    subsumed within the specified range. Otherwise,
   *                    return only cells where at least one corner is
   *                    outside the specified range.
   *
   *  @return   An array of objects 'o' where each object has exactly two
   *            properties: 'o.x' and 'o.y' denoting the left-bottom corner
   *            of the corresponding cell.
   */
  TreeNode.prototype.cellsInBand = function(lowerBound, upperBound, subsumed) {
    var cells = [];

    subsumed = (typeof subsumed === 'undefined') ? true : subsumed;

    if ((this.lowerBound > upperBound) || (this.upperBound < lowerBound))
      return cells;

    if (!(this.childA || this.childB || this.childC || this.childD)) {
      if ((subsumed) ||
          (this.lowerBound <= lowerBound) ||
          (this.upperBound >= upperBound)) {
        cells.push({
          x: this.x,
          y: this.y
        });
      }
    } else {
      if (this.childA)
        cells = cells.concat(this.childA.cellsInBand(lowerBound, upperBound, subsumed));

      if (this.childB)
        cells = cells.concat(this.childB.cellsInBand(lowerBound, upperBound, subsumed));

      if (this.childD)
        cells = cells.concat(this.childD.cellsInBand(lowerBound, upperBound, subsumed));

      if (this.childC)
        cells = cells.concat(this.childC.cellsInBand(lowerBound, upperBound, subsumed));
    }

    return cells;
  };


  TreeNode.prototype.cellsBelowThreshold = function(threshold, subsumed) {
    var cells = [];

    subsumed = (typeof subsumed === 'undefined') ? true : subsumed;

    if (this.lowerBound > threshold)
      return cells;

    if (!(this.childA || this.childB || this.childC || this.childD)) {
      if ((subsumed) ||
          (this.upperBound >= threshold)) {
        cells.push({
          x: this.x,
          y: this.y
        });
      }
    } else {
      if (this.childA)
        cells = cells.concat(this.childA.cellsBelowThreshold(threshold, subsumed));

      if (this.childB)
        cells = cells.concat(this.childB.cellsBelowThreshold(threshold, subsumed));

      if (this.childD)
        cells = cells.concat(this.childD.cellsBelowThreshold(threshold, subsumed));

      if (this.childC)
        cells = cells.concat(this.childC.cellsBelowThreshold(threshold, subsumed));
    }

    return cells;
  };


  /*
   * Given a scalar field `data` construct a QuadTree
   * to efficiently lookup those parts of the scalar
   * field where values are within a particular
   * range of [lowerbound, upperbound] limits.
   */
  function QuadTree(data) {
    var i, cols;

    /* do some input checking */
    if (!data)
      throw new Error('data is required');

    if (!Array.isArray(data) ||
        !Array.isArray(data[0]))
      throw new Error('data must be scalar field, i.e. array of arrays');

    if (data.length < 2)
      throw new Error('data must contain at least two rows');

    /* check if we've got a regular grid */
    cols = data[0].length;

    if (cols < 2)
      throw new Error('data must contain at least two columns');

    for (i = 1; i < data.length; i++) {
      if (!Array.isArray(data[i]))
        throw new Error('Row ' + i + ' is not an array');

      if (data[i].length != cols)
        throw new Error('unequal row lengths detected, please provide a regular grid');
    }

    /* create pre-processing object */
    this.data = data;
    /* root node, i.e. entry to the data */
    this.root = new TreeNode(data, 0, 0, data[0].length - 1, data.length - 1);
  }

  /* eslint no-console: ["error", { allow: ["log"] }] */


  /*
   * Compute the iso lines for a scalar 2D field given
   * a certain threshold by applying the Marching Squares
   * Algorithm. The function returns a list of path coordinates
   */

  function isoLines(input, threshold, options) {
    var settings,
      i,
      j,
      useQuadTree   = false,
      multiLine     = false,
      tree          = null,
      root          = null,
      data          = null,
      cellGrid      = null,
      linePolygons  = null,
      ret           = [];

    /* validation */
    if (!input) throw new Error('data is required');
    if (threshold === undefined || threshold === null) throw new Error('threshold is required');
    if ((!!options) && (typeof options !== 'object')) throw new Error('options must be an object');

    /* process options */
    settings = isoLineOptions(options);

    /* check for input data */
    if (input instanceof QuadTree) {
      tree = input;
      root = input.root;
      data = input.data;
      if (!settings.noQuadTree)
        useQuadTree = true;
    } else if (Array.isArray(input) && Array.isArray(input[0])) {
      data = input;
    } else {
      throw new Error('input is neither array of arrays nor object retrieved from \'QuadTree()\'');
    }

    /* check and prepare input threshold(s) */
    if (Array.isArray(threshold)) {
      multiLine = true;

      /* activate QuadTree optimization if not explicitly forbidden by user settings */
      if (!settings.noQuadTree)
        useQuadTree = true;

      /* check if all minV are numbers */
      for (i = 0; i < threshold.length; i++)
        if (isNaN(+threshold[i]))
          throw new Error('threshold[' + i + '] is not a number');
    } else {
      if (isNaN(+threshold))
        throw new Error('threshold must be a number or array of numbers');

      threshold = [ threshold ];
    }

    /* create QuadTree root node if not already present */
    if ((useQuadTree) && (!root)) {
      tree = new QuadTree(data);
      root = tree.root;
      data = tree.data;
    }

    if (settings.verbose) {
      if(settings.polygons)
        console.log('MarchingSquaresJS-isoLines: returning single lines (polygons) for each grid cell');
      else
        console.log('MarchingSquaresJS-isoLines: returning line paths (polygons) for entire data grid');

      if (multiLine)
        console.log('MarchingSquaresJS-isoLines: multiple lines requested, returning array of line paths instead of lines for a single threshold');
    }

    /* Done with all input validation, now let's start computing stuff */

    /* loop over all threhsold values */
    threshold.forEach(function(t, i) {
      linePolygons = [];

      /* store bounds for current computation in settings object */
      settings.threshold = t;

      if(settings.verbose)
        console.log('MarchingSquaresJS-isoLines: computing iso lines for threshold ' + t);

      if (settings.polygons) {
        /* compose list of polygons for each single cell */
        if (useQuadTree) {
          /* go through list of cells retrieved from QuadTree */
          root
            .cellsBelowThreshold(settings.threshold, true)
            .forEach(function(c) {
              linePolygons  = linePolygons.concat(
                cell2Polygons(
                  prepareCell(data,
                    c.x,
                    c.y,
                    settings),
                  c.x,
                  c.y,
                  settings
                ));
            });
        } else {
          /* go through entire array of input data */
          for (j = 0; j < data.length - 1; ++j) {
            for (i = 0; i < data[0].length - 1; ++i)
              linePolygons  = linePolygons.concat(
                cell2Polygons(
                  prepareCell(data,
                    i,
                    j,
                    settings),
                  i,
                  j,
                  settings
                ));
          }
        }
      } else {
        /* sparse grid of input data cells */
        cellGrid = [];
        for (i = 0; i < data[0].length - 1; ++i)
          cellGrid[i] = [];

        /* compose list of polygons for entire input grid */
        if (useQuadTree) {
          /* collect the cells */
          root
            .cellsBelowThreshold(settings.threshold, false)
            .forEach(function(c) {
              cellGrid[c.x][c.y] = prepareCell(data,
                c.x,
                c.y,
                settings);
            });
        } else {
          /* prepare cells */
          for (i = 0; i < data[0].length - 1; ++i) {
            for (j = 0; j < data.length - 1; ++j) {
              cellGrid[i][j]  = prepareCell(data,
                i,
                j,
                settings);
            }
          }
        }

        linePolygons = traceLinePaths(data, cellGrid, settings);
      }

      /* finally, add polygons to output array */
      if (multiLine)
        ret.push(linePolygons);
      else
        ret = linePolygons;

      if(typeof settings.successCallback === 'function')
        settings.successCallback(ret, t);

    });

    return ret;
  }

  /*
   * Thats all for the public interface, below follows the actual
   * implementation
   */

  /*
   * ################################
   * Isocontour implementation below
   * ################################
   */

  function prepareCell(grid, x, y, settings) {
    var left,
      right,
      top,
      bottom,
      average,
      cell;

    var cval      = 0;
    var x3        = grid[y + 1][x];
    var x2        = grid[y + 1][x + 1];
    var x1        = grid[y][x + 1];
    var x0        = grid[y][x];
    var threshold = settings.threshold;

    /*
     * Note that missing data within the grid will result
     * in horribly failing to trace full polygon paths
     */
    if(isNaN(x0) || isNaN(x1) || isNaN(x2) || isNaN(x3)) {
      return;
    }

    /*
     * Here we detect the type of the cell
     *
     * x3 ---- x2
     * |      |
     * |      |
     * x0 ---- x1
     *
     * with edge points
     *
     * x0 = (x,y),
     * x1 = (x + 1, y),
     * x2 = (x + 1, y + 1), and
     * x3 = (x, y + 1)
     *
     * and compute the polygon intersections with the edges
     * of the cell. Each edge value may be (i) smaller, or (ii)
     * greater or equal to the iso line threshold. We encode
     * this property using 1 bit of information, where
     *
     * 0 ... below,
     * 1 ... above or equal
     *
     * Then we store the cells value as vector
     *
     * cval = (x0, x1, x2, x3)
     *
     * where x0 is the least significant bit (0th),
     * x1 the 2nd bit, and so on. This essentially
     * enables us to work with a single integer number
     */

    cval |= ((x3 >= threshold) ? 8 : 0);
    cval |= ((x2 >= threshold) ? 4 : 0);
    cval |= ((x1 >= threshold) ? 2 : 0);
    cval |= ((x0 >= threshold) ? 1 : 0);

    /* make sure cval is a number */
    cval = +cval;

    /* compose the cell object */
    cell = {
      cval:         cval,
      polygons:     [],
      edges:        {},
      x0:           x0,
      x1:           x1,
      x2:           x2,
      x3:           x3
    };

    /*
     * Compute interpolated intersections of the polygon(s)
     * with the cell borders and (i) add edges for polygon
     * trace-back, or (ii) a list of small closed polygons
     */
    switch (cval) {
    case 0:
      if (settings.polygons)
        cell.polygons.push([ [0, 0], [0, 1], [1, 1], [1, 0] ]);

      break;

    case 15:
      /* cell is outside (above) threshold, no polygons */
      break;

    case 14: /* 1110 */
      left    = settings.interpolate(x0, x3, threshold);
      bottom  = settings.interpolate(x0, x1, threshold);

      if (settings.polygons_full) {
        cell.edges.left = {
          path: [ [0, left], [bottom, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'top'
          }
        };
      }

      if (settings.polygons)
        cell.polygons.push([ [0, 0], [0, left], [bottom, 0] ]);

      break;

    case 13: /* 1101 */
      bottom  = settings.interpolate(x0, x1, threshold);
      right   = settings.interpolate(x1, x2, threshold);

      if (settings.polygons_full) {
        cell.edges.bottom = {
          path: [ [bottom, 0], [1, right] ],
          move: {
            x:      1,
            y:      0,
            enter:  'left'
          }
        };
      }

      if (settings.polygons)
        cell.polygons.push([ [bottom, 0], [1, right], [1, 0] ]);

      break;

    case 11: /* 1011 */
      right = settings.interpolate(x1, x2, threshold);
      top   = settings.interpolate(x3, x2, threshold);

      if (settings.polygons_full) {
        cell.edges.right = {
          path: [ [1, right], [top, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'bottom'
          }
        };
      }

      if (settings.polygons)
        cell.polygons.push([ [1, right], [top, 1], [1, 1] ]);

      break;

    case 7: /* 0111 */
      left  = settings.interpolate(x0, x3, threshold);
      top   = settings.interpolate(x3, x2, threshold);

      if (settings.polygons_full) {
        cell.edges.top = {
          path: [ [top, 1], [0, left] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'right'
          }
        };
      }

      if (settings.polygons)
        cell.polygons.push([ [top, 1], [0, left], [0, 1] ]);

      break;

    case 1: /* 0001 */
      left    = settings.interpolate(x0, x3, threshold);
      bottom  = settings.interpolate(x0, x1, threshold);

      if (settings.polygons_full) {
        cell.edges.bottom = {
          path: [ [bottom, 0], [0, left] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'right'
          }
        };
      }

      if (settings.polygons)
        cell.polygons.push([ [bottom, 0], [0, left], [0, 1], [1, 1], [1, 0] ]);

      break;

    case 2: /* 0010 */
      bottom  = settings.interpolate(x0, x1, threshold);
      right   = settings.interpolate(x1, x2, threshold);

      if (settings.polygons_full) {
        cell.edges.right = {
          path: [ [1, right], [bottom, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'top'
          }
        };
      }

      if (settings.polygons)
        cell.polygons.push([ [0, 0], [0, 1], [1, 1], [1, right], [bottom, 0] ]);

      break;

    case 4: /* 0100 */
      right = settings.interpolate(x1, x2, threshold);
      top   = settings.interpolate(x3, x2, threshold);

      if (settings.polygons_full) {
        cell.edges.top = {
          path: [ [top, 1], [1, right] ],
          move: {
            x:      1,
            y:      0,
            enter:  'left'
          }
        };
      }

      if (settings.polygons)
        cell.polygons.push([ [0, 0], [0, 1], [top, 1], [1, right], [1, 0] ]);

      break;

    case 8: /* 1000 */
      left  = settings.interpolate(x0, x3, threshold);
      top   = settings.interpolate(x3, x2, threshold);

      if (settings.polygons_full) {
        cell.edges.left = {
          path: [ [0, left], [top, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'bottom'
          }
        };
      }

      if (settings.polygons)
        cell.polygons.push([ [0, 0], [0, left], [top, 1], [1, 1], [1, 0] ]);

      break;

    case 12: /* 1100 */
      left  = settings.interpolate(x0, x3, threshold);
      right = settings.interpolate(x1, x2, threshold);

      if (settings.polygons_full) {
        cell.edges.left = {
          path: [ [0, left], [1, right] ],
          move: {
            x:      1,
            y:      0,
            enter:  'left'
          }
        };
      }

      if (settings.polygons)
        cell.polygons.push([ [0, 0], [0, left], [1, right], [1, 0] ]);

      break;

    case 9: /* 1001 */
      bottom  = settings.interpolate(x0, x1, threshold);
      top     = settings.interpolate(x3, x2, threshold);

      if (settings.polygons_full) {
        cell.edges.bottom = {
          path: [ [bottom, 0], [top, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'bottom'
          }
        };
      }

      if (settings.polygons)
        cell.polygons.push([ [bottom, 0], [top, 1], [1, 1], [1, 0] ]);

      break;

    case 3: /* 0011 */
      left  = settings.interpolate(x0, x3, threshold);
      right = settings.interpolate(x1, x2, threshold);

      if (settings.polygons_full) {
        cell.edges.right = {
          path: [ [1, right], [0, left] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'right'
          }
        };
      }

      if (settings.polygons)
        cell.polygons.push([ [0, left], [0, 1], [1, 1], [1, right] ]);

      break;

    case 6: /* 0110 */
      bottom  = settings.interpolate(x0, x1, threshold);
      top     = settings.interpolate(x3, x2, threshold);

      if (settings.polygons_full) {
        cell.edges.top = {
          path: [ [top, 1], [bottom, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'top'
          }
        };
      }

      if (settings.polygons)
        cell.polygons.push([ [0, 0], [0, 1], [top, 1], [bottom, 0] ]);

      break;

    case 10: /* 1010 */
      left    = settings.interpolate(x0, x3, threshold);
      right   = settings.interpolate(x1, x2, threshold);
      bottom  = settings.interpolate(x0, x1, threshold);
      top     = settings.interpolate(x3, x2, threshold);
      average = (x0 + x1 + x2 + x3) / 4;

      if (settings.polygons_full) {
        if (average < threshold) {
          cell.edges.left = {
            path: [ [0, left], [top, 1] ],
            move: {
              x:      0,
              y:      1,
              enter:  'bottom'
            }
          };
          cell.edges.right = {
            path: [ [1, right], [bottom, 0] ],
            move: {
              x:      0,
              y:      -1,
              enter:  'top'
            }
          };
        } else {
          cell.edges.right = {
            path: [ [1, right], [top, 1] ],
            move: {
              x:      0,
              y:      1,
              enter:  'bottom'
            }
          };
          cell.edges.left = {
            path: [ [0, left], [bottom, 0] ],
            move: {
              x:      0,
              y:      -1,
              enter:  'top'
            }
          };
        }
      }

      if (settings.polygons) {
        if (average < threshold) {
          cell.polygons.push([ [0, 0], [0, left], [top, 1], [1, 1], [1, right], [bottom, 0] ]);
        } else {
          cell.polygons.push([ [0, 0], [0, left], [bottom, 0] ]);
          cell.polygons.push([ [top, 1], [1, 1], [1, right] ]);
        }
      }

      break;

    case 5: /* 0101 */
      left    = settings.interpolate(x0, x3, threshold);
      right   = settings.interpolate(x1, x2, threshold);
      bottom  = settings.interpolate(x0, x1, threshold);
      top     = settings.interpolate(x3, x2, threshold);
      average = (x0 + x1 + x2 + x3) / 4;

      if (settings.polygons_full) {
        if (average < threshold) {
          cell.edges.bottom = {
            path: [ [bottom, 0], [0, left] ],
            move: {
              x:      -1,
              y:      0,
              enter:  'right'
            }
          };
          cell.edges.top = {
            path: [ [top, 1], [1, right] ],
            move: {
              x:      1,
              y:      0,
              enter:  'left'
            }
          };
        } else {
          cell.edges.top = {
            path: [ [top, 1], [0, left] ],
            move: {
              x:      -1,
              y:      0,
              enter:  'right'
            }
          };
          cell.edges.bottom = {
            path: [ [bottom, 0], [1, right] ],
            move: {
              x:      1,
              y:      0,
              enter:  'left'
            }
          };
        }
      }

      if (settings.polygons) {
        if (average < threshold) {
          cell.polygons.push([ [0, left], [0, 1], [top, 1], [1, right], [1, 0], [bottom, 0] ]);
        } else {
          cell.polygons.push([ [0, left], [0, 1], [top, 1] ]);
          cell.polygons.push([ [bottom, 0], [1, right], [1, 0] ]);
        }
      }

      break;
    }

    return cell;
  }

  /* eslint no-console: ["error", { allow: ["log"] }] */


  /*
   * lookup table to generate polygon paths or edges required to
   * trace the full polygon(s)
   */
  var shapeCoordinates = {
    square:       function(cell, x0, x1, x2, x3, opt) {
      if (opt.polygons)
        cell.polygons.push([ [0,0], [0, 1], [1, 1], [1, 0] ]);
    },

    triangle_bl:  function(cell, x0, x1, x2, x3, opt) {
      var bottomleft = opt.interpolate(x0, x1, opt.minV, opt.maxV);
      var leftbottom = opt.interpolate(x0, x3, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.lb = {
          path: [ [0, leftbottom], [bottomleft, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'tl'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [0, leftbottom], [bottomleft, 0], [0, 0] ]);
    },

    triangle_br:  function(cell, x0, x1, x2, x3, opt) {
      var bottomright = opt.interpolate(x0, x1, opt.minV, opt.maxV);
      var rightbottom = opt.interpolate(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.br = {
          path: [ [bottomright, 0], [1, rightbottom] ],
          move: {
            x:      1,
            y:      0,
            enter:  'lb'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [bottomright, 0], [1, rightbottom], [1, 0] ]);
    },

    triangle_tr:  function(cell, x0, x1, x2, x3, opt) {
      var righttop = opt.interpolate(x1, x2, opt.minV, opt.maxV);
      var topright = opt.interpolate(x3, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.rt = {
          path: [ [1, righttop], [topright, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'br'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [1, righttop], [topright, 1], [1, 1] ]);
    },

    triangle_tl:  function(cell, x0, x1, x2, x3, opt) {
      var topleft = opt.interpolate(x3, x2, opt.minV, opt.maxV);
      var lefttop = opt.interpolate(x0, x3, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.tl = {
          path: [ [topleft, 1], [0, lefttop] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'rt'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [0, lefttop], [0, 1], [topleft, 1] ]);
    },

    tetragon_t:   function(cell, x0, x1, x2, x3, opt) {
      var righttop  = opt.interpolate(x1, x2, opt.minV, opt.maxV);
      var lefttop   = opt.interpolate(x0, x3, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.rt = {
          path: [ [1, righttop], [0, lefttop] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'rt'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [0, lefttop], [0, 1], [1, 1], [1, righttop] ]);
    },

    tetragon_r:   function(cell, x0, x1, x2, x3, opt) {
      var bottomright = opt.interpolate(x0, x1, opt.minV, opt.maxV);
      var topright    = opt.interpolate(x3, x2, opt.minV, opt.maxV);
      if (opt.polygons_full) {
        cell.edges.br = {
          path: [ [bottomright, 0], [topright, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'br'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [bottomright, 0], [topright, 1], [1, 1], [1, 0] ]);
    },

    tetragon_b:   function(cell, x0, x1, x2, x3, opt) {
      var leftbottom  = opt.interpolate(x0, x3, opt.minV, opt.maxV);
      var rightbottom = opt.interpolate(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.lb = {
          path: [ [0, leftbottom], [1, rightbottom] ],
          move: {
            x:      1,
            y:      0,
            enter:  'lb'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [0, 0], [0, leftbottom], [1, rightbottom], [1, 0] ]);
    },

    tetragon_l:   function(cell, x0, x1, x2, x3, opt) {
      var topleft     = opt.interpolate(x3, x2, opt.minV, opt.maxV);
      var bottomleft  = opt.interpolate(x0, x1, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.tl = {
          path: [ [topleft, 1], [bottomleft, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'tl'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [0, 0], [0, 1], [topleft, 1], [bottomleft, 0] ]);
    },

    tetragon_bl:  function(cell, x0, x1, x2, x3, opt) {
      var bottomleft  = opt.interpolate_a(x0, x1, opt.minV, opt.maxV);
      var bottomright = opt.interpolate_b(x0, x1, opt.minV, opt.maxV);
      var leftbottom  = opt.interpolate_a(x0, x3, opt.minV, opt.maxV);
      var lefttop     = opt.interpolate_b(x0, x3, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.bl = {
          path: [ [bottomleft, 0], [0, leftbottom] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'rb'
          }
        };
        cell.edges.lt = {
          path: [ [0, lefttop], [bottomright, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'tr'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [bottomleft, 0], [0, leftbottom], [0, lefttop], [bottomright, 0] ]);
    },

    tetragon_br:  function(cell, x0, x1, x2, x3, opt) {
      var bottomleft  = opt.interpolate_a(x0, x1, opt.minV, opt.maxV);
      var bottomright = opt.interpolate_b(x0, x1, opt.minV, opt.maxV);
      var rightbottom = opt.interpolate_a(x1, x2, opt.minV, opt.maxV);
      var righttop    = opt.interpolate_b(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.bl = {
          path: [ [bottomleft, 0], [1, righttop] ],
          move: {
            x: 1,
            y: 0,
            enter: 'lt'
          }
        };
        cell.edges.rb = {
          path: [ [1, rightbottom], [bottomright, 0] ],
          move: {
            x: 0,
            y: -1,
            enter: 'tr'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [bottomleft, 0], [1, righttop], [1, rightbottom], [bottomright, 0] ]);
    },

    tetragon_tr:  function(cell, x0, x1, x2, x3, opt) {
      var topleft     = opt.interpolate_a(x3, x2, opt.minV, opt.maxV);
      var topright    = opt.interpolate_b(x3, x2, opt.minV, opt.maxV);
      var righttop    = opt.interpolate_b(x1, x2, opt.minV, opt.maxV);
      var rightbottom = opt.interpolate_a(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.rb = {
          path: [ [1, rightbottom], [topleft, 1] ],
          move: {
            x: 0,
            y: 1,
            enter: 'bl'
          }
        };
        cell.edges.tr = {
          path: [ [topright, 1], [1, righttop] ],
          move: {
            x: 1,
            y: 0,
            enter: 'lt'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [1, rightbottom], [topleft, 1], [topright, 1], [1, righttop] ]);
    },

    tetragon_tl:  function(cell, x0, x1, x2, x3, opt) {
      var topleft     = opt.interpolate_a(x3, x2, opt.minV, opt.maxV);
      var topright    = opt.interpolate_b(x3, x2, opt.minV, opt.maxV);
      var lefttop     = opt.interpolate_b(x0, x3, opt.minV, opt.maxV);
      var leftbottom  = opt.interpolate_a(x0, x3, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.tr = {
          path: [ [topright, 1], [0, leftbottom] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'rb'
          }
        };
        cell.edges.lt = {
          path: [ [0, lefttop], [topleft, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'bl'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [topright, 1], [0, leftbottom], [0, lefttop], [topleft, 1] ]);
    },

    tetragon_lr:  function(cell, x0, x1, x2, x3, opt) {
      var leftbottom  = opt.interpolate_a(x0, x3, opt.minV, opt.maxV);
      var lefttop     = opt.interpolate_b(x0, x3, opt.minV, opt.maxV);
      var righttop    = opt.interpolate_b(x1, x2, opt.minV, opt.maxV);
      var rightbottom = opt.interpolate_a(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.lt = {
          path: [ [0, lefttop], [1, righttop] ],
          move: {
            x:      1,
            y:      0,
            enter:  'lt'
          }
        };
        cell.edges.rb = {
          path: [ [1, rightbottom], [0, leftbottom] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'rb'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [0, leftbottom], [0, lefttop], [1, righttop], [1, rightbottom] ]);
    },

    tetragon_tb:  function(cell, x0, x1, x2, x3, opt) {
      var topleft     = opt.interpolate_a(x3, x2, opt.minV, opt.maxV);
      var topright    = opt.interpolate_b(x3, x2, opt.minV, opt.maxV);
      var bottomright = opt.interpolate_b(x0, x1, opt.minV, opt.maxV);
      var bottomleft  = opt.interpolate_a(x0, x1, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.tr =  {
          path: [ [topright, 1], [bottomright, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'tr'
          }
        };
        cell.edges.bl = {
          path: [ [bottomleft, 0], [topleft, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'bl'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [bottomleft, 0], [topleft, 1], [topright, 1], [bottomright, 0] ]);
    },

    pentagon_tr:  function(cell, x0, x1, x2, x3, opt) {
      var topleft     = opt.interpolate(x3, x2, opt.minV, opt.maxV);
      var rightbottom = opt.interpolate(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.tl = {
          path: [[topleft, 1], [1, rightbottom]],
          move: {
            x:      1,
            y:      0,
            enter:  'lb'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [0, 0], [0, 1], [topleft, 1], [1, rightbottom], [1, 0] ]);
    },

    pentagon_tl:  function(cell, x0, x1, x2, x3, opt) {
      var leftbottom  = opt.interpolate(x0, x3, opt.minV, opt.maxV);
      var topright    = opt.interpolate(x3, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.lb = {
          path: [ [0, leftbottom], [topright, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'br'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [0, 0], [0, leftbottom], [topright, 1], [1, 1], [1, 0] ]);
    },

    pentagon_br:  function(cell, x0, x1, x2, x3, opt) {
      var bottomleft  = opt.interpolate(x0, x1, opt.minV, opt.maxV);
      var righttop    = opt.interpolate(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.rt = {
          path: [ [1, righttop], [bottomleft, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'tl'
          }
        };
      }
      if (opt.polygons)
        cell.polygons.push([ [0, 0], [0, 1], [1, 1], [1, righttop], [bottomleft, 0] ]);
    },

    pentagon_bl:  function(cell, x0, x1, x2, x3, opt) {
      var lefttop     = opt.interpolate(x0, x3, opt.minV, opt.maxV);
      var bottomright = opt.interpolate(x0, x1, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.br = {
          path: [ [bottomright, 0], [0, lefttop] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'rt'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [0, lefttop], [0, 1], [1, 1], [1, 0], [bottomright, 0] ]);
    },

    pentagon_tr_rl: function(cell, x0, x1, x2, x3, opt) {
      var lefttop     = opt.interpolate(x0, x3, opt.minV, opt.maxV);
      var topleft     = opt.interpolate(x3, x2, opt.minV, opt.maxV);
      var righttop    = opt.interpolate_b(x1, x2, opt.minV, opt.maxV);
      var rightbottom = opt.interpolate_a(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.tl = {
          path: [ [topleft, 1], [1, righttop] ],
          move: {
            x:      1,
            y:      0,
            enter:  'lt'
          }
        };
        cell.edges.rb = {
          path: [ [1, rightbottom], [0, lefttop] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'rt'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [0, lefttop], [0, 1], [topleft, 1], [1, righttop], [1, rightbottom] ]);
    },

    pentagon_rb_bt: function(cell, x0, x1, x2, x3, opt) {
      var righttop    = opt.interpolate(x1, x2, opt.minV, opt.maxV);
      var bottomright = opt.interpolate_b(x0, x1, opt.minV, opt.maxV);
      var bottomleft  = opt.interpolate_a(x0, x1, opt.minV, opt.maxV);
      var topright    = opt.interpolate(x3, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.rt = {
          path: [ [1, righttop], [bottomright, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'tr'
          }
        };
        cell.edges.bl = {
          path: [ [bottomleft, 0], [topright, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'br'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [topright, 1], [1, 1], [1, righttop], [bottomright, 0], [bottomleft, 0] ]);
    },

    pentagon_bl_lr: function(cell, x0, x1, x2, x3, opt) {
      var bottomright = opt.interpolate(x0, x1, opt.minV, opt.maxV);
      var leftbottom  = opt.interpolate_a(x0, x3, opt.minV, opt.maxV);
      var lefttop     = opt.interpolate_b(x0, x3, opt.minV, opt.maxV);
      var rightbottom = opt.interpolate(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.br = {
          path: [ [bottomright, 0], [0, leftbottom] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'rb'
          }
        };
        cell.edges.lt = {
          path: [ [0, lefttop], [1, rightbottom] ],
          move: {
            x:      1,
            y:      0,
            enter:  'lb'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [bottomright, 0], [0, leftbottom], [0, lefttop], [1, rightbottom], [1, 0] ]);
    },

    pentagon_lt_tb: function(cell, x0, x1, x2, x3, opt) {
      var leftbottom  = opt.interpolate(x0, x3, opt.minV, opt.maxV);
      var topleft     = opt.interpolate_a(x3, x2, opt.minV, opt.maxV);
      var topright    = opt.interpolate_b(x3, x2, opt.minV, opt.maxV);
      var bottomleft  = opt.interpolate(x0, x1, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.lb = {
          path: [ [0, leftbottom], [topleft, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'bl'
          }
        };
        cell.edges.tr = {
          path: [ [topright, 1], [bottomleft, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'tl'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [0, 0], [0, leftbottom], [topleft, 1], [topright, 1], [bottomleft, 0] ]);
    },

    pentagon_bl_tb: function(cell, x0, x1, x2, x3, opt) {
      var lefttop     = opt.interpolate(x0, x3, opt.minV, opt.maxV);
      var topleft     = opt.interpolate(x3, x2, opt.minV, opt.maxV);
      var bottomright = opt.interpolate_b(x0, x1, opt.minV, opt.maxV);
      var bottomleft  = opt.interpolate_a(x0, x1, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.bl = {
          path: [ [bottomleft, 0], [0, lefttop] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'rt'
          }
        };
        cell.edges.tl = {
          path: [ [ topleft, 1], [bottomright, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'tr'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [0, lefttop], [0, 1], [topleft, 1], [bottomright, 0], [bottomleft, 0] ]);
    },

    pentagon_lt_rl: function(cell, x0, x1, x2, x3, opt) {
      var leftbottom  = opt.interpolate_a(x0, x3, opt.minV, opt.maxV);
      var lefttop     = opt.interpolate_b(x0, x3, opt.minV, opt.maxV);
      var topright    = opt.interpolate(x3, x2, opt.minV, opt.maxV);
      var righttop    = opt.interpolate(x1, x3, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.lt = {
          path: [ [0, lefttop], [topright, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'br'
          }
        };
        cell.edges.rt = {
          path: [ [1, righttop], [0, leftbottom] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'rb'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [0, leftbottom], [0, lefttop], [topright, 1], [1, 1], [1, righttop] ]);
    },

    pentagon_tr_bt: function(cell, x0, x1, x2, x3, opt) {
      var topleft     = opt.interpolate_a(x3, x2, opt.minV, opt.maxV);
      var topright    = opt.interpolate_b(x3, x2, opt.minV, opt.maxV);
      var rightbottom = opt.interpolate(x1, x2, opt.minV, opt.maxV);
      var bottomright = opt.interpolate(x0, x1, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.br = {
          path: [ [bottomright, 0], [topleft, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'bl'
          }
        };
        cell.edges.tr = {
          path: [ [topright, 1], [1, rightbottom] ],
          move: {
            x:      1,
            y:      0,
            enter:  'lb'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [topleft, 1], [topright, 1], [1, rightbottom], [1, 0], [bottomright, 0] ]);
    },

    pentagon_rb_lr: function(cell, x0, x1, x2, x3, opt) {
      var leftbottom  = opt.interpolate(x0, x3, opt.minV, opt.maxV);
      var righttop    = opt.interpolate_b(x1, x2, opt.minV, opt.maxV);
      var rightbottom = opt.interpolate_a(x1, x2, opt.minV, opt.maxV);
      var bottomleft  = opt.interpolate(x0, x1, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.lb = {
          path: [ [0, leftbottom], [1, righttop] ],
          move: {
            x:      1,
            y:      0,
            enter:  'lt'
          }
        };
        cell.edges.rb = {
          path: [ [1, rightbottom], [bottomleft, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'tl'
          }
        };
      }
      if (opt.polygons)
        cell.polygons.push([ [0, 0], [0, leftbottom], [1, righttop], [1, rightbottom], [bottomleft, 0] ]);
    },

    hexagon_lt_tr:  function(cell, x0, x1, x2, x3, opt) {
      var leftbottom  = opt.interpolate(x0, x3, opt.minV, opt.maxV);
      var topleft     = opt.interpolate_a(x3, x2, opt.minV, opt.maxV);
      var topright    = opt.interpolate_b(x3, x2, opt.minV, opt.maxV);
      var rightbottom = opt.interpolate(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.lb = {
          path: [ [0, leftbottom], [topleft, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'bl'
          }
        };
        cell.edges.tr = {
          path: [ [topright, 1], [1, rightbottom] ],
          move: {
            x:      1,
            y:      0,
            enter:  'lb'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [0, 0], [0, leftbottom], [topleft, 1], [topright, 1], [1, rightbottom], [1, 0] ]);
    },

    hexagon_bl_lt:  function(cell, x0, x1, x2, x3, opt) {
      var bottomright = opt.interpolate(x0, x1, opt.minV, opt.maxV);
      var leftbottom  = opt.interpolate_a(x0, x3, opt.minV, opt.maxV);
      var lefttop     = opt.interpolate_b(x0, x3, opt.minV, opt.maxV);
      var topright    = opt.interpolate(x3, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.br = {
          path: [ [bottomright, 0], [0, leftbottom] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'rb'
          }
        };
        cell.edges.lt = {
          path: [ [0, lefttop], [topright, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'br'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [bottomright, 0], [0, leftbottom], [0, lefttop], [topright, 1], [1, 1], [1, 0] ]);
    },

    hexagon_bl_rb:  function(cell, x0, x1, x2, x3, opt) {
      var bottomleft  = opt.interpolate_a(x0, x1, opt.minV, opt.maxV);
      var bottomright = opt.interpolate_b(x0, x1, opt.minV, opt.maxV);
      var lefttop     = opt.interpolate(x0, x3, opt.minV, opt.maxV);
      var righttop    = opt.interpolate(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.bl = {
          path: [ [bottomleft, 0], [0, lefttop] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'rt'
          }
        };
        cell.edges.rt = {
          path: [ [1, righttop], [bottomright, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'tr'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [bottomleft, 0], [0, lefttop], [0, 1], [1, 1], [1, righttop], [bottomright, 0] ]);
    },

    hexagon_tr_rb:  function(cell, x0, x1, x2, x3, opt) {
      var bottomleft  = opt.interpolate(x0, x1, opt.minV, opt.maxV);
      var topleft     = opt.interpolate(x3, x2, opt.minV, opt.maxV);
      var righttop    = opt.interpolate_b(x1, x2, opt.minV, opt.maxV);
      var rightbottom = opt.interpolate_a(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.tl = {
          path: [ [topleft, 1], [1, righttop] ],
          move: {
            x:      1,
            y:      0,
            enter:  'lt'
          }
        };
        cell.edges.rb = {
          path: [ [1, rightbottom], [bottomleft, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'tl'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [0, 0], [0, 1], [topleft, 1], [1, righttop], [1, rightbottom], [bottomleft, 0] ]);
    },

    hexagon_lt_rb:  function(cell, x0, x1, x2, x3, opt) {
      var leftbottom  = opt.interpolate(x0, x3, opt.minV, opt.maxV);
      var topright    = opt.interpolate(x3, x2, opt.minV, opt.maxV);
      var righttop    = opt.interpolate(x1, x2, opt.minV, opt.maxV);
      var bottomleft  = opt.interpolate(x0, x1, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.lb = {
          path: [ [0, leftbottom], [topright, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'br'
          }
        };
        cell.edges.rt = {
          path: [ [1, righttop], [bottomleft, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'tl'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [0, 0], [0, leftbottom], [topright, 1], [1, 1], [1, righttop], [bottomleft, 0] ]);
    },

    hexagon_bl_tr:  function(cell, x0, x1, x2, x3, opt) {
      var bottomright = opt.interpolate(x0, x1, opt.minV, opt.maxV);
      var lefttop     = opt.interpolate(x0, x3, opt.minV, opt.maxV);
      var topleft     = opt.interpolate(x3, x2, opt.minV, opt.maxV);
      var rightbottom = opt.interpolate(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.br = {
          path: [ [bottomright, 0], [0, lefttop] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'rt'
          }
        };
        cell.edges.tl = {
          path: [ [topleft, 1], [1, rightbottom] ],
          move: {
            x:      1,
            y:      0,
            enter:  'lb'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [bottomright, 0], [0, lefttop], [0, 1], [topleft, 1], [1, rightbottom], [1, 0] ]);
    },

    heptagon_tr:    function(cell, x0, x1, x2, x3, opt) {
      var bottomleft  = opt.interpolate_a(x0, x1, opt.minV, opt.maxV);
      var bottomright = opt.interpolate_b(x0, x1, opt.minV, opt.maxV);
      var leftbottom  = opt.interpolate_a(x0, x3, opt.minV, opt.maxV);
      var lefttop     = opt.interpolate_b(x0, x3, opt.minV, opt.maxV);
      var topright    = opt.interpolate(x3, x2, opt.minV, opt.maxV);
      var righttop    = opt.interpolate(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.bl = {
          path: [ [bottomleft, 0], [0, leftbottom] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'rb'
          }
        };
        cell.edges.lt = {
          path: [ [0, lefttop], [topright, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'br'
          }
        };
        cell.edges.rt = {
          path: [ [1, righttop], [bottomright, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'tr'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [bottomleft, 0], [0, leftbottom], [0, lefttop], [topright, 1], [1, 1], [1, righttop], [bottomright, 0] ]);
    },

    heptagon_bl:    function(cell, x0, x1, x2, x3, opt) {
      var bottomleft  = opt.interpolate(x0, x1, opt.minV, opt.maxV);
      var leftbottom  = opt.interpolate(x0, x3, opt.minV, opt.maxV);
      var topleft     = opt.interpolate_a(x3, x2, opt.minV, opt.maxV);
      var topright    = opt.interpolate_b(x3, x2, opt.minV, opt.maxV);
      var righttop    = opt.interpolate_b(x1, x2, opt.minV, opt.maxV);
      var rightbottom = opt.interpolate_a(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.lb = {
          path: [ [0, leftbottom], [topleft, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'bl'
          }
        };
        cell.edges.tr = {
          path: [ [topright, 1], [1, righttop] ],
          move: {
            x:      1,
            y:      0,
            enter:  'lt'
          }
        };
        cell.edges.rb = {
          path: [ [1, rightbottom], [bottomleft, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'tl'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [0, 0], [0, leftbottom], [topleft, 1], [topright, 1], [1, righttop], [1, rightbottom], [bottomleft, 0] ]);
    },

    heptagon_tl:    function(cell, x0, x1, x2, x3, opt) {
      var bottomleft  = opt.interpolate_a(x0, x1, opt.minV, opt.maxV);
      var bottomright = opt.interpolate_b(x0, x1, opt.minV, opt.maxV);
      var lefttop     = opt.interpolate(x0, x3, opt.minV, opt.maxV);
      var topleft     = opt.interpolate(x3, x2, opt.minV, opt.maxV);
      var righttop    = opt.interpolate_b(x1, x2, opt.minV, opt.maxV);
      var rightbottom = opt.interpolate_a(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.bl = {
          path: [ [bottomleft, 0], [0, lefttop] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'rt'
          }
        };
        cell.edges.tl = {
          path: [ [topleft, 1], [1, righttop] ],
          move: {
            x:      1,
            y:      0,
            enter:  'lt'
          }
        };
        cell.edges.rb = {
          path: [ [1, rightbottom], [bottomright, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'tr'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [bottomleft, 0], [0, lefttop], [0, 1], [topleft, 1], [1, righttop], [1, rightbottom], [bottomright, 0] ]);
    },

    heptagon_br:    function(cell, x0, x1, x2, x3, opt) {
      var bottomright = opt.interpolate(x0, x1, opt.minV, opt.maxV);
      var leftbottom  = opt.interpolate_a(x0, x3, opt.minV, opt.maxV);
      var lefttop     = opt.interpolate_b(x0, x3, opt.minV, opt.maxV);
      var topleft     = opt.interpolate_a(x3, x2, opt.minV, opt.maxV);
      var topright    = opt.interpolate_b(x3, x2, opt.minV, opt.maxV);
      var rightbottom = opt.interpolate(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.br = {
          path: [ [bottomright, 0], [0, leftbottom] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'rb'
          }
        };
        cell.edges.lt = {
          path: [ [0, lefttop], [topleft, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'bl'
          }
        };
        cell.edges.tr = {
          path: [ [topright, 1], [1, rightbottom] ],
          move: {
            x:      1,
            y:      0,
            enter:  'lb'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [bottomright,0], [0, leftbottom], [0, lefttop], [topleft, 1], [topright, 1], [1, rightbottom], [1, 0] ]);
    },

    octagon:        function(cell, x0, x1, x2, x3, opt) {
      var bottomleft  = opt.interpolate_a(x0, x1, opt.minV, opt.maxV);
      var bottomright = opt.interpolate_b(x0, x1, opt.minV, opt.maxV);
      var leftbottom  = opt.interpolate_a(x0, x3, opt.minV, opt.maxV);
      var lefttop     = opt.interpolate_b(x0, x3, opt.minV, opt.maxV);
      var topleft     = opt.interpolate_a(x3, x2, opt.minV, opt.maxV);
      var topright    = opt.interpolate_b(x3, x2, opt.minV, opt.maxV);
      var righttop    = opt.interpolate_b(x1, x2, opt.minV, opt.maxV);
      var rightbottom = opt.interpolate_a(x1, x2, opt.minV, opt.maxV);

      if (opt.polygons_full) {
        cell.edges.bl = {
          path: [ [bottomleft, 0], [0, leftbottom] ],
          move: {
            x:      -1,
            y:      0,
            enter:  'rb'
          }
        };
        cell.edges.lt = {
          path: [ [0, lefttop], [topleft, 1] ],
          move: {
            x:      0,
            y:      1,
            enter:  'bl'
          }
        };
        cell.edges.tr = {
          path: [ [topright, 1], [1, righttop] ],
          move: {
            x:      1,
            y:      0,
            enter:  'lt'
          }
        };
        cell.edges.rb = {
          path: [ [1, rightbottom], [bottomright, 0] ],
          move: {
            x:      0,
            y:      -1,
            enter:  'tr'
          }
        };
      }

      if (opt.polygons)
        cell.polygons.push([ [bottomleft, 0], [0, leftbottom], [0, lefttop], [topleft, 1], [topright, 1], [1, righttop], [1, rightbottom], [bottomright, 0] ]);
    }
  };


  /*
   * Compute isobands(s) for a scalar 2D field given a certain
   * threshold and a bandwidth by applying the Marching Squares
   * Algorithm. The function returns a list of path coordinates
   * either for individual polygons within each grid cell, or the
   * outline of connected polygons.
   */
  function isoBands(input, minV, bandWidth, options) {
    var i,
      j,
      settings,
      useQuadTree   = false,
      tree          = null,
      root          = null,
      data          = null,
      cellGrid      = null,
      multiBand     = false,
      bw            = [],
      bandPolygons  = [],
      ret           = [];

    /* basic input validation */
    if (!input) throw new Error('data is required');
    if (minV === undefined || minV === null) throw new Error('lowerBound is required');
    if (bandWidth === undefined || bandWidth === null) throw new Error('bandWidth is required');
    if ((!!options) && (typeof options !== 'object')) throw new Error('options must be an object');

    settings = isoBandOptions(options);

    /* check for input data */
    if (input instanceof QuadTree) {
      tree = input;
      root = input.root;
      data = input.data;
      if (!settings.noQuadTree)
        useQuadTree = true;
    } else if (Array.isArray(input) && Array.isArray(input[0])) {
      data = input;
    } else {
      throw new Error('input is neither array of arrays nor object retrieved from \'QuadTree()\'');
    }

    /* check and prepare input thresholds */
    if (Array.isArray(minV)) {
      multiBand = true;

      /* activate QuadTree optimization if not explicitly forbidden by user settings */
      if (!settings.noQuadTree)
        useQuadTree = true;

      /* check if all minV are numbers */
      for (i = 0; i < minV.length; i++)
        if (isNaN(+minV[i]))
          throw new Error('lowerBound[' + i + '] is not a number');

      if (Array.isArray(bandWidth)) {
        if (minV.length !== bandWidth.length)
          throw new Error('lowerBound and bandWidth have unequal lengths');

        /* check bandwidth values */
        for (i = 0; i < bandWidth.length; i++)
          if (isNaN(+bandWidth[i]))
            throw new Error('bandWidth[' + i + '] is not a number');
      } else {
        if (isNaN(+bandWidth))
          throw new Error('bandWidth must be a number');

        bw = [];
        for (i = 0; i < minV.length; i++) {
          bw.push(bandWidth);
        }
        bandWidth = bw;
      }
    } else {
      if (isNaN(+minV))
        throw new Error('lowerBound must be a number');

      minV = [ minV ];

      if (isNaN(+bandWidth))
        throw new Error('bandWidth must be a number');

      bandWidth = [ bandWidth ];
    }

    /* create QuadTree root node if not already present */
    if ((useQuadTree) && (!root)) {
      tree = new QuadTree(data);
      root = tree.root;
      data = tree.data;
    }

    if (settings.verbose) {
      if(settings.polygons)
        console.log('MarchingSquaresJS-isoBands: returning single polygons for each grid cell');
      else
        console.log('MarchingSquaresJS-isoBands: returning polygon paths for entire data grid');

      if (multiBand)
        console.log('MarchingSquaresJS-isoBands: multiple bands requested, returning array of band polygons instead of polygons for a single band');
    }

    /* Done with all input validation, now let's start computing stuff */

    /* loop over all minV values */
    minV.forEach(function(lowerBound, b) {
      bandPolygons = [];

      /* store bounds for current computation in settings object */
      settings.minV = lowerBound;
      settings.maxV = lowerBound + bandWidth[b];

      if(settings.verbose)
        console.log('MarchingSquaresJS-isoBands: computing isobands for [' + lowerBound + ':' + (lowerBound + bandWidth[b]) + ']');

      if (settings.polygons) {
        /* compose list of polygons for each single cell */
        if (useQuadTree) {
          /* go through list of cells retrieved from QuadTree */
          root
            .cellsInBand(settings.minV, settings.maxV, true)
            .forEach(function(c) {
              bandPolygons  = bandPolygons.concat(
                cell2Polygons(
                  prepareCell$1(data,
                    c.x,
                    c.y,
                    settings),
                  c.x,
                  c.y,
                  settings
                ));
            });
        } else {
          /* go through entire array of input data */
          for (j = 0; j < data.length - 1; ++j) {
            for (i = 0; i < data[0].length - 1; ++i)
              bandPolygons  = bandPolygons.concat(
                cell2Polygons(
                  prepareCell$1(data,
                    i,
                    j,
                    settings),
                  i,
                  j,
                  settings
                ));
          }
        }
      } else {
        /* sparse grid of input data cells */
        cellGrid = [];
        for (i = 0; i < data[0].length - 1; ++i)
          cellGrid[i] = [];

        /* compose list of polygons for entire input grid */
        if (useQuadTree) {
          /* collect the cells */
          root
            .cellsInBand(settings.minV, settings.maxV, false)
            .forEach(function(c) {
              cellGrid[c.x][c.y] = prepareCell$1(data,
                c.x,
                c.y,
                settings);
            });
        } else {
          /* prepare cells */
          for (i = 0; i < data[0].length - 1; ++i) {
            for (j = 0; j < data.length - 1; ++j) {
              cellGrid[i][j]  = prepareCell$1(data,
                i,
                j,
                settings);
            }
          }
        }

        bandPolygons = traceBandPaths(data, cellGrid, settings);
      }

      /* finally, add polygons to output array */
      if (multiBand)
        ret.push(bandPolygons);
      else
        ret = bandPolygons;

      if(typeof settings.successCallback === 'function')
        settings.successCallback(ret, lowerBound, bandWidth[b]);
    });

    return ret;
  }

  /*
   * Thats all for the public interface, below follows the actual
   * implementation
   */

  /*
   *  For isoBands, each square is defined by the three states
   * of its corner points. However, since computers use power-2
   * values, we use 2bits per trit, i.e.:
   *
   * 00 ... below minV
   * 01 ... between minV and maxV
   * 10 ... above maxV
   *
   * Hence we map the 4-trit configurations as follows:
   *
   * 0000 => 0
   * 0001 => 1
   * 0002 => 2
   * 0010 => 4
   * 0011 => 5
   * 0012 => 6
   * 0020 => 8
   * 0021 => 9
   * 0022 => 10
   * 0100 => 16
   * 0101 => 17
   * 0102 => 18
   * 0110 => 20
   * 0111 => 21
   * 0112 => 22
   * 0120 => 24
   * 0121 => 25
   * 0122 => 26
   * 0200 => 32
   * 0201 => 33
   * 0202 => 34
   * 0210 => 36
   * 0211 => 37
   * 0212 => 38
   * 0220 => 40
   * 0221 => 41
   * 0222 => 42
   * 1000 => 64
   * 1001 => 65
   * 1002 => 66
   * 1010 => 68
   * 1011 => 69
   * 1012 => 70
   * 1020 => 72
   * 1021 => 73
   * 1022 => 74
   * 1100 => 80
   * 1101 => 81
   * 1102 => 82
   * 1110 => 84
   * 1111 => 85
   * 1112 => 86
   * 1120 => 88
   * 1121 => 89
   * 1122 => 90
   * 1200 => 96
   * 1201 => 97
   * 1202 => 98
   * 1210 => 100
   * 1211 => 101
   * 1212 => 102
   * 1220 => 104
   * 1221 => 105
   * 1222 => 106
   * 2000 => 128
   * 2001 => 129
   * 2002 => 130
   * 2010 => 132
   * 2011 => 133
   * 2012 => 134
   * 2020 => 136
   * 2021 => 137
   * 2022 => 138
   * 2100 => 144
   * 2101 => 145
   * 2102 => 146
   * 2110 => 148
   * 2111 => 149
   * 2112 => 150
   * 2120 => 152
   * 2121 => 153
   * 2122 => 154
   * 2200 => 160
   * 2201 => 161
   * 2202 => 162
   * 2210 => 164
   * 2211 => 165
   * 2212 => 166
   * 2220 => 168
   * 2221 => 169
   * 2222 => 170
   */

  /*
   * ####################################
   * Some small helper functions
   * ####################################
   */

  function computeCenterAverage(bl, br, tr, tl, minV, maxV) {
    var average = (tl + tr + br + bl) / 4;

    if (average > maxV)
      return 2; /* above isoband limits */

    if (average < minV)
      return 0; /* below isoband limits */

    return 1; /* within isoband limits */
  }


  function prepareCell$1(grid, x, y, opt) {
    var cell,
      center_avg;

    /*  compose the 4-trit corner representation */
    var cval = 0;
    var x3 = grid[y + 1][x];
    var x2 = grid[y + 1][x + 1];
    var x1 = grid[y][x + 1];
    var x0 = grid[y][x];
    var minV  = opt.minV;
    var maxV  = opt.maxV;

    /*
     * Note that missing data within the grid will result
     * in horribly failing to trace full polygon paths
     */
    if(isNaN(x0) || isNaN(x1) || isNaN(x2) || isNaN(x3)) {
      return;
    }

    /*
     * Here we detect the type of the cell
     *
     * x3 ---- x2
     * |      |
     * |      |
     * x0 ---- x1
     *
     * with edge points
     *
     * x0 = (x,y),
     * x1 = (x + 1, y),
     * x2 = (x + 1, y + 1), and
     * x3 = (x, y + 1)
     *
     * and compute the polygon intersections with the edges
     * of the cell. Each edge value may be (i) below, (ii) within,
     * or (iii) above the values of the isoband limits. We
     * encode this property using 2 bits of information, where
     *
     * 00 ... below,
     * 01 ... within, and
     * 10 ... above
     *
     * Then we store the cells value as vector
     *
     * cval = (x0, x1, x2, x3)
     *
     * where x0 are the two least significant bits (0th, 1st),
     * x1 the 2nd and 3rd bit, and so on. This essentially
     * enables us to work with a single integer number
     */

    cval |= (x3 < minV) ? 0 : (x3 > maxV) ? 128 : 64;
    cval |= (x2 < minV) ? 0 : (x2 > maxV) ? 32 : 16;
    cval |= (x1 < minV) ? 0 : (x1 > maxV) ? 8 : 4;
    cval |= (x0 < minV) ? 0 : (x0 > maxV) ? 2 : 1;

    /* make sure cval is a number */
    cval = +cval;

    /*
     * cell center average trit for ambiguous cases, where
     * 0 ... below iso band
     * 1 ... within iso band
     * 2 ... above isoband
     */
    center_avg = 0;

    cell = {
      cval:         cval,
      polygons:     [],
      edges:        {},
      x0:           x0,
      x1:           x1,
      x2:           x2,
      x3:           x3,
      x:            x,
      y:            y
    };

    /*
     * Compute interpolated intersections of the polygon(s)
     * with the cell borders and (i) add edges for polygon
     * trace-back, or (ii) a list of small closed polygons
     * according to look-up table
     */
    switch (cval) {
    case 85:  /* 1111 */
      shapeCoordinates.square(cell, x0, x1, x2, x3, opt);
      /* fall through */
    case 0:   /* 0000 */
      /* fall through */
    case 170: /* 2222 */
      break;

      /* single triangle cases */

    case 169: /* 2221 */
      shapeCoordinates.triangle_bl(cell, x0, x1, x2, x3, opt);
      break;

    case 166: /* 2212 */
      shapeCoordinates.triangle_br(cell, x0, x1, x2, x3, opt);
      break;

    case 154: /* 2122 */
      shapeCoordinates.triangle_tr(cell, x0, x1, x2, x3, opt);
      break;

    case 106: /* 1222 */
      shapeCoordinates.triangle_tl(cell, x0, x1, x2, x3, opt);
      break;

    case 1: /* 0001 */
      shapeCoordinates.triangle_bl(cell, x0, x1, x2, x3, opt);
      break;

    case 4: /* 0010 */
      shapeCoordinates.triangle_br(cell, x0, x1, x2, x3, opt);
      break;

    case 16: /* 0100 */
      shapeCoordinates.triangle_tr(cell, x0, x1, x2, x3, opt);
      break;

    case 64: /* 1000 */
      shapeCoordinates.triangle_tl(cell, x0, x1, x2, x3, opt);
      break;


      /* single trapezoid cases */

    case 168: /* 2220 */
      shapeCoordinates.tetragon_bl(cell, x0, x1, x2, x3, opt);
      break;

    case 162: /* 2202 */
      shapeCoordinates.tetragon_br(cell, x0, x1, x2, x3, opt);
      break;

    case 138: /* 2022 */
      shapeCoordinates.tetragon_tr(cell, x0, x1, x2, x3, opt);
      break;

    case 42: /* 0222 */
      shapeCoordinates.tetragon_tl(cell, x0, x1, x2, x3, opt);
      break;

    case 2: /* 0002 */
      shapeCoordinates.tetragon_bl(cell, x0, x1, x2, x3, opt);
      break;

    case 8: /* 0020 */
      shapeCoordinates.tetragon_br(cell, x0, x1, x2, x3, opt);
      break;

    case 32: /* 0200 */
      shapeCoordinates.tetragon_tr(cell, x0, x1, x2, x3, opt);
      break;

    case 128: /* 2000 */
      shapeCoordinates.tetragon_tl(cell, x0, x1, x2, x3, opt);
      break;


      /* single rectangle cases */

    case 5: /* 0011 */
      shapeCoordinates.tetragon_b(cell, x0, x1, x2, x3, opt);
      break;

    case 20: /* 0110 */
      shapeCoordinates.tetragon_r(cell, x0, x1, x2, x3, opt);
      break;

    case 80: /* 1100 */
      shapeCoordinates.tetragon_t(cell, x0, x1, x2, x3, opt);
      break;

    case 65: /* 1001 */
      shapeCoordinates.tetragon_l(cell, x0, x1, x2, x3, opt);
      break;

    case 165: /* 2211 */
      shapeCoordinates.tetragon_b(cell, x0, x1, x2, x3, opt);
      break;

    case 150: /* 2112 */
      shapeCoordinates.tetragon_r(cell, x0, x1, x2, x3, opt);
      break;

    case 90: /* 1122 */
      shapeCoordinates.tetragon_t(cell, x0, x1, x2, x3, opt);
      break;

    case 105: /* 1221 */
      shapeCoordinates.tetragon_l(cell, x0, x1, x2, x3, opt);
      break;

    case 160: /* 2200 */
      shapeCoordinates.tetragon_lr(cell, x0, x1, x2, x3, opt);
      break;

    case 130: /* 2002 */
      shapeCoordinates.tetragon_tb(cell, x0, x1, x2, x3, opt);
      break;

    case 10: /* 0022 */
      shapeCoordinates.tetragon_lr(cell, x0, x1, x2, x3, opt);
      break;

    case 40: /* 0220 */
      shapeCoordinates.tetragon_tb(cell, x0, x1, x2, x3, opt);
      break;


      /* single pentagon cases */

    case 101: /* 1211 */
      shapeCoordinates.pentagon_tr(cell, x0, x1, x2, x3, opt);
      break;

    case 149: /* 2111 */
      shapeCoordinates.pentagon_tl(cell, x0, x1, x2, x3, opt);
      break;

    case 86: /* 1112 */
      shapeCoordinates.pentagon_bl(cell, x0, x1, x2, x3, opt);
      break;

    case 89: /* 1121 */
      shapeCoordinates.pentagon_br(cell, x0, x1, x2, x3, opt);
      break;

    case 69: /* 1011 */
      shapeCoordinates.pentagon_tr(cell, x0, x1, x2, x3, opt);
      break;

    case 21: /* 0111 */
      shapeCoordinates.pentagon_tl(cell, x0, x1, x2, x3, opt);
      break;

    case 84: /* 1110 */
      shapeCoordinates.pentagon_bl(cell, x0, x1, x2, x3, opt);
      break;

    case 81: /* 1101 */
      shapeCoordinates.pentagon_br(cell, x0, x1, x2, x3, opt);
      break;

    case 96: /* 1200 */
      shapeCoordinates.pentagon_tr_rl(cell, x0, x1, x2, x3, opt);
      break;

    case 24: /* 0120 */
      shapeCoordinates.pentagon_rb_bt(cell, x0, x1, x2, x3, opt);
      break;

    case 6: /* 0012 */
      shapeCoordinates.pentagon_bl_lr(cell, x0, x1, x2, x3, opt);
      break;

    case 129: /* 2001 */
      shapeCoordinates.pentagon_lt_tb(cell, x0, x1, x2, x3, opt);
      break;

    case 74: /* 1022 */
      shapeCoordinates.pentagon_tr_rl(cell, x0, x1, x2, x3, opt);
      break;

    case 146: /* 2102 */
      shapeCoordinates.pentagon_rb_bt(cell, x0, x1, x2, x3, opt);
      break;

    case 164: /* 2210 */
      shapeCoordinates.pentagon_bl_lr(cell, x0, x1, x2, x3, opt);
      break;

    case 41: /* 0221 */
      shapeCoordinates.pentagon_lt_tb(cell, x0, x1, x2, x3, opt);
      break;

    case 66: /* 1002 */
      shapeCoordinates.pentagon_bl_tb(cell, x0, x1, x2, x3, opt);
      break;

    case 144: /* 2100 */
      shapeCoordinates.pentagon_lt_rl(cell, x0, x1, x2, x3, opt);
      break;

    case 36: /* 0210 */
      shapeCoordinates.pentagon_tr_bt(cell, x0, x1, x2, x3, opt);
      break;

    case 9: /* 0021 */
      shapeCoordinates.pentagon_rb_lr(cell, x0, x1, x2, x3, opt);
      break;

    case 104: /* 1220 */
      shapeCoordinates.pentagon_bl_tb(cell, x0, x1, x2, x3, opt);
      break;

    case 26: /* 0122 */
      shapeCoordinates.pentagon_lt_rl(cell, x0, x1, x2, x3, opt);
      break;

    case 134: /* 2012 */
      shapeCoordinates.pentagon_tr_bt(cell, x0, x1, x2, x3, opt);
      break;

    case 161: /* 2201 */
      shapeCoordinates.pentagon_rb_lr(cell, x0, x1, x2, x3, opt);
      break;


      /* single hexagon cases */

    case 37: /* 0211 */
      shapeCoordinates.hexagon_lt_tr(cell, x0, x1, x2, x3, opt);
      break;

    case 148: /* 2110 */
      shapeCoordinates.hexagon_bl_lt(cell, x0, x1, x2, x3, opt);
      break;

    case 82: /* 1102 */
      shapeCoordinates.hexagon_bl_rb(cell, x0, x1, x2, x3, opt);
      break;

    case 73: /* 1021 */
      shapeCoordinates.hexagon_tr_rb(cell, x0, x1, x2, x3, opt);
      break;

    case 133: /* 2011 */
      shapeCoordinates.hexagon_lt_tr(cell, x0, x1, x2, x3, opt);
      break;

    case 22: /* 0112 */
      shapeCoordinates.hexagon_bl_lt(cell, x0, x1, x2, x3, opt);
      break;

    case 88: /* 1120 */
      shapeCoordinates.hexagon_bl_rb(cell, x0, x1, x2, x3, opt);
      break;

    case 97: /* 1201 */
      shapeCoordinates.hexagon_tr_rb(cell, x0, x1, x2, x3, opt);
      break;

    case 145: /* 2101 */
      shapeCoordinates.hexagon_lt_rb(cell, x0, x1, x2, x3, opt);
      break;

    case 25: /* 0121 */
      shapeCoordinates.hexagon_lt_rb(cell, x0, x1, x2, x3, opt);
      break;

    case 70: /* 1012 */
      shapeCoordinates.hexagon_bl_tr(cell, x0, x1, x2, x3, opt);
      break;

    case 100: /* 1210 */
      shapeCoordinates.hexagon_bl_tr(cell, x0, x1, x2, x3, opt);
      break;


      /* 6-sided saddles */

    case 17: /* 0101 */
      center_avg = computeCenterAverage(x0, x1, x2, x3, minV, maxV);
      /* should never be center_avg === 2 */
      if (center_avg === 0) {
        shapeCoordinates.triangle_bl(cell, x0, x1, x2, x3, opt);
        shapeCoordinates.triangle_tr(cell, x0, x1, x2, x3, opt);
      } else {
        shapeCoordinates.hexagon_lt_rb(cell, x0, x1, x2, x3, opt);
      }
      break;

    case 68: /* 1010 */
      center_avg = computeCenterAverage(x0, x1, x2, x3, minV, maxV);
      /* should never be center_avg === 2 */
      if (center_avg === 0) {
        shapeCoordinates.triangle_tl(cell, x0, x1, x2, x3, opt);
        shapeCoordinates.triangle_br(cell, x0, x1, x2, x3, opt);
      } else {
        shapeCoordinates.hexagon_bl_tr(cell, x0, x1, x2, x3, opt);
      }
      break;

    case 153: /* 2121 */
      center_avg = computeCenterAverage(x0, x1, x2, x3, minV, maxV);
      /* should never be center_avg === 0 */
      if (center_avg === 2) {
        shapeCoordinates.triangle_bl(cell, x0, x1, x2, x3, opt);
        shapeCoordinates.triangle_tr(cell, x0, x1, x2, x3, opt);
      } else {
        shapeCoordinates.hexagon_lt_rb(cell, x0, x1, x2, x3, opt);
      }
      break;

    case 102: /* 1212 */
      center_avg = computeCenterAverage(x0, x1, x2, x3, minV, maxV);
      /* should never be center_avg === 0 */
      if (center_avg === 2) {
        shapeCoordinates.triangle_tl(cell, x0, x1, x2, x3, opt);
        shapeCoordinates.triangle_br(cell, x0, x1, x2, x3, opt);
      } else {
        shapeCoordinates.hexagon_bl_tr(cell, x0, x1, x2, x3, opt);
      }
      break;


      /* 7-sided saddles */

    case 152: /* 2120 */

      center_avg = computeCenterAverage(x0, x1, x2, x3, minV, maxV);
      /* should never be center_avg === 0 */
      if (center_avg === 2) {
        shapeCoordinates.triangle_tr(cell, x0, x1, x2, x3, opt);
        shapeCoordinates.tetragon_bl(cell, x0, x1, x2, x3, opt);
      } else {
        shapeCoordinates.heptagon_tr(cell, x0, x1, x2, x3, opt);
      }
      break;

    case 137: /* 2021 */
      center_avg = computeCenterAverage(x0, x1, x2, x3, minV, maxV);
      /* should never be center_avg === 0 */
      if (center_avg === 2) {
        shapeCoordinates.triangle_bl(cell, x0, x1, x2, x3, opt);
        shapeCoordinates.tetragon_tr(cell, x0, x1, x2, x3, opt);
      } else {
        shapeCoordinates.heptagon_bl(cell, x0, x1, x2, x3, opt);
      }
      break;

    case 98: /* 1202 */
      center_avg = computeCenterAverage(x0, x1, x2, x3, minV, maxV);
      /* should never be center_avg === 0 */
      if (center_avg === 2) {
        shapeCoordinates.triangle_tl(cell, x0, x1, x2, x3, opt);
        shapeCoordinates.tetragon_br(cell, x0, x1, x2, x3, opt);
      } else {
        shapeCoordinates.heptagon_tl(cell, x0, x1, x2, x3, opt);
      }
      break;

    case 38: /* 0212 */
      center_avg = computeCenterAverage(x0, x1, x2, x3, minV, maxV);
      /* should never be center_avg === 0 */
      if (center_avg === 2) {
        shapeCoordinates.triangle_br(cell, x0, x1, x2, x3, opt);
        shapeCoordinates.tetragon_tl(cell, x0, x1, x2, x3, opt);
      } else {
        shapeCoordinates.heptagon_br(cell, x0, x1, x2, x3, opt);
      }
      break;

    case 18: /* 0102 */
      center_avg = computeCenterAverage(x0, x1, x2, x3, minV, maxV);
      /* should never be center_avg === 2 */
      if (center_avg === 0) {
        shapeCoordinates.triangle_tr(cell, x0, x1, x2, x3, opt);
        shapeCoordinates.tetragon_bl(cell, x0, x1, x2, x3, opt);
      } else {
        shapeCoordinates.heptagon_tr(cell, x0, x1, x2, x3, opt);
      }
      break;

    case 33: /* 0201 */
      center_avg = computeCenterAverage(x0, x1, x2, x3, minV, maxV);
      /* should never be center_avg === 2 */
      if (center_avg === 0) {
        shapeCoordinates.triangle_bl(cell, x0, x1, x2, x3, opt);
        shapeCoordinates.tetragon_tr(cell, x0, x1, x2, x3, opt);
      } else {
        shapeCoordinates.heptagon_bl(cell, x0, x1, x2, x3, opt);
      }
      break;

    case 72: /* 1020 */
      center_avg = computeCenterAverage(x0, x1, x2, x3, minV, maxV);
      /* should never be center_avg === 2 */
      if (center_avg === 0) {
        shapeCoordinates.triangle_tl(cell, x0, x1, x2, x3, opt);
        shapeCoordinates.tetragon_br(cell, x0, x1, x2, x3, opt);
      } else {
        shapeCoordinates.heptagon_tl(cell, x0, x1, x2, x3, opt);
      }
      break;

    case 132: /* 2010 */
      center_avg = computeCenterAverage(x0, x1, x2, x3, minV, maxV);
      /* should never be center_avg === 2 */
      if (center_avg === 0) {
        shapeCoordinates.triangle_br(cell, x0, x1, x2, x3, opt);
        shapeCoordinates.tetragon_tl(cell, x0, x1, x2, x3, opt);
      } else {
        shapeCoordinates.heptagon_br(cell, x0, x1, x2, x3, opt);
      }
      break;


      /* 8-sided saddles */

    case 136: /* 2020 */
      center_avg = computeCenterAverage(x0, x1, x2, x3, minV, maxV);
      if (center_avg === 0) {
        shapeCoordinates.tetragon_tl(cell, x0, x1, x2, x3, opt);
        shapeCoordinates.tetragon_br(cell, x0, x1, x2, x3, opt);
      } else if (center_avg === 1) {
        shapeCoordinates.octagon(cell, x0, x1, x2, x3, opt);
      } else {
        shapeCoordinates.tetragon_bl(cell, x0, x1, x2, x3, opt);
        shapeCoordinates.tetragon_tr(cell, x0, x1, x2, x3, opt);
      }
      break;

    case 34: /* 0202 */
      center_avg = computeCenterAverage(x0, x1, x2, x3, minV, maxV);
      if (center_avg === 0) {
        shapeCoordinates.tetragon_bl(cell, x0, x1, x2, x3, opt);
        shapeCoordinates.tetragon_tr(cell, x0, x1, x2, x3, opt);
      } else if (center_avg === 1) {
        shapeCoordinates.octagon(cell, x0, x1, x2, x3, opt);
      } else {
        shapeCoordinates.tetragon_tl(cell, x0, x1, x2, x3, opt);
        shapeCoordinates.tetragon_br(cell, x0, x1, x2, x3, opt);
      }
      break;
    }

    return cell;
  }

  exports.isoLines = isoLines;
  exports.isoContours = isoLines;
  exports.isoBands = isoBands;
  exports.QuadTree = QuadTree;
  exports.quadTree = QuadTree;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
});

var MarchingSquares = unwrapExports(marchingsquares);

const fromRaster = async (raster, bands) => {
  const preprocessedData = new MarchingSquares.QuadTree(raster);

  const result = [];
  for (let nth = 0; nth < bands.length - 1; nth++) {
    const low = bands[nth];
    const high = bands[nth + 1];
    const paths = [];
    for (const band of MarchingSquares.isoBands(preprocessedData, low, high)) {
      result.push(link([taggedPoints({}, band)], /* close= */ true));
    }
    if (paths.length > 0) {
      result.push(paths);
    }
  }
  return result;
};

export { fromRaster };
