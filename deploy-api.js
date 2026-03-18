/**
 * Deploy the Mobile App API to production server
 *
 * Uploads api/index.php to public_html/cultural-heritage/app-api/index.php
 */
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const LOCAL_FILE = path.join(__dirname, 'api', 'index.php');
const REMOTE_DIR = 'public_html/cultural-heritage/app-api';
const REMOTE_FILE = REMOTE_DIR + '/index.php';
const HTACCESS_FILE = REMOTE_DIR + '/.htaccess';

const HTACCESS_CONTENT = `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.*)$ index.php [QSA,L]

# CORS headers
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type"
</IfModule>
`;

const conn = new Client();

function mkdirRecursive(sftp, dirPath, callback) {
  const parts = dirPath.split('/');
  let current = '';
  let i = 0;
  function next() {
    if (i >= parts.length) { callback(); return; }
    current += (current ? '/' : '') + parts[i++];
    sftp.mkdir(current, () => next());
  }
  next();
}

conn.on('ready', () => {
  console.log('Connected to twinfusion.co.ke');
  conn.sftp((err, sftp) => {
    if (err) { console.error(err); conn.end(); return; }

    console.log('Creating directory:', REMOTE_DIR);
    mkdirRecursive(sftp, REMOTE_DIR, () => {

      console.log('Uploading API:', LOCAL_FILE, '->', REMOTE_FILE);
      sftp.fastPut(LOCAL_FILE, REMOTE_FILE, (err) => {
        if (err) {
          console.error('Upload failed:', err.message);
          conn.end();
          return;
        }
        console.log('API uploaded successfully!');

        // Upload .htaccess
        const htaccessLocal = path.join(__dirname, '.htaccess-api-temp');
        fs.writeFileSync(htaccessLocal, HTACCESS_CONTENT);

        sftp.fastPut(htaccessLocal, HTACCESS_FILE, (err2) => {
          if (err2) console.error('.htaccess upload failed:', err2.message);
          else console.log('.htaccess uploaded');

          fs.unlinkSync(htaccessLocal);

          console.log('\n=== API deployed! ===');
          console.log('URL: https://twinfusion.co.ke/cultural-heritage/app-api/?action=config');
          conn.end();
        });
      });
    });
  });
}).on('error', (err) => console.error('Connection error:', err.message))
.connect({
  host: 'twinfusion.co.ke',
  port: 22,
  username: 'twinfusion',
  password: 'Qwerty@515253#786',
  readyTimeout: 30000
});
