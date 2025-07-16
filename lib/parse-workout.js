import fs from 'fs';
import path from 'path';

/**
 * Parses an exercise name string to separate the name from parenthetical details.
 * @param {string} rawName - The raw string from the workout plan.
 * @returns {{name: string, details: string|null}} - An object with the cleaned name and details.
 */
export function parseExerciseName(rawName) {
    const cleaned = rawName.replace(/^-/, '').trim();
    const detailsMatch = cleaned.match(/\(([^)]+)\)/);
    const details = detailsMatch ? detailsMatch[1].trim() : null;
    const name = cleaned.replace(/\s*\([^)]+\)/, '').trim();

    return { name, details };
}

/**
 * Parses workout blocks that are formatted as a clear, multi-column table.
 * @param {string} block - A string containing the workout day's table.
 * @returns {Array<Object>} - An array of parsed workout day objects.
 */
export function parseTableFormat(block) {
    const workouts = [];
    const lines = block.trim().split('\n').filter(line => line.trim().startsWith('"'));

    let currentWorkout = null;
    let weekHeaders = [];

    // Regex to safely parse a CSV-like row with quoted cells
    const rowRegex = /"(.*?)"/gs;

    for (const line of lines) {
        // Extract all cell contents from the current row
        const cells = Array.from(line.matchAll(rowRegex), m => m[1].replace(/\n/g, ' ').trim());
        if (cells.length === 0) continue;

        const firstCell = cells[0];
        const isDayTitle = /^(Treino \d+-|Segunda Feira-|Terça Feira-|Quarta Feira-|Sexta Feira-|Sábado-)/.test(firstCell);

        if (isDayTitle) {
            // This line defines a new workout day and the table headers.
            if (currentWorkout) {
                workouts.push(currentWorkout);
            }

            // Extract week keys (e.g., 1e5, 2e6) from header cells
            weekHeaders = cells.slice(1).map(h => h.replace(/Semana\s*/, '').trim());
            currentWorkout = {
                day: firstCell,
                exercises: [],
            };
        } else if (currentWorkout && firstCell.startsWith('-')) {
            // This is an exercise row
            const { name, details } = parseExerciseName(firstCell);
            const exercise = {
                name,
                details,
                weeks: {},
            };

            const weekData = cells.slice(1);
            weekHeaders.forEach((weekKey, index) => {
                if (weekData[index] && weekData[index].trim()) {
                    exercise.weeks[weekKey] = weekData[index].trim();
                }
            });
            currentWorkout.exercises.push(exercise);
        }
    }

    if (currentWorkout) {
        workouts.push(currentWorkout);
    }

    return workouts;
}

/**
 * Parses workout blocks from a less structured, line-by-line format.
 * @param {string} block - A string containing the workout day's information.
 * @returns {Object|null} - A single parsed workout day object.
 */
export function parseLineByLineFormat(block) {
    const lines = block.trim().split('\n');
    const day = lines.shift() || 'Untitled';
    const content = lines.join('\n');

    // Split the entire block by lines that start with a hyphen (indicating a new exercise)
    const exerciseChunks = content.split(/\n\s*-(?=[A-ZÁ-Ú])/).filter(c => c.trim());

    const workout = {
        day: day.trim(),
        exercises: [],
    };
    
    // The first chunk might not start with a hyphen if it's the very first exercise
    const firstExerciseMatch = content.match(/^-([A-ZÁ-Ú][\s\S]*)/);
    if(firstExerciseMatch) {
        const fullFirstExercise = firstExerciseMatch[1];
        const initialSplit = fullFirstExercise.split(/\n\s*-(?=[A-ZÁ-Ú])/);
        exerciseChunks.unshift(initialSplit.shift());
    }


    for (let chunk of exerciseChunks) {
        chunk = chunk.trim();
        const chunkLines = chunk.split('\n');
        const rawName = chunkLines.shift() || '';
        const { name, details } = parseExerciseName(rawName);

        const exercise = {
            name,
            details,
            weeks: {},
        };

        const weekDataStr = chunkLines.join('\n');
        // Split the remaining text by "Semana X e Y" to isolate instructions for each period
        const weekInstructions = weekDataStr.split(/(?=Semana\s+\d+e\d+)/).filter(s => s.trim());

        for (const inst of weekInstructions) {
            const lines = inst.trim().split('\n');
            const header = lines.shift() || '';
            const weekKeyMatch = header.match(/Semana\s+(\d+e\d+)/);
            if (weekKeyMatch) {
                const weekKey = weekKeyMatch[1];
                const instructionText = [header.replace(/Semana\s+\d+e\d+/, '').trim(), ...lines].join(' ').trim();
                exercise.weeks[weekKey] = instructionText.replace(/\s+/g, ' ');
            }
        }
        
        if (Object.keys(exercise.weeks).length > 0) {
            workout.exercises.push(exercise);
        }
    }

    return workout.exercises.length > 0 ? workout : null;
}


/**
 * Main function to parse the entire text content of a workout file.
 * @param {string} text - The full text content from a workout file.
 */
export function processFileContent(text) {
    const workouts = [];

    // Use a positive lookahead to split the text by day titles while keeping them
    const daySeparatorRegex = /(?=\n(?:Treino \d+-|Segunda Feira-|Terça Feira-|Quarta Feira-|Sexta Feira-|Sábado-))/;
    const blocks = text.split(daySeparatorRegex).filter(b => b.trim());

    for (const block of blocks) {
        // Detect format and use the appropriate parser
        if (block.includes("The following table:")) {
            workouts.push(...parseTableFormat(block));
        } else {
            const parsedBlock = parseLineByLineFormat(block);
            if (parsedBlock) {
                workouts.push(parsedBlock);
            }
        }
    }
    return workouts;
}

// --- Script Execution ---
if (process.argv && process.argv[1] && path.basename(process.argv[1]) === path.basename(import.meta.url)) {
    const inputFile = process.argv[2];
    if (!inputFile) {
        console.error("Please provide the input text file as an argument.");
        console.error("Usage: node parse-workout.js <filename>");
        process.exit(1);
    }

    const output_file = `${path.parse(inputFile).name}.json`;
    const textContent = fs.readFileSync(inputFile, 'utf-8');

    try {
        const jsonData = processFileContent(textContent);
        fs.writeFileSync(output_file, JSON.stringify(jsonData, null, 2));
        console.log(`Successfully parsed ${inputFile} -> ${output_file}`);
    } catch (error) {
        console.error(`An error occurred while parsing ${inputFile}:`, error);
    }
}