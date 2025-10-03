"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONVERGENCE_TOLERANCE = exports.VOLATILITY_CONSTRAINT = exports.RD_INCREASE_CONSTANT = exports.INITIAL_VOLATILITY = exports.INITIAL_RD = exports.BASE_RATING = exports.SCALE_FACTOR = void 0;
// Constants for Glicko-2
const SCALE_FACTOR = 173.7178; // Converts between Glicko and logistic scales
exports.SCALE_FACTOR = SCALE_FACTOR;
const BASE_RATING = 1500; // Default starting rating
exports.BASE_RATING = BASE_RATING;
const INITIAL_RD = 250; // Initial rating deviation for new players
exports.INITIAL_RD = INITIAL_RD;
const INITIAL_VOLATILITY = 0.06; // Initial volatility
exports.INITIAL_VOLATILITY = INITIAL_VOLATILITY;
const RD_INCREASE_CONSTANT = 0.15; // Constant for RD increase over time
exports.RD_INCREASE_CONSTANT = RD_INCREASE_CONSTANT;
const VOLATILITY_CONSTRAINT = 0.5; // Constraint on volatility changes
exports.VOLATILITY_CONSTRAINT = VOLATILITY_CONSTRAINT;
const CONVERGENCE_TOLERANCE = 0.000001; // Tolerance for iterative convergence
exports.CONVERGENCE_TOLERANCE = CONVERGENCE_TOLERANCE;
