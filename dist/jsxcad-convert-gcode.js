import { outline, toDisjointGeometry } from './jsxcad-geometry-tagged.js';
import { getEdges } from './jsxcad-geometry-path.js';
import { toToolFromTags } from './jsxcad-algorithm-tool.js';

const X = 0;
const Y = 1;
const Z = 2;

// FIX: This is actually GRBL.
const toGcode = async (geometry, { definitions } = {}) => {
  // const topZ = 0;
  const codes = [];
  const _ = undefined;

  // CHECK: Perhaps this should be a more direct modeling of the GRBL state?
  const state = {
    // Where is the tool
    position: [0, 0, 0],
    // How 'fast' the tool is running (rpm or power).
    speed: undefined,
    laserMode: false,
    jumped: false,
  };

  const emit = (code) => codes.push(code);

  // Runs each axis at maximum velocity until matches, so may make dog-legs.
  const rapid = (
    x = state.position[X],
    y = state.position[Y],
    z = state.position[Z],
    f = state.tool.feedRate
  ) => {
    if (
      x === state.position[X] &&
      y === state.position[Y] &&
      z === state.position[Z]
    ) {
      return;
    }
    emit(`G0 X${x.toFixed(3)} Y${y.toFixed(3)} Z${z.toFixed(3)}`);
    state.position = [x, y, z];
  };

  // Straight motion at set speed.
  const cut = (
    x = state.position[X],
    y = state.position[Y],
    z = state.position[Z],
    f = state.tool.feedRate,
    s = state.tool.cutSpeed
  ) => {
    if (state.jumped && state.tool.warmupDuration) {
      // CHECK: Will we need this on every jump?
      setSpeed(state.tool.warmupSpeed);
      emit(`G1 F1`);
      emit(`G4 P${state.tool.warmupDuration.toFixed(3)}`);
    }
    state.jumped = false;
    setSpeed(s);
    if (
      x === state.position[X] &&
      y === state.position[Y] &&
      z === state.position[Z]
    ) {
      return;
    }
    emit(
      `G1 X${x.toFixed(3)} Y${y.toFixed(3)} Z${z.toFixed(3)} F${f.toFixed(3)}`
    );
    state.position = [x, y, z];
  };

  const setSpeed = (value) => {
    if (state.speed !== value) {
      if (Math.sign(state.speed || 0) !== Math.sign(value)) {
        if (value === 0) {
          emit('M5');
        } else if (value < 0) {
          // Reverse
          emit('M4');
        } else {
          // Forward
          emit('M3');
        }
      }
      emit(`S${Math.abs(value).toFixed(3)}`);
      state.speed = value;
    }
  };

  const toolChange = (tool) => {
    if (state.tool && state.tool.type !== tool.type) {
      throw Error(
        `Unsupported tool type change: ${state.tool.type} to ${tool.type}`
      );
    }
    if (state.tool && state.tool.diameter !== tool.diameter) {
      throw Error(
        `Unsupported tool diameter change: ${state.tool.diameter} to ${tool.diameter}`
      );
    }
    // Accept tool change.
    state.tool = tool;
    switch (state.tool.type) {
      case 'dynamicLaser':
      case 'constantLaser':
      case 'spindle':
        break;
      default:
        throw Error(`Unknown tool: ${state.tool.type}`);
    }
  };

  const stop = () => {
    emit('M5');
  };

  /*
  const pause = () => {
    emit('M0');
  };

  const dwell = (seconds) => {
    emit(`G4 P${seconds * 1000}`);
  };
  */

  const jump = (x, y) => {
    if (x === state.position[X] && y === state.position[Y]) {
      // Already there.
      return;
    }
    const speed = state.tool.jumpSpeed || 0;
    const jumpRate = state.tool.jumpRate || state.tool.feedRate;
    if (speed !== 0) {
      // For some tools (some lasers) it is better to keep the beam on (at reduced power)
      // while jumping.
      setSpeed(speed);
      cut(_, _, state.tool.jumpZ, jumpRate, speed); // up
      cut(x, y, _, jumpRate, speed); // across
      // cut(_, _, topZ, jumpRate, speed); // down
    } else {
      rapid(_, _, state.tool.jumpZ); // up
      rapid(x, y, _); // across
      // rapid(_, _, topZ); // down
      state.jumped = true;
    }
  };

  const park = () => {
    jump(0, 0);
    stop();
  };

  const useMetric = () => emit('G21');

  useMetric();

  // FIX: Should handle points as well as paths.
  for (const { tags, paths } of outline(toDisjointGeometry(geometry))) {
    toolChange(toToolFromTags('grbl', tags, definitions));
    for (const path of paths) {
      for (let [start, end] of getEdges(path)) {
        jump(...start); // jump to the start x, y
        cut(...start); // may need to drill down to the start z
        cut(...end); // cut across
      }
    }
  }

  park();

  codes.push('');
  return new TextEncoder('utf8').encode(codes.join('\n'));
};

export { toGcode };
