import {PlayerRating} from './PlayerRating';
import {
    SCALE_FACTOR,
    RD_INCREASE_CONSTANT,
    VOLATILITY_CONSTRAINT,
    CONVERGENCE_TOLERANCE
} from './constants';

function adjustRDForTime(player: PlayerRating, currentTime: Date): number {
    const timeInMonths = (currentTime.getTime() - player.lastGameTime.getTime()) / (1000 * 60 * 60 * 24 * 30); // Convert time to months
    const phi = player.rd / SCALE_FACTOR;                       // Convert RD to Glicko scale
    const phiNew = Math.sqrt(phi ** 2 + (RD_INCREASE_CONSTANT ** 2 * timeInMonths));    // Increase RD based on time
    return Math.min(350, phiNew * SCALE_FACTOR);                               // Convert back to rating scale & returning new RD
}

function calculateGValue(phi: number) {
    const denominator = Math.sqrt(1 + (3 * (phi ** 2) / (Math.PI ** 2)));
    return 1 / denominator;
}

function expectedScore(phiOpponent: number, playerRating: number, opponentRating: number) {
    const denominator = 1 + Math.exp(-calculateGValue(phiOpponent) * (playerRating - opponentRating));
    return 1 / denominator;
}

function variance(phiOpponent: number, expectedScore: number) {
    const denominator = (calculateGValue(phiOpponent) ** 2) * expectedScore * (1 - expectedScore);
    return 1 / denominator;
}

function delta(variance: number, phiOpponent: number, actualScore: number, expectedScore: number) {
    return variance * calculateGValue(phiOpponent) * (actualScore - expectedScore);
}

function updateVolatility(sigma: number, delta: number, phi: number, variance: number) {
    const initialA = Math.log(sigma ** 2);
    let iterationA = initialA;
    let iterationB;

    if ((delta ** 2) > (phi ** 2) + variance) {
        iterationB = Math.log((delta ** 2) - (phi ** 2) - variance);
    }
    else {
        let multiplier = 1;
        while (volatilityFunction(initialA - multiplier * VOLATILITY_CONSTRAINT, sigma, delta, phi, variance, initialA) < 0) {
            multiplier++;
        }
        iterationB = initialA - multiplier * VOLATILITY_CONSTRAINT;
    }

    let functionValueA = volatilityFunction(iterationA, sigma, delta, phi, variance, initialA);
    let functionValueB = volatilityFunction(iterationB, sigma, delta, phi, variance, initialA);

    while (Math.abs(iterationB - iterationA) > CONVERGENCE_TOLERANCE) {
        const iterationC: number = iterationA + ((iterationA - iterationB) * functionValueA / (functionValueB - functionValueA));
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

function volatilityFunction(x: number, sigma: number, delta: number, phi: number, variance: number, initialA: number): number {
    const firstTerm = Math.exp(x) * ((delta ** 2) - (phi ** 2) - variance - Math.exp(x)) / (2 * (((phi ** 2) + variance + Math.exp(x)) ** 2));
    const secondTerm = (x - initialA) / (VOLATILITY_CONSTRAINT ** 2);
    return firstTerm - secondTerm;
}

function getPreUpdateRD(phiPlayer: number, newSigma: number) {
    return Math.sqrt((phiPlayer ** 2) + (newSigma ** 2))
}
function getNewRD(preUpdateRD: number, variance: number) {
    const denominator = Math.sqrt((1 / (preUpdateRD ** 2)) + (1 / variance));
    return 1 / denominator;
}
function getNewRating(mu: number, newRD: number, phiOpponent: number, score: number, expectedScore: number){
    return mu + (newRD ** 2) * calculateGValue(phiOpponent) * (score - expectedScore);
}

export {
    adjustRDForTime,
    calculateGValue,
    expectedScore,
    variance,
    delta,
    updateVolatility,
    getPreUpdateRD,
    getNewRD,
    getNewRating
}