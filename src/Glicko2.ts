import {PlayerRating} from "./PlayerRating";
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

            // Validate results
            if (!isFinite(boundedNewRating) || !isFinite(newRD) || !isFinite(newSigma)) {
                throw new Error('Invalid calculation results in getNewRating');
            }

            if (newRD < 0 || newSigma <= 0) {
                throw new Error('Invalid bounds in calculated values');
            }

            return {boundedNewRating, newRD, newSigma};
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Rating calculation failed: ${errorMessage}`);
        }
    }
};