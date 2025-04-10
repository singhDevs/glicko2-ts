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
    // Adjust RD for time elapsed
    whitePlayer.rd = adjustRDForTime(whitePlayer, currentTime);
    blackPlayer.rd = adjustRDForTime(blackPlayer, currentTime);

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

    const glickoWhite = new Glicko2(whitePlayer, blackPlayer, whiteScore);
    const glickoBlack = new Glicko2(blackPlayer, whitePlayer, blackScore);

    const whiteResult = glickoWhite.getNewRating();
    const blackResult = glickoBlack.getNewRating();

    //Updating White data
    whitePlayer.rating = whiteResult.boundedNewRating;
    whitePlayer.rd = whiteResult.newRD;
    whitePlayer.volatility = whiteResult.newSigma;
    whitePlayer.lastGameTime = currentTime;

    //Updating Black data
    blackPlayer.rating = blackResult.boundedNewRating;
    blackPlayer.rd = blackResult.newRD;
    blackPlayer.volatility = blackResult.newSigma;
    blackPlayer.lastGameTime = currentTime;

    return { newRatingWhite: whitePlayer, newRatingBlack: blackPlayer };
}

export * from './PlayerRating';
export { ResultType } from './ResultType';
export { updateRatings };