const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/jitsu/Desktop/Myeca7.3/client/src/pages/calculators';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const colorDefaults = {
  'advance-tax.page.tsx': 'blue',
  'capital-gains.page.tsx': 'green',
  'car-loan.page.tsx': 'blue',
  'education-loan.page.tsx': 'blue',
  'emi.page.tsx': 'purple',
  'fd-enhanced.page.tsx': 'green',
  'fd.page.tsx': 'blue',
  'general.page.tsx': 'slate',
  'home-loan.page.tsx': 'blue',
  'hra.page.tsx': 'blue',
  'income-tax.page.tsx': 'blue',
  'nps.page.tsx': 'purple',
  'personal-loan.page.tsx': 'blue',
  'ppf.page.tsx': 'green',
  'regime-comparator.page.tsx': 'blue',
  'sip-enhanced.page.tsx': 'blue',
  'sip.page.tsx': 'blue',
  'tax-regime.page.tsx': 'blue',
  'tds.page.tsx': 'purple',
  'withdrawal-planner.page.tsx': 'green'
};

files.forEach(f => {
  let content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes('<Slider')) {
    let color = colorDefaults[f] || 'slate';
    let headerMatch = content.match(/<CalculatorHeader[^>]*color=["']([a-z]+)["']/);
    if (headerMatch) {
      color = headerMatch[1];
    }
    
    // add colorTheme prop
    let newContent = content.replace(/(<Slider\s)(?!.*colorTheme)/g, '$1colorTheme="' + color + '" ');
    if (newContent !== content) {
      fs.writeFileSync(path.join(dir, f), newContent);
      console.log('Updated ' + f + ' with color ' + color);
    }
  }
});
