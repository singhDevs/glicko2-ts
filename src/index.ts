import { Glicko2 } from './Glicko2';
import { PlayerRating } from './PlayerRating';
import { adjustRDForTime } from './glickoHelper';
import { ResultType } from './ResultType';

async function updateRatings(
    whitePlayer: PlayerRating,
    blackPlayer: PlayerRating,
    result: ResultType,
    currentTime: Date
): Promise<{ newRatingWhite: PlayerRating; newRatingBlack: PlayerRating }> {
    // Input validation
    if (!whitePlayer || !blackPlayer || !currentTime) {
        throw new Error('Invalid input: whitePlayer, blackPlayer, and currentTime are required');
    }
    
    if (isNaN(whitePlayer.rating) || isNaN(blackPlayer.rating) || 
        isNaN(whitePlayer.rd) || isNaN(blackPlayer.rd) ||
        isNaN(whitePlayer.volatility) || isNaN(blackPlayer.volatility)) {
        throw new Error('Invalid input: rating values must be numbers');
    }

    if (!(currentTime instanceof Date) || isNaN(currentTime.getTime())) {
        throw new Error('Invalid input: currentTime must be a valid Date object');
    }

    if (!(whitePlayer.lastGameTime instanceof Date) || isNaN(whitePlayer.lastGameTime.getTime()) ||
        !(blackPlayer.lastGameTime instanceof Date) || isNaN(blackPlayer.lastGameTime.getTime())) {
        throw new Error('Invalid input: lastGameTime must be valid Date objects');
    }

    // Create copies to avoid mutating input objects (prevents memory leaks)
    const whitePlayerCopy: PlayerRating = {
        rating: whitePlayer.rating,
        rd: adjustRDForTime(whitePlayer, currentTime),
        volatility: whitePlayer.volatility,
        lastGameTime: new Date(whitePlayer.lastGameTime.getTime())
    };

    const blackPlayerCopy: PlayerRating = {
        rating: blackPlayer.rating,
        rd: adjustRDForTime(blackPlayer, currentTime),
        volatility: blackPlayer.volatility,
        lastGameTime: new Date(blackPlayer.lastGameTime.getTime())
    };

    let whiteScore, blackScore;
    if (result === ResultType.WHITE) {
        whiteScore = 1;
        blackScore = 0;
    }
    else if (result === ResultType.BLACK) {
        whiteScore = 0;
        blackScore = 1;
    }
    else {
        whiteScore = 0.5;
        blackScore = 0.5;
    }

    const glickoWhite = new Glicko2(whitePlayerCopy, blackPlayerCopy, whiteScore);
    const glickoBlack = new Glicko2(blackPlayerCopy, whitePlayerCopy, blackScore);

    const whiteResult = glickoWhite.getNewRating();
    const blackResult = glickoBlack.getNewRating();

    // Create new PlayerRating objects instead of mutating inputs
    const newRatingWhite: PlayerRating = {
        rating: whiteResult.boundedNewRating,
        rd: whiteResult.newRD,
        volatility: whiteResult.newSigma,
        lastGameTime: new Date(currentTime.getTime())
    };

    const newRatingBlack: PlayerRating = {
        rating: blackResult.boundedNewRating,
        rd: blackResult.newRD,
        volatility: blackResult.newSigma,
        lastGameTime: new Date(currentTime.getTime())
    };

    return { newRatingWhite, newRatingBlack };
}

export * from './PlayerRating';
export { ResultType } from './ResultType';
export { updateRatings };