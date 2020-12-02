import { negate, equals } from './jsxcad-math-vec3.js';
import { getNonVoidPaths, toDisjointGeometry, translate } from './jsxcad-geometry-tagged.js';
import { getEdges } from './jsxcad-geometry-path.js';

const X = 0;
const Y = 1;
const Z = 2;

/** Checks for equality, ignoring z. */
const equalsXY = ([aX, aY], [bX, bY]) => equals([aX, aY, 0], [bX, bY, 0]);

/** Checks for equality, ignoring x and y */
const equalsZ = ([, , aZ], [, , bZ]) => equals([0, 0, aZ], [0, 0, bZ]);

const toGcode = async (
  geometry,
  {
    origin = [0, 0, 0],
    topZ = 0,
    maxFeedRate = 800,
    minCutZ = -1,
    jumpHeight = 1,
    spindleRpm = 0,
    laserPower = 0,
    feedRate = 300,
    toolType,
  } = {}
) => {
  const tool = {};

  const jumpZ = topZ + jumpHeight;

  const codes = [];
  const _ = undefined;
  let position = [0, 0, 0];

  const emit = (code) => codes.push(code);

  // Runs each axis at maximum velocity until matches, so may make dog-legs.
  const rapid = (
    x = position[X],
    y = position[Y],
    z = position[Z],
    f = tool.feedRate
  ) => {
    emit(`G0 X${x.toFixed(3)} Y${y.toFixed(3)} Z${z.toFixed(3)}`);
    position = [x, y, z];
  };

  // Straight motion at set speed.
  const cut = (
    x = position[X],
    y = position[Y],
    z = position[Z],
    f = tool.feedRate
  ) => {
    setSpeed(tool.cutSpeed);
    emit(
      `G1 X${x.toFixed(3)} Y${y.toFixed(3)} Z${z.toFixed(3)} F${f.toFixed(3)}`
    );
    position = [x, y, z];
  };

  const setSpeed = (value) => {
    if (value !== undefined && tool.speed !== value) {
      emit(`S${value.toFixed(3)}`);
      tool.speed = value;
    }
  };

  const enableLaserMode = () => {
    if (tool.laserMode !== true) {
      emit('$32=1');
      tool.laserMode = true;
    }
  };

  const disableLaserMode = () => {
    if (tool.laserMode !== true) {
      emit('$32=0');
      tool.laserMode = false;
    }
  };

  const toolReconfigure = ({ feedRate, laserPower, spindleRpm } = {}) => {
    if (feedRate) {
      tool.feedRate = feedRate;
    }
    switch (toolType) {
      case 'spindle':
        if (spindleRpm) {
          tool.jumpSpeed = spindleRpm;
          tool.cutSpeed = spindleRpm;
        }
        break;
      case 'laser':
        if (laserPower) {
          tool.jumpSpeed = laserPower;
          tool.cutSpeed = laserPower;
        }
        break;
    }
  };

  const toolWarmup = () => {
    toolReconfigure({ feedRate, laserPower, spindleRpm });
    switch (toolType) {
      case 'spindle':
        tool.isSpindle = true;
        disableLaserMode();
        raise();
        emit('M3');
        break;
      case 'laser':
        tool.isLaser = true;
        enableLaserMode();
        emit('M4');
        break;
      default:
        throw Error('No toolType set.');
    }
  };

  const toolShutdown = () => {
    emit('M5');
  };

  const toolPause = () => {
    emit('M0');
  };

  const raise = () => {
    rapid(_, _, jumpZ); // up
  };

  const jump = (x, y) => {
    setSpeed(tool.jumpSpeed);
    raise();
    rapid(x, y, jumpZ); // across
    rapid(x, y, topZ); // down
  };

  const park = () => {
    jump(0, 0);
  };

  const useMetric = () => emit('G21');

  useMetric();
  toolWarmup();

  for (const { tags = [], paths } of getNonVoidPaths(
    toDisjointGeometry(translate(negate(origin), geometry))
  )) {
    let pathPauseAfter = false;
    let pathPauseBefore = false;
    let pathConstantLaser = false;
    {
      let pathFeedRate = feedRate;
      let pathLaserPower = laserPower;
      let pathSpindleRpm = spindleRpm;
      for (const tag of tags) {
        if (tag.startsWith('toolpath/')) {
          const [, attribute, value] = tag.split('/');
          switch (attribute) {
            case 'feed_rate':
              pathFeedRate = Number(value);
              break;
            case 'laser_power':
              pathLaserPower = Number(value);
              break;
            case 'constant_laser':
              pathConstantLaser = true;
              break;
            case 'spindle_rpm':
              pathSpindleRpm = Number(value);
              break;
            case 'pause_after':
              pathPauseAfter = true;
              break;
            case 'pause_before':
              pathPauseBefore = true;
              break;
          }
        }
      }
      toolReconfigure({
        feedRate: pathFeedRate,
        laserPower: pathLaserPower,
        spindleRpm: pathSpindleRpm,
      });
    }
    if (pathConstantLaser) {
      disableLaserMode();
    }
    if (pathPauseBefore) {
      toolPause();
    }
    for (const path of paths) {
      for (const [start, end] of getEdges(path)) {
        if (start[Z] < minCutZ) {
          throw Error(`Attempting to cut below minCutZ`);
        }
        if (!equalsXY(start, position)) {
          // We assume that we can plunge or raise vertically without issue.
          // This avoids raising before plunging.
          // FIX: This whole approach is essentially wrong, and needs to consider if the tool can plunge or not.
          jump(...start);
        }
        if (!equalsZ(start, position)) {
          cut(...start); // cut down
        }
        cut(...end); // cut across
      }
    }
    if (pathPauseAfter) {
      toolPause();
    }
    if (pathConstantLaser) {
      enableLaserMode();
    }
  }

  toolShutdown();
  park();

  codes.push(``);
  return new TextEncoder('utf8').encode(codes.join('\n'));
};

export { toGcode };
