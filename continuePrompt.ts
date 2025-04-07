import * as readline from 'readline';

export function askToContinue(message: string = "Continue to iterate?"): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(`${message} (y/n): `, (answer) => {
            rl.close();
            const normalizedAnswer = answer.toLowerCase().trim();
            resolve(normalizedAnswer === 'y' || normalizedAnswer === 'yes');
        });
    });
}
