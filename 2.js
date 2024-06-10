const fs = require('fs');
const csv = require('csv-parser');
const _ = require('lodash');

const POPULATION_SIZE = 100;
const MAX_GENERATIONS = 1000;
const SALARY_CAP = 50000;

// Read CSV file
function readCSV(file) {
    return new Promise((resolve, reject) => {
        const players = [];
        fs.createReadStream(file)
            .pipe(csv())
            .on('data', (data) => players.push(data))
            .on('end', () => resolve(players))
            .on('error', (error) => reject(error));
    });
}

// Initialize population
function initializePopulation(players) {
    const population = [];
    for (let i = 0; i < POPULATION_SIZE; i++) {
        population.push(_.sampleSize(players, 10));
    }
    return population;
}

// Calculate fitness
function calculateFitness(lineup) {
    const totalSalary = lineup.reduce((sum, player) => sum + parseInt(player.salary, 10), 0);
    if (totalSalary > SALARY_CAP) return 0;
    const totalProjOwn = lineup.reduce((sum, player) => sum + parseFloat(player.proj_own), 0);
    return totalProjOwn;
}

// Selection
function selection(population) {
    return _.sortBy(population, (lineup) => -calculateFitness(lineup)).slice(0, POPULATION_SIZE / 2);
}

// Crossover
function crossover(parents) {
    const offspring = [];
    for (let i = 0; i < parents.length; i += 2) {
        const parent1 = parents[i];
        const parent2 = parents[i + 1] || parents[0];
        const crossoverPoint = _.random(1, parent1.length - 1);
        const child1 = parent1.slice(0, crossoverPoint).concat(parent2.slice(crossoverPoint));
        const child2 = parent2.slice(0, crossoverPoint).concat(parent1.slice(crossoverPoint));
        offspring.push(child1, child2);
    }
    return offspring;
}

// Mutation
function mutate(lineup, players) {
    const mutationRate = 0.1;
    return lineup.map(player => (Math.random() < mutationRate ? _.sample(players) : player));
}

// Genetic Algorithm
async function geneticAlgorithm(file) {
    const players = await readCSV(file);
    let population = initializePopulation(players);

    for (let generation = 0; generation < MAX_GENERATIONS; generation++) {
        const selected = selection(population);
        let offspring = crossover(selected);
        offspring = offspring.map(lineup => mutate(lineup, players));
        population = selected.concat(offspring);
        const bestLineup = _.maxBy(population, calculateFitness);
        console.log(`Generation ${generation}: Best Fitness = ${calculateFitness(bestLineup)}`);
    }

    const bestLineup = _.maxBy(population, calculateFitness);
    console.log('Best Lineup:', bestLineup);
}

geneticAlgorithm('players.csv');
