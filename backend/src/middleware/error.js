export function errorHandler(err, _req, res, _next) {
  const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 413 : 500);
  const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (10 MB max).' : status < 500 ? err.message : 'Something went wrong on the server.';
  if (status >= 500) console.error(err.message);
  res.status(status).json({ error: msg });
}
