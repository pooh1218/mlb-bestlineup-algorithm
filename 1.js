const fs = require('fs');
const csv = require('csv-parser');

const PLAYER_CSV = 'players.csv'; // Path to your CSV file

const POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'OF']; // Example positions, adjust as needed
const LINEUP_SIZE = 9; // Example lineup size, adjust as needed
const POPULATION_SIZE = 100;
const GENERATIONS = 500;
const MUTATION_RATE = 0.1;
const ELITE_RATE = 0.1;
const SALARY_CAP = 50000; // Example salary cap, adjust as needed

// Read CSV and parse player data
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const players = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        players.push({
          name: row.name,
          team: row.team,
          pos: row.pos,
          player_id: row.player_id,
          proj_own: parseFloat(row.proj_own),
          salary: parseFloat(row.salary)
        });
      })
      .on('end', () => {
        resolve(players);
      })
      .on('error', reject);
  });
}

// Initialize population with random lineups
function initializePopulation(players) {
  const population = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    population.push(generateRandomLineup(players));
  }
  return population;
}

// Generate a random lineup
function generateRandomLineup(players) {
  const lineup = [];
  const positionsFilled = {};
  while (lineup.length < LINEUP_SIZE) {
    const player = players[Math.floor(Math.random() * players.length)];
    if (!positionsFilled[player.pos] && lineup.length < LINEUP_SIZE) {
      lineup.push(player);
      positionsFilled[player.pos] = true;
    }
  }
  return lineup;
}

// Calculate fitness of a lineup
function calculateFitness(lineup) {
  const totalProjection = lineup.reduce((sum, player) => sum + player.proj_own, 0);
  const totalSalary = lineup.reduce((sum, player) => sum + player.salary, 0);
  if (totalSalary > SALARY_CAP) return 0;
  return totalProjection;
}

// Selection process
function selectParents(population) {
  const matingPool = [];
  population.forEach(lineup => {
    const fitness = calculateFitness(lineup);
    const n = Math.floor(fitness * 100); // Higher fitness -> higher chance to be selected
    for (let i = 0; i < n; i++) {
      matingPool.push(lineup);
    }
  });
  return matingPool;
}

// Crossover between two parents to produce offspring
function crossover(parentA, parentB) {
  const midpoint = Math.floor(Math.random() * parentA.length);
  const child = [...parentA.slice(0, midpoint), ...parentB.slice(midpoint)];
  return child;
}

// Mutate a lineup
function mutate(lineup, players) {
  if (Math.random() < MUTATION_RATE) {
    const index = Math.floor(Math.random() * lineup.length);
    const newPlayer = players[Math.floor(Math.random() * players.length)];
    lineup[index] = newPlayer;
  }
  return lineup;
}

// Run the genetic algorithm
async function runGeneticAlgorithm() {
  const players = await readCSV(PLAYER_CSV);
  let population = initializePopulation(players);
  for (let generation = 0; generation < GENERATIONS; generation++) {
    const matingPool = selectParents(population);
    const newPopulation = [];
    for (let i = 0; i < POPULATION_SIZE; i++) {
      const parentA = matingPool[Math.floor(Math.random() * matingPool.length)];
      const parentB = matingPool[Math.floor(Math.random() * matingPool.length)];
      let child = crossover(parentA, parentB);
      child = mutate(child, players);
      newPopulation.push(child);
    }
    population = newPopulation;
    population.sort((a, b) => calculateFitness(b) - calculateFitness(a));
    const bestLineup = population[0];
    console.log(`Generation ${generation + 1}: Best lineup with fitness ${calculateFitness(bestLineup)}`);
  }
  const bestLineup = population[0];
  console.log('Best Lineup:', bestLineup);
}

runGeneticAlgorithm().catch(console.error);
