const { exec } = require('child_process');

exec('php artisan serve --host=0.0.0.0 --port=8000', (err, stdout, stderr) => {
  if (err) {
    console.error(`exec error: ${err}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});
