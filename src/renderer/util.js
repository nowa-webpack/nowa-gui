import path from 'path';

export const hidePathString = (filePath, num: 70) => {
  const folders = filePath.split(path.sep);
  const basename = path.basename(filePath);

  if(filePath.length > num){
    const shlen = num - 3 - basename.length;
    return filePath.slice(0, shlen) + '...' + basename;
  }

  return filePath;

}