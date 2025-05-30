"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultType = void 0;
exports.updateRatings = updateRatings;
const Glicko2_1 = require("./Glicko2");
const constants_1 = require("./constants");
const glickoHelper_1 = require("./glickoHelper");
const ResultType_1 = require("./ResultType");
function updateRatings(whitePlayer, blackPlayer, result, currentTime) {
    // Adjust RD for time elapsed
    whitePlayer.rd = (0, glickoHelper_1.adjustRDForTime)(whitePlayer, currentTime);
    blackPlayer.rd = (0, glickoHelper_1.adjustRDForTime)(blackPlayer, currentTime);
    let whiteScore, blackScore;
    if (result === ResultType_1.ResultType.WHITE) {
        whiteScore = 1;
        blackScore = 0;
    }
    else if (result === ResultType_1.ResultType.BLACK) {
        whiteScore = 0;
        blackScore = 1;
    }
    else {
        whiteScore = 0.5;
        blackScore = 0.5;
    }
    const glickoWhite = new Glicko2_1.Glicko2(whitePlayer, blackPlayer, whiteScore);
    const glickoBlack = new Glicko2_1.Glicko2(blackPlayer, whitePlayer, blackScore);
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
const playerWhite = { rating: 1800, rd: 50, volatility: 0.06, lastGameTime: new Date('2025-02-01') };
const playerBlack = { rating: 1250, rd: 150, volatility: 0.06, lastGameTime: new Date('2024-03-20') };
const oldRatings = { playerWhite: Object.assign({}, playerWhite), playerBlack: Object.assign({}, playerBlack) };
// console.log('Old ratings:', { playerWhite, playerBlack });
const result = updateRatings(playerWhite, playerBlack, ResultType_1.ResultType.BLACK, new Date());
// console.log('Updated ratings:', result);
console.log(`C: ${constants_1.C}`);
console.log(`pre-whiteRD: ${oldRatings.playerWhite.rd}, post-whiteRD: ${playerWhite.rd}`);
console.log(`pre-blackRD: ${oldRatings.playerBlack.rd}, post-blackRD: ${playerBlack.rd}`);
console.log('Rating Differences:');
console.log('White:', playerWhite.rating - oldRatings.playerWhite.rating);
console.log('Black:', playerBlack.rating - oldRatings.playerBlack.rating);
__exportStar(require("./PlayerRating"), exports);
var ResultType_2 = require("./ResultType");
Object.defineProperty(exports, "ResultType", { enumerable: true, get: function () { return ResultType_2.ResultType; } });
