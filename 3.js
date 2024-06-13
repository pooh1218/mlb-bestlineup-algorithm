const fs = require('fs');
const csv = require('csv-parser');

const PLAYER_CSV_FILE = 'players.csv';
const TEAM_SIZE = 10;
const MAX_BUDGET = 50000;
const POPULATION_SIZE = 100;
const GENERATIONS = 100;
let MUTATION_RATE = 0.1;
const ELITE_RATE = 0.1;

// Read CSV file
function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
}

// Generate a random lineup
function generateLineup(players) {
    const lineup = new Set();
    while (lineup.size < TEAM_SIZE) {
        const player = players[Math.floor(Math.random() * players.length)];
        lineup.add(player);
    }
    return Array.from(lineup);
}

// Calculate the fitness of a lineup
function calculateFitness(lineup) {
    const totalSalary = lineup.reduce((sum, player) => sum + parseInt(player.salary, 10), 0);
    if (totalSalary > MAX_BUDGET) return 0;
    const totalProjection = lineup.reduce((sum, player) => sum + parseFloat(player.proj_own), 0);
    return totalProjection;
}

// Selection operation
function selection(population, fitnesses) {
    const matingPool = [];
    const totalFitness = fitnesses.reduce((sum, fit) => sum + fit, 0);
    for (let i = 0; i < POPULATION_SIZE; i++) {
        const randomValue = Math.random() * totalFitness;
        let runningSum = 0;
        for (let j = 0; j < POPULATION_SIZE; j++) {
            runningSum += fitnesses[j];
            if (runningSum > randomValue) {
                matingPool.push(population[j]);
                break;
            }
        }
    }
    return matingPool;
}

// Crossover operation
function crossover(parent1, parent2) {
    const child = new Set();
    const midPoint = Math.floor(Math.random() * TEAM_SIZE);
    for (let i = 0; i < TEAM_SIZE; i++) {
        if (i > midPoint) child.add(parent1[i]);
        else child.add(parent2[i]);
    }
    // Ensure child has exactly TEAM_SIZE unique players
    while (child.size < TEAM_SIZE) {
        const randomPlayer = parent1.concat(parent2)[Math.floor(Math.random() * (parent1.length + parent2.length))];
        child.add(randomPlayer);
    }
    return Array.from(child);
}

// Mutation operation
function mutate(lineup, players) {
    if (Math.random() < MUTATION_RATE) {
        const index = Math.floor(Math.random() * TEAM_SIZE);
        let newPlayer;
        do {
            newPlayer = players[Math.floor(Math.random() * players.length)];
        } while (lineup.includes(newPlayer));
        lineup[index] = newPlayer;
    }
    return lineup;
}

// Main genetic algorithm function
async function geneticAlgorithm() {
    const players = await readCSV(PLAYER_CSV_FILE);
    let population = Array.from({ length: POPULATION_SIZE }, () => generateLineup(players));

    for (let generation = 0; generation < GENERATIONS; generation++) {
        const fitnesses = population.map(calculateFitness);
        const newPopulation = [];

        const eliteCount = Math.floor(ELITE_RATE * POPULATION_SIZE);
        const eliteLineups = population
            .map((lineup, index) => ({ lineup, fitness: fitnesses[index] }))
            .sort((a, b) => b.fitness - a.fitness)
            .slice(0, eliteCount)
            .map(elite => elite.lineup);

        newPopulation.push(...eliteLineups);

        const matingPool = selection(population, fitnesses);

        while (newPopulation.length < POPULATION_SIZE) {
            const parent1 = matingPool[Math.floor(Math.random() * matingPool.length)];
            const parent2 = matingPool[Math.floor(Math.random() * matingPool.length)];
            let child = crossover(parent1, parent2);
            child = mutate(child, players);
            newPopulation.push(child);
        }

        population = newPopulation;

        // Calculate and print the best fitness of the current generation
        const maxFitness = Math.max(...fitnesses);
        console.log(`Generation ${generation} Best Fitness: ${maxFitness}`);

        // Increase mutation rate if diversity is low
        const uniqueLineups = new Set(population.map(lineup => lineup.map(player => player.player_id).sort().join(',')));
        if (uniqueLineups.size < POPULATION_SIZE * 0.8) {
            MUTATION_RATE = Math.min(MUTATION_RATE + 0.01, 0.5);
        } else {
            MUTATION_RATE = 0.1;
        }
    }

    const finalFitnesses = population.map(calculateFitness);
    const bestLineups = population
        .map((lineup, index) => ({ lineup, fitness: finalFitnesses[index] }))
        .sort((a, b) => b.fitness - a.fitness)
        .slice(0, 20);

    return bestLineups;
}

geneticAlgorithm().then(bestLineups => {
    console.log('Best Lineups:');
    bestLineups.forEach((entry, index) => {
        console.log(`Lineup ${index + 1} (Fitness: ${entry.fitness})`);
        console.log(entry.lineup);
    });
});
