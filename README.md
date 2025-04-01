# glicko2-ts
A robust and adaptable Glicko-2 rating system library implemented in TypeScript. This library provides an accurate and dynamic method for tracking player performance by incorporating not only their rating but also the uncertainty (rating deviation) and consistency (volatility) of their play. Designed for online Chess game platforms.<br/>

## Overview
Glicko-2 builds on the traditional Elo and Glicko systems by introducing two key concepts:
- **Rating Deviation (RD)**: Quantifies the uncertainty in a player’s rating. Frequent play or recent games lead to lower RD, meaning more confidence in the rating.
- **Volatility (σ)**: Measures the expected fluctuation in a player’s performance. Low volatility indicates stable performance, while high volatility suggests erratic results. This parameter allows the system to quickly adapt to changes in a player's form.

These features combine to offer a dynamic and statistically sound method to assess a player's true skill level—even when game frequency or consistency varies.

## Features
- **Dynamic Rating Updates**: Adjust ratings based on actual performance vs. expected outcomes.
- **Integrated Uncertainty**: Uses RD to measure confidence in the rating.
- **Performance Volatility**: Captures consistency with a volatility parameter that adjusts based on game results.
- **Asynchronous Updates**: Easily integrate with systems that require asynchronous operations.

## Installation
Download the library from Github:
````bash
git clone https://github.com/singhDevs/glicko2-ts.git
````

## Usage
### Importing the Library
Import the key functions, interfaces, and enums from the library:
```typescript
import { updateRatings, PlayerRating, ResultType } from 'glicko2-ts';
```

### Updating Player Ratings
Use the ```updateRatings``` function to compute new ratings after a game between two players. The function requires:
- ```whitePlayer```: The current rating for the white side.
- ```blackPlayer```: The current rating for the black side.
- ```result```: Outcome of the game, represented as a ResultType enum.
- ```currentTime```: A Date object for when the game was played, useful for RD adjustments.
**Example**
```typescript
const whitePlayer: PlayerRating = {
  rating: 1500,
  rd: 200,
  volatility: 0.06,
  lastGameTime: new Date('2025-03-01')
};

const blackPlayer: PlayerRating = {
  rating: 1550,
  rd: 180,
  volatility: 0.05,
  lastGameTime: new Date('2025-03-02')
};

async function processGame() {
  const result = ResultType.DRAW; // or ResultType.WHITE / ResultType.BLACK
  const currentTime = new Date();

  const { newRatingWhite, newRatingBlack } = await updateRatings(
    whitePlayer,
    blackPlayer,
    result,
    currentTime
  );

  console.log('Updated White Rating:', newRatingWhite);
  console.log('Updated Black Rating:', newRatingBlack);
}

processGame();
```
## API References
### ```updateRatings```
Asynchronously computes and returns the new ratings for two players after a game.
```typescript
async function updateRatings(
  whitePlayer: PlayerRating,
  blackPlayer: PlayerRating,
  result: ResultType,
  currentTime: Date
): Promise<{ newRatingWhite: PlayerRating; newRatingBlack: PlayerRating }>
```
**Parameters**
- ```whitePlayer``` (```PlayerRating```): The rating details for the white player.
- ```blackPlayer``` (```PlayerRating```): The rating details for the black player.
- ```result``` (```ResultType```): The outcome of the game (ResultType.WHITE, ResultType.BLACK, ResultType.DRAW)
- ```currentTime``` (```Date```): The timestamp of the game, used for adjusting RD.<br/>
**Returns**: A promise resolving to an object containing the updated ratings for both the players.

### ```PlayerRating``` interface
Represents a player's rating information:
```typescript
export interface PlayerRating {
  rating: number;         // Current rating
  rd: number;             // Rating deviation (uncertainty)
  volatility: number;     // Volatility (rate of rating change)
  lastGameTime: Date;     // Time of last game for RD adjustment
};
```
### ```ResultType``` enum
Defines possible game outcomes:
```typescript
export enum ResultType {
  WHITE,  // White wins
  BLACK,  // Black wins
  DRAW    // Draw
}
```
## References
Glicko-2 Paper by **Professor Mark E. Glickman**: [Glicko-2 paper](https://www.glicko.net/glicko/glicko2.pdf)

## License
This project is licensed under the MIT license. See the [LICENSE](https://github.com/singhDevs/glicko2-ts/blob/main/LICENSE) file for more info.
