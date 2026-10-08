const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'atm_os.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    account_no TEXT PRIMARY KEY,
    holder_name TEXT NOT NULL,
    pin TEXT NOT NULL,
    balance INTEGER NOT NULL,
    card_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    txn_id TEXT UNIQUE NOT NULL,
    pid TEXT NOT NULL,
    account_no TEXT NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    index_block TEXT,
    data_block TEXT
  );

  CREATE TABLE IF NOT EXISTS transaction_logs (
    txn_id TEXT PRIMARY KEY,
    pid TEXT NOT NULL,
    account_no TEXT NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    log_details TEXT
  );

  CREATE TABLE IF NOT EXISTS indexed_allocations (
    account_no TEXT PRIMARY KEY,
    index_block TEXT NOT NULL,
    data_blocks_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS operator_profile (
    id INTEGER PRIMARY KEY,
    xp INTEGER DEFAULT 820,
    level INTEGER DEFAULT 4,
    level_title TEXT DEFAULT 'RESOURCE CONTROLLER',
    system_health INTEGER DEFAULT 91,
    accuracy INTEGER DEFAULT 94,
    efficiency INTEGER DEFAULT 92,
    errors INTEGER DEFAULT 0,
    achievements_json TEXT,
    missions_completed_json TEXT
  );
`);

// Seed default data if accounts table is empty
const accountCount = db.prepare('SELECT COUNT(*) as count FROM accounts').get();
if (accountCount.count === 0) {
  const insertAccount = db.prepare(`
    INSERT INTO accounts (account_no, holder_name, pin, balance, card_type)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertAccount.run('****4821', 'Rohan Sharma (Executive)', '1234', 45000, 'VIP');
  insertAccount.run('****1934', 'Ananya Desai', '4321', 18500, 'REGULAR');
  insertAccount.run('****7712', 'Vikram Joshi (Corporate)', '9876', 82000, 'VIP');
  insertAccount.run('****5520', 'Pooja Mehta', '2468', 12300, 'REGULAR');
  insertAccount.run('****3389', 'Aditya Verma', '1122', 29800, 'REGULAR');

  // Seed default indexed allocation for ****4821
  const insertIndexed = db.prepare(`
    INSERT INTO indexed_allocations (account_no, index_block, data_blocks_json)
    VALUES (?, ?, ?)
  `);
  insertIndexed.run('****4821', 'I-07', JSON.stringify(['B12', 'B19', 'B27', 'B31']));

  // Seed default transactions for ****4821 as specified in prompt section 25
  const insertTxn = db.prepare(`
    INSERT INTO transactions (txn_id, pid, account_no, type, amount, status, timestamp, index_block, data_block)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertTxn.run('TXN-00038', 'P000', '****4821', 'BALANCE', 0, 'SUCCESS', '06 OCT 14:15:20', 'I-07', 'B12');
  insertTxn.run('TXN-00039', 'P001', '****4821', 'WITHDRAWAL', 1500, 'SUCCESS', '07 OCT 11:22:04', 'I-07', 'B19');
  insertTxn.run('TXN-00040', 'P002', '****4821', 'DEPOSIT', 2000, 'SUCCESS', '08 OCT 09:10:45', 'I-07', 'B27');
  insertTxn.run('TXN-00041', 'P004', '****4821', 'WITHDRAWAL', 5000, 'SUCCESS', '08 OCT 10:43:12', 'I-07', 'B31');

  // Seed transaction logs
  const insertLog = db.prepare(`
    INSERT INTO transaction_logs (txn_id, pid, account_no, type, amount, status, timestamp, log_details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertLog.run('TXN-00041', 'P004', '****4821', 'WITHDRAWAL', 5000, 'SUCCESS', '10:43:12', 'Dispensed ₹500x10. Auth: OK. Memory: M2 released. State: SAFE.');
  insertLog.run('TXN-00040', 'P002', '****4821', 'DEPOSIT', 2000, 'SUCCESS', '09:10:45', 'Accepted ₹500x4. Vault counter updated. Memory: M1 released.');
  insertLog.run('TXN-00039', 'P001', '****4821', 'WITHDRAWAL', 1500, 'SUCCESS', '11:22:04', 'Dispensed ₹500x3. Auth: OK. Memory: M3 released.');

  // Seed operator profile
  const insertProfile = db.prepare(`
    INSERT INTO operator_profile (id, xp, level, level_title, system_health, accuracy, efficiency, errors, achievements_json, missions_completed_json)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertProfile.run(
    820,
    4,
    'RESOURCE CONTROLLER',
    91,
    94,
    92,
    0,
    JSON.stringify(['FIRST_PROCESS', 'PCB_INITIALIZED', 'PRIORITY_CONTROLLER', 'FAIR_CPU']),
    JSON.stringify(['M01', 'M02', 'M03'])
  );
}

module.exports = db;
