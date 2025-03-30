// Constants for Glicko-2
const SCALE_FACTOR = 173.7178;      // Converts between Glicko and logistic scales
const BASE_RATING = 1500;           // Default starting rating
const INITIAL_RD = 350;             // Initial rating deviation for new players
const INITIAL_VOLATILITY = 0.06;    // Initial volatility
const C = 0.2;                      // Constant for RD increase over time
const TAU = 0.5;                    // Constraint on volatility changes
const EPSILON = 0.000001;

export{
    SCALE_FACTOR,
    BASE_RATING,
    INITIAL_RD,
    INITIAL_VOLATILITY,
    C,
    TAU,
    EPSILON
}