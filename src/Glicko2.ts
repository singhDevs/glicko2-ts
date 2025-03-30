import PlayerRating from "./PlayerRating";
import {
    SCALE_FACTOR,
    BASE_RATING
} from './constants';
import {
    g,
    expectedScore,
    variance,
    delta,
    updateVolatility,
    getPreUpdateRD,
    getNewRD,
    getNewRating
} from './glickoHelper';

export class Glicko2{
    playerRating: PlayerRating;
    opponentRating: PlayerRating;
    score: number;
    constructor(playerRating: PlayerRating, opponentRating: PlayerRating, score: number){
        this.playerRating = playerRating;
        this.opponentRating = opponentRating;
        this.score = score;
    }

    getNewRating() {
        const muPlayer = (this.playerRating.rating - BASE_RATING)/SCALE_FACTOR;
        const phiPlayer = this.playerRating.rd/SCALE_FACTOR;
        const sigma = this.playerRating.volatility;
        const muOpponent = (this.opponentRating.rating - BASE_RATING)/SCALE_FACTOR;
        const phiOpponent = this.opponentRating.rd/SCALE_FACTOR;

        const gFunction = g(phiPlayer);
        const E = expectedScore(phiOpponent, muPlayer, muOpponent);
        const v = variance(phiOpponent, E);
        const del = delta(v, phiOpponent, this.score, E);
        const newSigma = updateVolatility(sigma, del, phiPlayer, v);

        const preUpdateRD = getPreUpdateRD(phiPlayer, newSigma);
        const newPhiPlayer = getNewRD(preUpdateRD, v);
        const newMu = getNewRating(muPlayer, newPhiPlayer, phiOpponent, this.score, E);

        const newRating = newMu * SCALE_FACTOR + BASE_RATING;
        const ratingChange = newRating - this.playerRating.rating;
        const boundedNewRating = this.playerRating.rating + Math.max(-110, Math.min(110, ratingChange));
        const newRD = Math.min(250, newPhiPlayer * SCALE_FACTOR);

        return {boundedNewRating, newRD, newSigma};
    }
};