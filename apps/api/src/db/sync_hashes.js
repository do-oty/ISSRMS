import { poolZone2 } from './pool.js';

async function syncHashes() {
  const hashes = [
    { id: 1, hash: '$argon2id$v=19$m=65536,p=4,t=3$eI9Vak/TzOpxpxgPjfc+3g$4rZs2Gr94kaNvlSNoo3SK7qyfD1ChA1DARsIG0OylME' }, // admin123
    { id: 2, hash: '$argon2id$v=19$m=65536,p=4,t=3$tkhYYBM7KAd1DTZZoWC5aQ$GccWz0i4sNslQhrIgSqaky8ORqZemYTtcXNYnueVA/g' }, // reg123
    { id: 3, hash: '$argon2id$v=19$m=65536,p=4,t=3$lE8XlFzTFFaeC7eWyq7MJQ$VOcEpGDc5ZVKKsQuCwDfIGTqpk28OKVajFZr7Ogs4W4' }, // canteen123
    { id: 4, hash: '$argon2id$v=19$m=65536,p=4,t=3$BvQu+1xBJRvQRtnCLkvClg$qW9/1UvHeVkUr4fLBXdqD1S6WqOkpezMcUr88U+ZKo4' }, // library123
    { id: 5, hash: '$argon2id$v=19$m=65536,p=4,t=3$6HzH2E4xJueaEOBocvKhVA$yplYRjYdeLczrNXSpinxORlaLIWOtcx+nv/FjD3LjSY' }, // student123
    { id: 6, hash: '$argon2id$v=19$m=65536,p=4,t=3$6HzH2E4xJueaEOBocvKhVA$yplYRjYdeLczrNXSpinxORlaLIWOtcx+nv/FjD3LjSY' }  // student123
  ];

  for (const item of hashes) {
    await poolZone2.query('UPDATE system_accounts SET password_hash = ? WHERE account_id = ?', [item.hash, item.id]);
  }
  console.log('Argon2id hashes synced in MySQL successfully.');
  process.exit(0);
}

syncHashes().catch(err => {
  console.error(err);
  process.exit(1);
});
