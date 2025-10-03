"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Glicko2 = void 0;
const constants_1 = require("./constants");
const glickoHelper_1 = require("./glickoHelper");
class Glicko2 {
    constructor(playerRating, opponentRating, score) {
        this.playerRating = playerRating;
        this.opponentRating = opponentRating;
        this.score = score;
    }
    getNewRating() {
        const muPlayer = (this.playerRating.rating - constants_1.BASE_RATING) / constants_1.SCALE_FACTOR;
        const phiPlayer = this.playerRating.rd / constants_1.SCALE_FACTOR;
        const sigma = this.playerRating.volatility;
        const muOpponent = (this.opponentRating.rating - constants_1.BASE_RATING) / constants_1.SCALE_FACTOR;
        const phiOpponent = this.opponentRating.rd / constants_1.SCALE_FACTOR;
        const expectedScoreValue = (0, glickoHelper_1.expectedScore)(phiOpponent, muPlayer, muOpponent);
        const varianceValue = (0, glickoHelper_1.variance)(phiOpponent, expectedScoreValue);
        const deltaValue = (0, glickoHelper_1.delta)(varianceValue, phiOpponent, this.score, expectedScoreValue);
        const newSigma = (0, glickoHelper_1.updateVolatility)(sigma, deltaValue, phiPlayer, varianceValue);
        const preUpdateRD = (0, glickoHelper_1.getPreUpdateRD)(phiPlayer, newSigma);
        const newPhiPlayer = (0, glickoHelper_1.getNewRD)(preUpdateRD, varianceValue);
        const newMu = (0, glickoHelper_1.getNewRating)(muPlayer, newPhiPlayer, phiOpponent, this.score, expectedScoreValue);
        const newRating = newMu * constants_1.SCALE_FACTOR + constants_1.BASE_RATING;
        const ratingChange = newRating - this.playerRating.rating;
        const boundedNewRating = this.playerRating.rating + Math.max(-110, Math.min(110, ratingChange));
        const newRD = Math.min(250, newPhiPlayer * constants_1.SCALE_FACTOR);
        return { boundedNewRating, newRD, newSigma };
    }
}
exports.Glicko2 = Glicko2;
;
