const fs = require('fs');
const csv = require('csv-parser');
const NodeCache = require( "node-cache" );

const LINEUPS_TO_GENERATE = 10;
const lineupCache = new NodeCache();

const players = {
  "C": [],
  "1B": [],
  "2B": [],
  "3B": [],
  "SS": [],
  "OF": [],
  "P": [],
  "UTIL": [],
};
const lineups = [];
const positions = ["P", "C", "1B", "2B", "3B", "SS", "OF", "OF", "OF", "UTIL"];

const exclude = ["10007006", "10008463"];
const include = ["10002148", "10005910"];
const includePlayers = {
  "C": [],
  "1B": [],
  "2B": [],
  "3B": [],
  "SS": [],
  "OF": [],
  "P": [],
  "UTIL": [],
};

const randomIndex = (n) => {
  return parseInt(Math.random() * n);
}

const main = () => {
  fs.createReadStream('players.csv')
  .pipe(csv())
  .on('data', (row) => {
    let { team, pos, player_id, proj_own, salary, name } = row;
    if (pos === "SP" || pos === "RP") pos = "P";
    if (pos === "LF" || pos === "CF" || pos === "RF") pos = "OF";
    const player = {
      name,
      team,
      player_id,
      proj_own: parseFloat(proj_own),
      salary: parseInt(salary)
    };
    const positions = pos.split("/");
    positions.forEach(pos => players[pos].push(player));
    if (include.includes(player_id)) {
      positions.forEach(pos => includePlayers[pos].push(player));
    }
    players["UTIL"].push(player);
  })
  .on('end', () => {
    const lineups = generate();
    console.log(lineups);
  });
}

const generateLineup = () => {
  const lineup = [];
  const _includePlayers = JSON.parse(JSON.stringify(includePlayers));
  positions.forEach(position => {
    while(true) {
      if (_includePlayers[position].length) {
        const rand = randomIndex(_includePlayers[position].length);
        lineup.push(_includePlayers[position][rand]);
        _includePlayers[position].splice(rand, 1);
        break;
      } else {
        const rand = randomIndex(players[position].length);
        if (!exclude.includes(players[position][rand].player_id)) {
          lineup.push(players[position][rand]);
          break;
        }
      }
    }
  })
  return lineup;
}

const mateLineups = (lineup1, lineup2) => {
  const lineup3 = [];
  positions.forEach((position, idx) => {
    while(true) {
      let player = null;
      if (include.includes(lineup1[idx].player_id)) {
        player = lineup1[idx];
      } else if (include.includes(lineup2[idx].player_id)) {
        player = lineup2[idx];
      } else {
        const rand = Math.random();
        if (rand < .45) {
          player = lineup1[idx];
        } else if (rand < .9) {
          player = lineup2[idx];
        } else {
          player = players[position][randomIndex(players[position].length)];
        }
      }
      if (!exclude.includes(player.player_id)) {
        lineup3.push(player);
        break;
      }
    }
  });
  return lineup3;
}

const validLineup = (lineup) => {
  let point = 0;
  const salary = lineup.reduce((s, c) => s + c.salary, 0);
  const teams = new Set(lineup.map(p => p.team));
  const players = new Set(lineup.map(p => p.player_id));
  if (salary < 50000) point++;
  if (teams.size > 2) point++;
  if (players.size === 10) point++;
  include.forEach(p => {
    if (lineup.find(player => player.player_id ===p))
      point++;
  });
  return point;
}

const compareLineup = (l1, l2) => {
  const p1 = validLineup(l1);
  const p2 = validLineup(l2);
  if (p1 > p2) return -1;
  if (p1 < p2) return 1;
  const rating1 = l1.reduce((s, c) => s + c.proj_own, 0);
  const rating2 = l2.reduce((s, c) => s + c.proj_own, 0);
  if (rating1 > rating2) return -1;
  if (rating1 < rating2) return 1;
  return 0;
}

const sortLineups = () => {
  lineups.sort(compareLineup);
}

const generate = () => {
  const date = new Date().toLocaleDateString();
  const key = `${date}-${exclude.join(",")}-${include.join(",")}`;
  const cachedResult = lineupCache.get(key);
  if (cachedResult) {
    return cachedResult.slice(0, LINEUPS_TO_GENERATE);
  }

  for (let i = 0; i < 150; i++) {
    const lineup = generateLineup();
    lineups.push(lineup);
  }
  for (let i = 0; i < 20000; i++) {
    sortLineups();
    for (let j = 0; j < 150; j++) {
      const lineup1 = lineups[randomIndex(150)];
      const lineup2 = lineups[randomIndex(150)];
      mateLineups(lineup1, lineup2);
    }
  }

  sortLineups();
  const formatted = [];
  for (let i = 0; i < 150; i++) {
    formatted.push({
      "P": lineups[i][0],
      "C": lineups[i][1],
      "1B": lineups[i][2],
      "2B": lineups[i][3],
      "3B": lineups[i][4],
      "SS": lineups[i][5],
      "OF1": lineups[i][6],
      "OF2": lineups[i][7],
      "OF3": lineups[i][8],
      "UTIL": lineups[i][9],
    });
  }
  lineupCache.set(key, formatted);
  return formatted.slice(0, LINEUPS_TO_GENERATE);
}

main();