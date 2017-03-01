import path from 'path';

export const hidePathString = (filePath) => {
  const folders = filePath.split(path.sep);
  const basename = path.basename(filePath);

  if(filePath.length > 70){
    const shlen = 67 - basename.length;
    return filePath.slice(0, shlen) + '...' + basename;
  }

  return filePath;

}