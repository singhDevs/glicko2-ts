import { Glicko2 } from './Glicko2';
import PlayerRating from './PlayerRating';
import { adjustRDForTime } from './glickoHelper';

function updateRatings(
    whitePlayer: PlayerRating,
    blackPlayer: PlayerRating,
    result: 'w' | 'b' | 'd',
    currentTime: Date
): { newRatingWhite: PlayerRating; newRatingBlack: PlayerRating } {
    // Adjust RD for time elapsed
    whitePlayer.rd = adjustRDForTime(whitePlayer, currentTime);
    blackPlayer.rd = adjustRDForTime(blackPlayer, currentTime);

    let whiteScore, blackScore;
    if (result == 'w') {
        whiteScore = 1;
        blackScore = 0;
    }
    else if (result == 'b') {
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
    whitePlayer.rating = whiteResult.newRating;
    whitePlayer.rd = whiteResult.newRD;
    whitePlayer.volatility = whiteResult.newSigma;
    whitePlayer.lastGameTime = currentTime;
    
    //Updating Black data
    blackPlayer.rating = blackResult.newRating;
    blackPlayer.rd = blackResult.newRD;
    blackPlayer.volatility = blackResult.newSigma;
    blackPlayer.lastGameTime = currentTime;

    return { newRatingWhite: whitePlayer, newRatingBlack: blackPlayer };
}


const playerWhite: PlayerRating = { rating: 1800, rd: 50, volatility: 0.06, lastGameTime: new Date('2025-02-01') };
const playerBlack: PlayerRating = { rating: 1200, rd: 100, volatility: 0.06, lastGameTime: new Date('2024-01-20') };

const oldRatings = { playerWhite: {...playerWhite}, playerBlack: {...playerBlack} };
console.log('Old ratings:', { playerWhite, playerBlack });

const result = updateRatings(playerWhite, playerBlack, 'b', new Date());

console.log('Updated ratings:', result);

console.log('Rating Differences:')
console.log('White:', playerWhite.rating - oldRatings.playerWhite.rating);
console.log('Black:', playerBlack.rating - oldRatings.playerBlack.rating);

export { PlayerRating, updateRatings };