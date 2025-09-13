"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustRDForTime = adjustRDForTime;
exports.g = g;
exports.expectedScore = expectedScore;
exports.variance = variance;
exports.delta = delta;
exports.updateVolatility = updateVolatility;
exports.getPreUpdateRD = getPreUpdateRD;
exports.getNewRD = getNewRD;
exports.getNewRating = getNewRating;
const constants_1 = require("./constants");
function adjustRDForTime(player, currentTime) {
    // Input validation
    if (!player || typeof player.rd !== 'number' || isNaN(player.rd) || player.rd < 0) {
        throw new Error('Invalid player rating deviation');
    }
    if (!(currentTime instanceof Date) || isNaN(currentTime.getTime())) {
        throw new Error('Invalid current time');
    }
    if (!(player.lastGameTime instanceof Date) || isNaN(player.lastGameTime.getTime())) {
        throw new Error('Invalid last game time');
    }
    const timeDiff = currentTime.getTime() - player.lastGameTime.getTime();
    if (timeDiff < 0) {
        throw new Error('Current time cannot be before last game time');
    }
    const t = timeDiff / (1000 * 60 * 60 * 24 * 30); // Convert time to months
    const phi = player.rd / constants_1.SCALE_FACTOR; // Convert RD to Glicko scale
    const phiNew = Math.sqrt(Math.pow(phi, 2) + (Math.pow(constants_1.C, 2) * t)); // Increase RD based on time
    return Math.min(350, phiNew * constants_1.SCALE_FACTOR); // Convert back to rating scale & returning new RD
}
function g(phi) {
    if (typeof phi !== 'number' || isNaN(phi) || phi < 0) {
        throw new Error('Invalid phi value: must be a non-negative number');
    }
    const denominator = Math.sqrt(1 + (3 * (Math.pow(phi, 2)) / (Math.pow(Math.PI, 2))));
    // Denominator can never be zero since sqrt(1 + positive_value) >= 1
    return 1 / denominator;
}
function expectedScore(phiOpponent, playerRating, opponentRating) {
    if (typeof phiOpponent !== 'number' || isNaN(phiOpponent) || phiOpponent < 0) {
        throw new Error('Invalid phiOpponent: must be a non-negative number');
    }
    if (typeof playerRating !== 'number' || isNaN(playerRating)) {
        throw new Error('Invalid playerRating: must be a number');
    }
    if (typeof opponentRating !== 'number' || isNaN(opponentRating)) {
        throw new Error('Invalid opponentRating: must be a number');
    }
    const exponent = -g(phiOpponent) * (playerRating - opponentRating);
    // Protect against overflow in Math.exp
    if (exponent > 700) { // exp(700) is near JavaScript's max safe number
        return 0; // If exponent is very large, denominator approaches infinity, result approaches 0
    }
    if (exponent < -700) {
        return 1; // If exponent is very negative, denominator approaches 1, result approaches 1
    }
    const denominator = 1 + Math.exp(exponent);
    return 1 / denominator;
}
function variance(phiOpponent, expectedScore) {
    if (typeof phiOpponent !== 'number' || isNaN(phiOpponent) || phiOpponent < 0) {
        throw new Error('Invalid phiOpponent: must be a non-negative number');
    }
    if (typeof expectedScore !== 'number' || isNaN(expectedScore) || expectedScore < 0 || expectedScore > 1) {
        throw new Error('Invalid expectedScore: must be a number between 0 and 1');
    }
    const gValue = g(phiOpponent);
    // Handle edge cases where expectedScore is very close to 0 or 1
    const minExpectedScore = 0.0001; // Prevent division by zero
    const maxExpectedScore = 0.9999;
    const clampedExpectedScore = Math.max(minExpectedScore, Math.min(maxExpectedScore, expectedScore));
    const denominator = (Math.pow(gValue, 2)) * clampedExpectedScore * (1 - clampedExpectedScore);
    // Protect against division by zero
    if (denominator <= 0 || !isFinite(denominator)) {
        throw new Error('Division by zero or invalid denominator in variance calculation');
    }
    const result = 1 / denominator;
    // Protect against overflow
    if (!isFinite(result)) {
        throw new Error('Variance calculation resulted in overflow');
    }
    return result;
}
function delta(variance, phiOpponent, actualScore, expectedScore) {
    if (typeof variance !== 'number' || isNaN(variance) || variance <= 0) {
        throw new Error('Invalid variance: must be a positive number');
    }
    if (typeof phiOpponent !== 'number' || isNaN(phiOpponent) || phiOpponent < 0) {
        throw new Error('Invalid phiOpponent: must be a non-negative number');
    }
    if (typeof actualScore !== 'number' || isNaN(actualScore) || actualScore < 0 || actualScore > 1) {
        throw new Error('Invalid actualScore: must be a number between 0 and 1');
    }
    if (typeof expectedScore !== 'number' || isNaN(expectedScore) || expectedScore < 0 || expectedScore > 1) {
        throw new Error('Invalid expectedScore: must be a number between 0 and 1');
    }
    return variance * g(phiOpponent) * (actualScore - expectedScore);
}
function updateVolatility(sigma, delta, phi, variance) {
    if (typeof sigma !== 'number' || isNaN(sigma) || sigma <= 0) {
        throw new Error('Invalid sigma: must be a positive number');
    }
    if (typeof delta !== 'number' || isNaN(delta)) {
        throw new Error('Invalid delta: must be a number');
    }
    if (typeof phi !== 'number' || isNaN(phi) || phi < 0) {
        throw new Error('Invalid phi: must be a non-negative number');
    }
    if (typeof variance !== 'number' || isNaN(variance) || variance <= 0) {
        throw new Error('Invalid variance: must be a positive number');
    }
    const a = Math.log(Math.pow(sigma, 2));
    let A = a;
    let B;
    if ((Math.pow(delta, 2)) > (Math.pow(phi, 2)) + variance) {
        const logArg = (Math.pow(delta, 2)) - (Math.pow(phi, 2)) - variance;
        if (logArg <= 0) {
            throw new Error('Invalid argument for logarithm in volatility calculation');
        }
        B = Math.log(logArg);
    }
    else {
        let k = 1;
        const MAX_ITERATIONS = 1000; // Prevent infinite loop
        while (f(a - k * constants_1.TAU, sigma, delta, phi, variance, a) < 0 && k < MAX_ITERATIONS) {
            k++;
        }
        if (k >= MAX_ITERATIONS) {
            throw new Error('Maximum iterations reached in volatility calculation');
        }
        B = a - k * constants_1.TAU;
    }
    let fA = f(A, sigma, delta, phi, variance, a);
    let fB = f(B, sigma, delta, phi, variance, a);
    let iterations = 0;
    const MAX_CONVERGENCE_ITERATIONS = 1000;
    while (Math.abs(B - A) > constants_1.EPSILON && iterations < MAX_CONVERGENCE_ITERATIONS) {
        const C = A + ((A - B) * fA / (fB - fA));
        const fC = f(C, sigma, delta, phi, variance, a);
        if (fC * fB <= 0) {
            A = B;
            fA = fB;
        }
        else {
            fA /= 2;
        }
        B = C;
        fB = fC;
        iterations++;
    }
    if (iterations >= MAX_CONVERGENCE_ITERATIONS) {
        throw new Error('Maximum convergence iterations reached in volatility calculation');
    }
    const newSigma = Math.exp(A / 2);
    // Validate result
    if (!isFinite(newSigma) || newSigma <= 0) {
        throw new Error('Invalid volatility calculation result');
    }
    return newSigma;
}
function f(x, sigma, delta, phi, variance, a) {
    if (typeof x !== 'number' || isNaN(x)) {
        throw new Error('Invalid x: must be a number');
    }
    // Protect against overflow in Math.exp
    if (x > 700) {
        return -Infinity; // When exp(x) overflows, the function approaches negative infinity
    }
    if (x < -700) {
        return -(x - a) / (Math.pow(constants_1.TAU, 2)); // When exp(x) underflows to 0, only the second term remains
    }
    const expX = Math.exp(x);
    const numerator = expX * ((Math.pow(delta, 2)) - (Math.pow(phi, 2)) - variance - expX);
    const denominator = 2 * (Math.pow(((Math.pow(phi, 2)) + variance + expX), 2));
    if (denominator === 0) {
        throw new Error('Division by zero in f function');
    }
    const i = numerator / denominator;
    const j = (x - a) / (Math.pow(constants_1.TAU, 2));
    const result = i - j;
    if (!isFinite(result)) {
        throw new Error('Invalid result in f function');
    }
    return result;
}
function getPreUpdateRD(phiPlayer, newSigma) {
    if (typeof phiPlayer !== 'number' || isNaN(phiPlayer) || phiPlayer < 0) {
        throw new Error('Invalid phiPlayer: must be a non-negative number');
    }
    if (typeof newSigma !== 'number' || isNaN(newSigma) || newSigma <= 0) {
        throw new Error('Invalid newSigma: must be a positive number');
    }
    const result = Math.sqrt((Math.pow(phiPlayer, 2)) + (Math.pow(newSigma, 2)));
    if (!isFinite(result)) {
        throw new Error('Invalid result in getPreUpdateRD');
    }
    return result;
}
function getNewRD(preUpdateRD, variance) {
    if (typeof preUpdateRD !== 'number' || isNaN(preUpdateRD) || preUpdateRD <= 0) {
        throw new Error('Invalid preUpdateRD: must be a positive number');
    }
    if (typeof variance !== 'number' || isNaN(variance) || variance <= 0) {
        throw new Error('Invalid variance: must be a positive number');
    }
    const denominator = Math.sqrt((1 / (Math.pow(preUpdateRD, 2))) + (1 / variance));
    if (denominator === 0 || !isFinite(denominator)) {
        throw new Error('Invalid denominator in getNewRD calculation');
    }
    const result = 1 / denominator;
    if (!isFinite(result) || result <= 0) {
        throw new Error('Invalid result in getNewRD calculation');
    }
    return result;
}
function getNewRating(mu, newRD, phiOpponent, score, expectedScore) {
    if (typeof mu !== 'number' || isNaN(mu)) {
        throw new Error('Invalid mu: must be a number');
    }
    if (typeof newRD !== 'number' || isNaN(newRD) || newRD <= 0) {
        throw new Error('Invalid newRD: must be a positive number');
    }
    if (typeof phiOpponent !== 'number' || isNaN(phiOpponent) || phiOpponent < 0) {
        throw new Error('Invalid phiOpponent: must be a non-negative number');
    }
    if (typeof score !== 'number' || isNaN(score) || score < 0 || score > 1) {
        throw new Error('Invalid score: must be a number between 0 and 1');
    }
    if (typeof expectedScore !== 'number' || isNaN(expectedScore) || expectedScore < 0 || expectedScore > 1) {
        throw new Error('Invalid expectedScore: must be a number between 0 and 1');
    }
    const result = mu + (Math.pow(newRD, 2)) * g(phiOpponent) * (score - expectedScore);
    if (!isFinite(result)) {
        throw new Error('Invalid result in getNewRating calculation');
    }
    return result;
}
