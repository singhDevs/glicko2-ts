import { PlayerRating } from "./PlayerRating";
export declare class Glicko2 {
    playerRating: PlayerRating;
    opponentRating: PlayerRating;
    score: number;
    constructor(playerRating: PlayerRating, opponentRating: PlayerRating, score: number);
    getNewRating(): {
        boundedNewRating: number;
        newRD: number;
        newSigma: number;
    };
}
//# sourceMappingURL=Glicko2.d.ts.map