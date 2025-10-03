"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustRDForTime = adjustRDForTime;
exports.calculateGValue = calculateGValue;
exports.expectedScore = expectedScore;
exports.variance = variance;
exports.delta = delta;
exports.updateVolatility = updateVolatility;
exports.getPreUpdateRD = getPreUpdateRD;
exports.getNewRD = getNewRD;
exports.getNewRating = getNewRating;
const constants_1 = require("./constants");
function adjustRDForTime(player, currentTime) {
    const timeInMonths = (currentTime.getTime() - player.lastGameTime.getTime()) / (1000 * 60 * 60 * 24 * 30); // Convert time to months
    const phi = player.rd / constants_1.SCALE_FACTOR; // Convert RD to Glicko scale
    const phiNew = Math.sqrt(Math.pow(phi, 2) + (Math.pow(constants_1.RD_INCREASE_CONSTANT, 2) * timeInMonths)); // Increase RD based on time
    return Math.min(350, phiNew * constants_1.SCALE_FACTOR); // Convert back to rating scale & returning new RD
}
function calculateGValue(phi) {
    const denominator = Math.sqrt(1 + (3 * (Math.pow(phi, 2)) / (Math.pow(Math.PI, 2))));
    return 1 / denominator;
}
function expectedScore(phiOpponent, playerRating, opponentRating) {
    const denominator = 1 + Math.exp(-calculateGValue(phiOpponent) * (playerRating - opponentRating));
    return 1 / denominator;
}
function variance(phiOpponent, expectedScore) {
    const denominator = (Math.pow(calculateGValue(phiOpponent), 2)) * expectedScore * (1 - expectedScore);
    return 1 / denominator;
}
function delta(variance, phiOpponent, actualScore, expectedScore) {
    return variance * calculateGValue(phiOpponent) * (actualScore - expectedScore);
}
function updateVolatility(sigma, delta, phi, variance) {
    const initialA = Math.log(Math.pow(sigma, 2));
    let iterationA = initialA;
    let iterationB;
    if ((Math.pow(delta, 2)) > (Math.pow(phi, 2)) + variance) {
        iterationB = Math.log((Math.pow(delta, 2)) - (Math.pow(phi, 2)) - variance);
    }
    else {
        let multiplier = 1;
        while (volatilityFunction(initialA - multiplier * constants_1.VOLATILITY_CONSTRAINT, sigma, delta, phi, variance, initialA) < 0) {
            multiplier++;
        }
        iterationB = initialA - multiplier * constants_1.VOLATILITY_CONSTRAINT;
    }
    let functionValueA = volatilityFunction(iterationA, sigma, delta, phi, variance, initialA);
    let functionValueB = volatilityFunction(iterationB, sigma, delta, phi, variance, initialA);
    while (Math.abs(iterationB - iterationA) > constants_1.CONVERGENCE_TOLERANCE) {
        const iterationC = iterationA + ((iterationA - iterationB) * functionValueA / (functionValueB - functionValueA));
        const functionValueC = volatilityFunction(iterationC, sigma, delta, phi, variance, initialA);
        if (functionValueC * functionValueB <= 0) {
            iterationA = iterationB;
            functionValueA = functionValueB;
        }
        else {
            functionValueA /= 2;
        }
        iterationB = iterationC;
        functionValueB = functionValueC;
    }
    const newSigma = Math.exp(iterationA / 2);
    return newSigma;
}
function volatilityFunction(x, sigma, delta, phi, variance, initialA) {
    const firstTerm = Math.exp(x) * ((Math.pow(delta, 2)) - (Math.pow(phi, 2)) - variance - Math.exp(x)) / (2 * (Math.pow(((Math.pow(phi, 2)) + variance + Math.exp(x)), 2)));
    const secondTerm = (x - initialA) / (Math.pow(constants_1.VOLATILITY_CONSTRAINT, 2));
    return firstTerm - secondTerm;
}
function getPreUpdateRD(phiPlayer, newSigma) {
    return Math.sqrt((Math.pow(phiPlayer, 2)) + (Math.pow(newSigma, 2)));
}
function getNewRD(preUpdateRD, variance) {
    const denominator = Math.sqrt((1 / (Math.pow(preUpdateRD, 2))) + (1 / variance));
    return 1 / denominator;
}
function getNewRating(mu, newRD, phiOpponent, score, expectedScore) {
    return mu + (Math.pow(newRD, 2)) * calculateGValue(phiOpponent) * (score - expectedScore);
}
