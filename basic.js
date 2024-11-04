const fs = require('fs');

// Function to decode a Y value based on its base
function decodeYValue(base, value) {
    return parseInt(value, base);
}

// Function to parse the input JSON file
function parseInput(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(data);

    const n = jsonData.keys.n;
    const k = jsonData.keys.k;
    const points = [];
    for (const key in jsonData) {
        if (key !== "keys") {
            const x = parseInt(key);
            const base = parseInt(jsonData[key].base);
            const yEncoded = jsonData[key].value;
            const y = decodeYValue(base, yEncoded);
            points.push({ x, y });
        }
    }
    return { n, k, points };
}

// Function to perform Lagrange interpolation at x = 0
function lagrangeInterpolation(points) {
    let constantTerm = 0;

    for (let i = 0; i < points.length; i++) {
        const { x: x_i, y: y_i } = points[i];
        let term = y_i;

        for (let j = 0; j < points.length; j++) {
            if (i !== j) {
                const { x: x_j } = points[j];
                term *= -x_j / (x_i - x_j);
            }
        }

        constantTerm += term;
    }

    return Math.round(constantTerm);
}

// Helper function to generate all k-combinations of points
function getCombinations(points, k) {
    const combinations = [];
    function generateCombinations(start, selected) {
        if (selected.length === k) {
            combinations.push([...selected]);
            return;
        }
        for (let i = start; i < points.length; i++) {
            selected.push(points[i]);
            generateCombinations(i + 1, selected);
            selected.pop();
        }
    }
    generateCombinations(0, []);
    return combinations;
}

// Function to find all combinations of points that produce the correct constant term
function findCorrectCombinations(points, k, targetConstantTerm) {
    const combinations = getCombinations(points, k);
    const correctCombinations = [];

    for (const combination of combinations) {
        const term = lagrangeInterpolation(combination);
        if (term === targetConstantTerm) {
            correctCombinations.push(combination);
        }
    }
    return correctCombinations;
}

// Main function to solve the problem
function solve(filePath) {
    const { k, points } = parseInput(filePath);

    // Calculate the constant term with the first k points
    const constantTerm = lagrangeInterpolation(points.slice(0, k));
    
    // Find all combinations of points that produce the same constant term
    const correctCombinations = findCorrectCombinations(points, k, constantTerm);

    return { constantTerm, correctCombinations };
}

// Example usage
const result = solve('2.json');
console.log("Constant term for input2:", result.constantTerm);
console.log("Correct combinations for input2:", result.correctCombinations.length);
console.log("Correct points for input2:", result.correctCombinations);