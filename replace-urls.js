const fs = require('fs');
const path = require('path');

function findAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'replace-urls.js') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            findAndReplace(fullPath);
        } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Regex to find hardcoded urls inside quotes or backticks
            const regex = /(["'`])(http:\/\/(?:127\.0\.0\.1|localhost):8000)(\/api)?/g;
            
            // We want to replace it with template literal if it's inside quotes, 
            // but it's safer to just replace the literal string with the variable.
            // A simple string replace for all occurrences:
            
            if (content.includes('http://127.0.0.1:8000/api') || content.includes('http://localhost:8000/api')) {
                // Since it might be inside single quotes, double quotes, or backticks:
                // Let's replace 'http://127.0.0.1:8000/api' with `${process.env.NEXT_PUBLIC_API_URL}`
                // but we need to ensure the surrounding quotes are backticks.
                // It's easier to replace the exact strings.
                
                content = content.replace(/['"]http:\/\/(?:127\.0\.0\.1|localhost):8000\/api(.*?)['"]/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');
                content = content.replace(/`http:\/\/(?:127\.0\.0\.1|localhost):8000\/api(.*?)`/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');
                
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated:', fullPath);
            } else if (content.includes('http://127.0.0.1:8000') || content.includes('http://localhost:8000')) {
                 content = content.replace(/['"]http:\/\/(?:127\.0\.0\.1|localhost):8000(.*?)['"]/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');
                 content = content.replace(/`http:\/\/(?:127\.0\.0\.1|localhost):8000(.*?)`/g, '`${process.env.NEXT_PUBLIC_API_URL}$1`');
                 
                 fs.writeFileSync(fullPath, content, 'utf8');
                 console.log('Updated:', fullPath);
            }
        }
    }
}

findAndReplace(__dirname);
console.log('Done!');
