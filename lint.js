const fs = require('fs');
const css = fs.readFileSync('./style.css', 'utf8');

let depth = 0;
let lastDepthChange = 0;
for (let i = 0; i < css.length; i++) {
  if (css[i] === '{') {
    depth++;
    lastDepthChange = i;
  }
  if (css[i] === '}') {
    depth--;
    lastDepthChange = i;
  }
  if (depth < 0) {
    console.log('Negative depth at index: ' + i);
    console.log('Context: ' + css.substring(Math.max(0, i-50), i+50));
    process.exit(1);
  }
}
if (depth !== 0) {
  console.log('Final depth is non-zero: ' + depth);
  console.log('Last depth change near: ' + css.substring(lastDepthChange - 100, lastDepthChange + 50));
} else {
  console.log('Curly braces are perfectly matched!');
}
