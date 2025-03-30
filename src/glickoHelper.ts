import PlayerRating from './PlayerRating';
import {
    SCALE_FACTOR,
    C,
    TAU,
    EPSILON
} from './constants';

function adjustRDForTime(player: PlayerRating, currentTime: Date): number {
    const t = (currentTime.getTime() - player.lastGameTime.getTime()) / (1000 * 60 * 60 * 24 * 30); // Convert time to months
    const phi = player.rd / SCALE_FACTOR;                       // Convert RD to Glicko scale
    const phiNew = Math.sqrt(phi ** 2 + (C ** 2 * t));    // Increase RD based on time
    return Math.min(350, phiNew * SCALE_FACTOR);                               // Convert back to rating scale & returning new RD
}

function g(phi: number) {
    const denominator = Math.sqrt(1 + (3 * (phi ** 2) / (Math.PI ** 2)));
    return 1 / denominator;
}

function expectedScore(phiOpponent: number, playerRating: number, opponentRating: number) {
    const denominator = 1 + Math.exp(-g(phiOpponent) * (playerRating - opponentRating));
    return 1 / denominator;
}

function variance(phiOpponent: number, expectedScore: number) {
    const denominator = (g(phiOpponent) ** 2) * expectedScore * (1 - expectedScore);
    return 1 / denominator;
}

function delta(variance: number, phiOpponent: number, actualScore: number, expectedScore: number) {
    return variance * g(phiOpponent) * (actualScore - expectedScore);
}

function updateVolatility(sigma: number, delta: number, phi: number, variance: number) {
    const a = Math.log(sigma ** 2);
    let A = a;
    let B;

    if ((delta ** 2) > (phi ** 2) + variance) {
        B = Math.log((delta ** 2) - (phi ** 2) - variance);
    }
    else {
        let k = 1;
        while (f(a - k * TAU, sigma, delta, phi, variance, a) < 0) {
            k++;
        }
        B = a - k * TAU;
    }

    let fA = f(A, sigma, delta, phi, variance, a);
    let fB = f(B, sigma, delta, phi, variance, a);

    while (Math.abs(B - A) > EPSILON) {
        const C: number = A + ((A - B) * fA / (fB - fA));
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

function f(x: number, sigma: number, delta: number, phi: number, variance: number, a: number): number {
    const i = Math.exp(x) * ((delta ** 2) - (phi ** 2) - variance - Math.exp(x)) / (2 * (((phi ** 2) + variance + Math.exp(x)) ** 2));
    const j = (x - a) / (TAU ** 2);
    return i - j;
}

function getPreUpdateRD(phiPlayer: number, newSigma: number) {
    return Math.sqrt((phiPlayer ** 2) + (newSigma ** 2))
}
function getNewRD(preUpdateRD: number, variance: number) {
    const denominator = Math.sqrt((1 / (preUpdateRD ** 2)) + (1 / variance));
    return 1 / denominator;
}
function getNewRating(mu: number, newRD: number, phiOpponent: number, score: number, expectedScore: number){
    return mu + (newRD ** 2) * g(phiOpponent) * (score - expectedScore);
}

export {
    adjustRDForTime,
    g,
    expectedScore,
    variance,
    delta,
    updateVolatility,
    getPreUpdateRD,
    getNewRD,
    getNewRating
}