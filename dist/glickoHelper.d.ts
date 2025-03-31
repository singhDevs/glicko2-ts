import { PlayerRating } from './PlayerRating';
declare function adjustRDForTime(player: PlayerRating, currentTime: Date): number;
declare function g(phi: number): number;
declare function expectedScore(phiOpponent: number, playerRating: number, opponentRating: number): number;
declare function variance(phiOpponent: number, expectedScore: number): number;
declare function delta(variance: number, phiOpponent: number, actualScore: number, expectedScore: number): number;
declare function updateVolatility(sigma: number, delta: number, phi: number, variance: number): number;
declare function getPreUpdateRD(phiPlayer: number, newSigma: number): number;
declare function getNewRD(preUpdateRD: number, variance: number): number;
declare function getNewRating(mu: number, newRD: number, phiOpponent: number, score: number, expectedScore: number): number;
export { adjustRDForTime, g, expectedScore, variance, delta, updateVolatility, getPreUpdateRD, getNewRD, getNewRating };
