const fs = require('fs');
const path = require('path');

const stepsDetailsPath = path.join(__dirname, 'steps_details.json');
const jobsScreenPath = path.join(__dirname, '..', 'frontend', 'src', 'screens', 'JobsScreen.js');

if (!fs.existsSync(stepsDetailsPath)) {
  console.error('steps_details.json not found!');
  process.exit(1);
}

if (!fs.existsSync(jobsScreenPath)) {
  console.error('JobsScreen.js not found!');
  process.exit(1);
}

const steps = JSON.parse(fs.readFileSync(stepsDetailsPath, 'utf8'));
let content = fs.readFileSync(jobsScreenPath, 'utf8');

console.log('Original content length:', content.length);

function cleanString(str) {
  if (typeof str !== 'string') return str;
  // If it starts and ends with quotes, parse it as JSON to resolve escapes
  if (str.startsWith('"') && str.endsWith('"')) {
    try {
      return JSON.parse(str);
    } catch (e) {
      // Fallback: manually strip outer quotes and unescape
      return str.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
  }
  return str;
}

let allOk = true;

for (const step of steps) {
  let target = cleanString(step.args.TargetContent);
  let replacement = cleanString(step.args.ReplacementContent);

  // For step 634, if target was truncated, we have to handle it or reconstruct it.
  if (target.includes('<truncated') || replacement.includes('<truncated')) {
    console.log(`Skipping step ${step.step_index} because it contains truncated data. We will handle it separately.`);
    continue;
  }

  // Normalize line endings to LF to avoid CRLF mismatch during matching
  const normalizedContent = content.replace(/\r\n/g, '\n');
  const normalizedTarget = target.replace(/\r\n/g, '\n');
  const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

  if (normalizedContent.includes(normalizedTarget)) {
    content = normalizedContent.replace(normalizedTarget, normalizedReplacement);
    console.log(`Step ${step.step_index} applied successfully!`);
  } else {
    console.warn(`Step ${step.step_index} FAILED: target not found!`);
    console.log('Target was:');
    console.log(JSON.stringify(normalizedTarget.substring(0, 100)));
    allOk = false;
  }
}

if (allOk) {
  fs.writeFileSync(jobsScreenPath, content, 'utf8');
  console.log('JobsScreen.js updated successfully!');
} else {
  console.log('Not writing to file due to errors.');
}
