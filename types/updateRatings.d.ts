import { PlayerRating } from '../src/PlayerRating';
import { ResultType } from '../src/ResultType';

export function updateRatings(
    whitePlayer: PlayerRating,
    blackPlayer: PlayerRating,
    result: ResultType,
    currentTime: Date
): {
    newRatingWhite: PlayerRating;
    newRatingBlack: PlayerRating;
};