const fs = require('fs');

let file = fs.readFileSync('src/pages/public/worldCupData.ts', 'utf8');

const replacements = [
  { match: "team1: 'Mexico', team2: 'South Africa'", replace: "team1: 'Mexico', team2: 'South Africa', score1: 2, score2: 0" },
  { match: "team1: 'South Korea', team2: 'Czechia'", replace: "team1: 'South Korea', team2: 'Czechia', score1: 2, score2: 1" },
  { match: "team1: 'Canada', team2: 'Bosnia & Herzegovina'", replace: "team1: 'Canada', team2: 'Bosnia & Herzegovina', score1: 1, score2: 1" },
  { match: "team1: 'USA', team2: 'Paraguay'", replace: "team1: 'USA', team2: 'Paraguay', score1: 4, score2: 1" },
  { match: "team1: 'Qatar', team2: 'Switzerland'", replace: "team1: 'Qatar', team2: 'Switzerland', score1: 1, score2: 1" },
  { match: "team1: 'Brazil', team2: 'Morocco'", replace: "team1: 'Brazil', team2: 'Morocco', score1: 1, score2: 1" },
  { match: "team1: 'Haiti', team2: 'Scotland'", replace: "team1: 'Haiti', team2: 'Scotland', score1: 0, score2: 1" },
  { match: "team1: 'Australia', team2: 'Turkey'", replace: "team1: 'Australia', team2: 'Turkey', score1: 2, score2: 0" },
  { match: "team1: 'Germany', team2: 'Curacao'", replace: "team1: 'Germany', team2: 'Curacao', score1: 7, score2: 1" },
  { match: "team1: 'Netherlands', team2: 'Japan'", replace: "team1: 'Netherlands', team2: 'Japan', score1: 2, score2: 2" },
  { match: "team1: 'Ivory Coast', team2: 'Ecuador'", replace: "team1: 'Ivory Coast', team2: 'Ecuador', score1: 1, score2: 0" },
  { match: "team1: 'Sweden', team2: 'Tunisia'", replace: "team1: 'Sweden', team2: 'Tunisia', score1: 5, score2: 1" },
];

for(const r of replacements) {
    file = file.replace(r.match, r.replace);
}

// Add types to WCMatch interface
file = file.replace("team2Code: string;", "team2Code: string;\n  score1?: number;\n  score2?: number;");

// Also add to WORLD_CUP_MATCHES mapping
file = file.replace("time: tpl.time,", "time: tpl.time,\n    score1: (tpl as any).score1,\n    score2: (tpl as any).score2,");

// Also modify getMatchLiveStatus
// It has: "status: 'finished', \nscore1: 0,\nscore2: 0,\nisPast: true,"
// We will change `score1: 0, score2: 0,` to `score1: match.score1 || 0, score2: match.score2 || 0,` in all returns
file = file.replace(/score1: 0,\s*score2: 0/g, "score1: match.score1 ?? 0,\n      score2: match.score2 ?? 0");

fs.writeFileSync('src/pages/public/worldCupData.ts', file);
