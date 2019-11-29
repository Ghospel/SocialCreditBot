const HOTWORDS = ["Mark Rutte", "Mark", "Rutte"];
export let toBeDecided = [];
export let minCreditFilter = [];
export let plusCreditFilter = [];
let deletedTBD = [];
const MINCOMMAND = '/min';
const BOEIECOMMAND = '/boeie';
const PLUSCOMMAND = '/plus';

export function checkFilters(msg) {
    HOTWORDS.forEach(string => {
        if (msg.text) {
          const correctedString = string.toLowerCase();
          const correctedMsg = msg.text.toString().toLowerCase();
          const matchHotWords = correctedMsg.includes(correctedString);
          if (matchHotWords) {
            if(!toBeDecided.includes(correctedMsg)){
              toBeDecided.push(correctedMsg);
            }
          }
        }
    });
}

export function pushToFilter(msg) {
    const TEXT = msg.text;
    if (TEXT === MINCOMMAND) {
        minCreditFilter.push(toBeDecided[0]);
        toBeDecided.splice(0, 1);
    } else if (TEXT === PLUSCOMMAND) {
        plusCreditFilter.push(toBeDecided[0]);
        toBeDecided.splice(0, 1);
    } else if (TEXT === BOEIECOMMAND) {
        deletedTBD.push(toBeDecided[0]);
        toBeDecided.splice(0, 1);
    }
}