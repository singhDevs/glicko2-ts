// Constants for Glicko-2
const SCALE_FACTOR = 173.7178;      // Converts between Glicko and logistic scales
const BASE_RATING = 1500;           // Default starting rating
const INITIAL_RD = 250;             // Initial rating deviation for new players
const INITIAL_VOLATILITY = 0.06;    // Initial volatility
const RD_INCREASE_CONSTANT = 0.15;  // Constant for RD increase over time
const VOLATILITY_CONSTRAINT = 0.5;  // Constraint on volatility changes
const CONVERGENCE_TOLERANCE = 0.000001; // Tolerance for iterative convergence

export{
    SCALE_FACTOR,
    BASE_RATING,
    INITIAL_RD,
    INITIAL_VOLATILITY,
    RD_INCREASE_CONSTANT,
    VOLATILITY_CONSTRAINT,
    CONVERGENCE_TOLERANCE
}