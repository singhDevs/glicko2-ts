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
    const t = (currentTime.getTime() - player.lastGameTime.getTime()) / (1000 * 60 * 60 * 24 * 30); // Convert time to months
    const phi = player.rd / constants_1.SCALE_FACTOR; // Convert RD to Glicko scale
    const phiNew = Math.sqrt(Math.pow(phi, 2) + (Math.pow(constants_1.C, 2) * t)); // Increase RD based on time
    return Math.min(350, phiNew * constants_1.SCALE_FACTOR); // Convert back to rating scale & returning new RD
}
function g(phi) {
    const denominator = Math.sqrt(1 + (3 * (Math.pow(phi, 2)) / (Math.pow(Math.PI, 2))));
    return 1 / denominator;
}
function expectedScore(phiOpponent, playerRating, opponentRating) {
    const denominator = 1 + Math.exp(-g(phiOpponent) * (playerRating - opponentRating));
    return 1 / denominator;
}
function variance(phiOpponent, expectedScore) {
    const denominator = (Math.pow(g(phiOpponent), 2)) * expectedScore * (1 - expectedScore);
    return 1 / denominator;
}
function delta(variance, phiOpponent, actualScore, expectedScore) {
    return variance * g(phiOpponent) * (actualScore - expectedScore);
}
function updateVolatility(sigma, delta, phi, variance) {
    const a = Math.log(Math.pow(sigma, 2));
    let A = a;
    let B;
    if ((Math.pow(delta, 2)) > (Math.pow(phi, 2)) + variance) {
        B = Math.log((Math.pow(delta, 2)) - (Math.pow(phi, 2)) - variance);
    }
    else {
        let k = 1;
        while (f(a - k * constants_1.TAU, sigma, delta, phi, variance, a) < 0) {
            k++;
        }
        B = a - k * constants_1.TAU;
    }
    let fA = f(A, sigma, delta, phi, variance, a);
    let fB = f(B, sigma, delta, phi, variance, a);
    while (Math.abs(B - A) > constants_1.EPSILON) {
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
    }
    const newSigma = Math.exp(A / 2);
    return newSigma;
}
function f(x, sigma, delta, phi, variance, a) {
    const i = Math.exp(x) * ((Math.pow(delta, 2)) - (Math.pow(phi, 2)) - variance - Math.exp(x)) / (2 * (Math.pow(((Math.pow(phi, 2)) + variance + Math.exp(x)), 2)));
    const j = (x - a) / (Math.pow(constants_1.TAU, 2));
    return i - j;
}
function getPreUpdateRD(phiPlayer, newSigma) {
    return Math.sqrt((Math.pow(phiPlayer, 2)) + (Math.pow(newSigma, 2)));
}
function getNewRD(preUpdateRD, variance) {
    const denominator = Math.sqrt((1 / (Math.pow(preUpdateRD, 2))) + (1 / variance));
    return 1 / denominator;
}
function getNewRating(mu, newRD, phiOpponent, score, expectedScore) {
    return mu + (Math.pow(newRD, 2)) * g(phiOpponent) * (score - expectedScore);
}
