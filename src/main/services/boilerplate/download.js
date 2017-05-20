import download from 'download';

export default (url, folder) => download(url, folder,
  {
    extract: true,
    retries: 0,
    timeout: 10000
  });
