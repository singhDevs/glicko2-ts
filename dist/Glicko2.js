"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Glicko2 = void 0;
const constants_1 = require("./constants");
const glickoHelper_1 = require("./glickoHelper");
class Glicko2 {
    constructor(playerRating, opponentRating, score) {
        // Input validation
        if (!playerRating || typeof playerRating.rating !== 'number' || isNaN(playerRating.rating) ||
            typeof playerRating.rd !== 'number' || isNaN(playerRating.rd) || playerRating.rd < 0 ||
            typeof playerRating.volatility !== 'number' || isNaN(playerRating.volatility) || playerRating.volatility <= 0) {
            throw new Error('Invalid playerRating: all properties must be valid numbers with appropriate constraints');
        }
        if (!opponentRating || typeof opponentRating.rating !== 'number' || isNaN(opponentRating.rating) ||
            typeof opponentRating.rd !== 'number' || isNaN(opponentRating.rd) || opponentRating.rd < 0 ||
            typeof opponentRating.volatility !== 'number' || isNaN(opponentRating.volatility) || opponentRating.volatility <= 0) {
            throw new Error('Invalid opponentRating: all properties must be valid numbers with appropriate constraints');
        }
        if (typeof score !== 'number' || isNaN(score) || score < 0 || score > 1) {
            throw new Error('Invalid score: must be a number between 0 and 1');
        }
        this.playerRating = playerRating;
        this.opponentRating = opponentRating;
        this.score = score;
    }
    getNewRating() {
        try {
            const muPlayer = (this.playerRating.rating - constants_1.BASE_RATING) / constants_1.SCALE_FACTOR;
            const phiPlayer = this.playerRating.rd / constants_1.SCALE_FACTOR;
            const sigma = this.playerRating.volatility;
            const muOpponent = (this.opponentRating.rating - constants_1.BASE_RATING) / constants_1.SCALE_FACTOR;
            const phiOpponent = this.opponentRating.rd / constants_1.SCALE_FACTOR;
            const gFunction = (0, glickoHelper_1.g)(phiPlayer);
            const E = (0, glickoHelper_1.expectedScore)(phiOpponent, muPlayer, muOpponent);
            const v = (0, glickoHelper_1.variance)(phiOpponent, E);
            const del = (0, glickoHelper_1.delta)(v, phiOpponent, this.score, E);
            const newSigma = (0, glickoHelper_1.updateVolatility)(sigma, del, phiPlayer, v);
            const preUpdateRD = (0, glickoHelper_1.getPreUpdateRD)(phiPlayer, newSigma);
            const newPhiPlayer = (0, glickoHelper_1.getNewRD)(preUpdateRD, v);
            const newMu = (0, glickoHelper_1.getNewRating)(muPlayer, newPhiPlayer, phiOpponent, this.score, E);
            const newRating = newMu * constants_1.SCALE_FACTOR + constants_1.BASE_RATING;
            const ratingChange = newRating - this.playerRating.rating;
            const boundedNewRating = this.playerRating.rating + Math.max(-110, Math.min(110, ratingChange));
            const newRD = Math.min(250, newPhiPlayer * constants_1.SCALE_FACTOR);
            // Validate results
            if (!isFinite(boundedNewRating) || !isFinite(newRD) || !isFinite(newSigma)) {
                throw new Error('Invalid calculation results in getNewRating');
            }
            if (newRD < 0 || newSigma <= 0) {
                throw new Error('Invalid bounds in calculated values');
            }
            return { boundedNewRating, newRD, newSigma };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Rating calculation failed: ${errorMessage}`);
        }
    }
}
exports.Glicko2 = Glicko2;
;
