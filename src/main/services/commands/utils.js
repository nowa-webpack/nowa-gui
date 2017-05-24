import ansiHTML from 'ansi-html';



export const newLog = (oldLog, str) => oldLog + ansiHTML(str.replace(/\n/g, '<br>'));

/*export const getTruePercent = (str) => {
  const a = str.split('INSTALL_PROGRESS');
  const b = a[1].replace(/[\n\s]/g, '');
  const c = b.slice(1, b.length - 1).split(',').map(i => i.split(':'));
  return parseInt(c[1][1] / c[0][1] * 100);
};*/

export const getTruePercent = ({ installTasks, finishedInstallTasks }) => {
  console.log(installTasks, finishedInstallTasks);
  return parseInt(finishedInstallTasks / installTasks * 100);
}

export const getFakePercent = (progress, curper, size) => {
  const truePercent = getTruePercent(progress);
  console.log('truePercent', truePercent)

  // const peak = size * 10 > 80 ? 80 : size * 10;
  const peak = size * 10 > 80 ? 20 : (100 - size * 10);

  let percent = curper;

  if (truePercent < peak && curper < peak) {
    // percent += parseInt(Math.random() * ((100 - peak) / size));
    percent += parseInt(Math.random() * (peak / size));
  } else if (truePercent > peak) {
    percent = truePercent;
  }

  console.log('inner percent', percent);

  return percent > 100 ? 100 : parseInt(percent);
};
 
