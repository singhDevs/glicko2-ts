export interface PlayerRating {
    rating: number;         // Current rating
    rd: number;             // Rating deviation (uncertainty)
    volatility: number;     // Volatility (rate of rating change)
    lastGameTime: Date;     // Time of last game for RD adjustment
};