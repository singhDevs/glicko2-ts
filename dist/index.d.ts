import { PlayerRating } from './PlayerRating';
import { ResultType } from './ResultType';
declare function updateRatings(whitePlayer: PlayerRating, blackPlayer: PlayerRating, result: ResultType, currentTime: Date): Promise<{
    newRatingWhite: PlayerRating;
    newRatingBlack: PlayerRating;
}>;
export * from './PlayerRating';
export { ResultType } from './ResultType';
export { updateRatings };
