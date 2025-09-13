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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultType = void 0;
exports.updateRatings = updateRatings;
const Glicko2_1 = require("./Glicko2");
const glickoHelper_1 = require("./glickoHelper");
const ResultType_1 = require("./ResultType");
function updateRatings(whitePlayer, blackPlayer, result, currentTime) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const whitePlayerCopy = {
            rating: whitePlayer.rating,
            rd: (0, glickoHelper_1.adjustRDForTime)(whitePlayer, currentTime),
            volatility: whitePlayer.volatility,
            lastGameTime: new Date(whitePlayer.lastGameTime.getTime())
        };
        const blackPlayerCopy = {
            rating: blackPlayer.rating,
            rd: (0, glickoHelper_1.adjustRDForTime)(blackPlayer, currentTime),
            volatility: blackPlayer.volatility,
            lastGameTime: new Date(blackPlayer.lastGameTime.getTime())
        };
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
        const glickoWhite = new Glicko2_1.Glicko2(whitePlayerCopy, blackPlayerCopy, whiteScore);
        const glickoBlack = new Glicko2_1.Glicko2(blackPlayerCopy, whitePlayerCopy, blackScore);
        const whiteResult = glickoWhite.getNewRating();
        const blackResult = glickoBlack.getNewRating();
        // Create new PlayerRating objects instead of mutating inputs
        const newRatingWhite = {
            rating: whiteResult.boundedNewRating,
            rd: whiteResult.newRD,
            volatility: whiteResult.newSigma,
            lastGameTime: new Date(currentTime.getTime())
        };
        const newRatingBlack = {
            rating: blackResult.boundedNewRating,
            rd: blackResult.newRD,
            volatility: blackResult.newSigma,
            lastGameTime: new Date(currentTime.getTime())
        };
        return { newRatingWhite, newRatingBlack };
    });
}
__exportStar(require("./PlayerRating"), exports);
var ResultType_2 = require("./ResultType");
Object.defineProperty(exports, "ResultType", { enumerable: true, get: function () { return ResultType_2.ResultType; } });
