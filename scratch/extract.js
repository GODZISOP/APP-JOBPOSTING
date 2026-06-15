const fs = require('fs');
const path = require('path');

const logPath = 'C:/Users/shabb/.gemini/antigravity-ide/brain/9efbfcd2-a009-4d7d-a0dd-f38eb4c7e1fb/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');

const steps = [620, 634, 648, 654, 658, 664, 680, 682, 684];
const result = [];

for (const l of lines) {
  if (!l) continue;
  const obj = JSON.parse(l);
  if (steps.includes(obj.step_index) && obj.tool_calls) {
    for (const tc of obj.tool_calls) {
      if (tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
        result.push({
          step_index: obj.step_index,
          name: tc.name,
          args: tc.args || tc.arguments
        });
      }
    }
  }
}

fs.writeFileSync(path.join(__dirname, 'steps_details.json'), JSON.stringify(result, null, 2), 'utf8');
console.log('Extracted step details successfully!');
