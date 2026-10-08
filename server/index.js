const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Health check & embedded OS info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'ATM-OS Embedded Kernel',
    device: 'ATM-01 (NCR Real-Time Embedded Unit)',
    version: '2.4.1-RT',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 2. Accounts API
app.get('/api/accounts', (req, res) => {
  try {
    const accounts = db.prepare('SELECT account_no, holder_name, balance, card_type FROM accounts').all();
    res.json({ success: true, accounts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Transactions & Logging API
app.get('/api/transactions', (req, res) => {
  try {
    const transactions = db.prepare('SELECT * FROM transactions ORDER BY id DESC LIMIT 50').all();
    const logs = db.prepare('SELECT * FROM transaction_logs ORDER BY rowid DESC LIMIT 50').all();
    res.json({ success: true, transactions, logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Record new transaction with Indexed Allocation
app.post('/api/transactions', (req, res) => {
  const { pid, account_no, type, amount, status = 'SUCCESS', log_details } = req.body;
  if (!pid || !account_no || !type) {
    return res.status(400).json({ success: false, error: 'Missing required transaction fields' });
  }

  try {
    // Generate next TXN ID
    const countRow = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
    const txnNumber = String(countRow.count + 42).padStart(5, '0');
    const txn_id = `TXN-${txnNumber}`;

    // Manage indexed allocation
    let indexed = db.prepare('SELECT * FROM indexed_allocations WHERE account_no = ?').get(account_no);
    let index_block = 'I-07';
    let data_blocks = [];

    if (!indexed) {
      // Allocate new index block
      const existingIndexed = db.prepare('SELECT COUNT(*) as count FROM indexed_allocations').get();
      index_block = `I-${String(existingIndexed.count + 8).padStart(2, '0')}`;
      data_blocks = [`B${Math.floor(Math.random() * 40 + 10)}`];
      db.prepare(`
        INSERT INTO indexed_allocations (account_no, index_block, data_blocks_json)
        VALUES (?, ?, ?)
      `).run(account_no, index_block, JSON.stringify(data_blocks));
    } else {
      index_block = indexed.index_block;
      data_blocks = JSON.parse(indexed.data_blocks_json);
      // Allocate next data block
      const nextBlockId = `B${Math.floor(Math.random() * 50 + 10)}`;
      data_blocks.push(nextBlockId);
      db.prepare(`
        UPDATE indexed_allocations SET data_blocks_json = ? WHERE account_no = ?
      `).run(JSON.stringify(data_blocks), account_no);
    }

    const current_data_block = data_blocks[data_blocks.length - 1];

    // Format current timestamp
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const dateStr = `${String(now.getDate()).padStart(2, '0')} OCT ${timeStr}`;

    // Insert transaction
    db.prepare(`
      INSERT INTO transactions (txn_id, pid, account_no, type, amount, status, timestamp, index_block, data_block)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(txn_id, pid, account_no, type, Number(amount) || 0, status, dateStr, index_block, current_data_block);

    // Insert log
    db.prepare(`
      INSERT INTO transaction_logs (txn_id, pid, account_no, type, amount, status, timestamp, log_details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(txn_id, pid, account_no, type, Number(amount) || 0, status, timeStr, log_details || `Dispensed/Updated balance. Memory released.`);

    // Update account balance
    if (type === 'WITHDRAWAL') {
      db.prepare('UPDATE accounts SET balance = balance - ? WHERE account_no = ?').run(Number(amount) || 0, account_no);
    } else if (type === 'DEPOSIT') {
      db.prepare('UPDATE accounts SET balance = balance + ? WHERE account_no = ?').run(Number(amount) || 0, account_no);
    }

    res.json({
      success: true,
      transaction: {
        txn_id,
        pid,
        account_no,
        type,
        amount: Number(amount) || 0,
        status,
        timestamp: dateStr,
        index_block,
        data_block: current_data_block
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Mini statement retrieval via Indexed Allocation
app.get('/api/accounts/:accountNo/mini-statement', (req, res) => {
  const { accountNo } = req.params;

  try {
    const account = db.prepare('SELECT account_no, holder_name, balance, card_type FROM accounts WHERE account_no = ?').get(accountNo);
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    const indexed = db.prepare('SELECT * FROM indexed_allocations WHERE account_no = ?').get(accountNo);
    const index_block = indexed ? indexed.index_block : 'I-01';
    const data_blocks = indexed ? JSON.parse(indexed.data_blocks_json) : [];

    const transactions = db.prepare(`
      SELECT txn_id, pid, account_no, type, amount, status, timestamp, data_block
      FROM transactions
      WHERE account_no = ?
      ORDER BY id DESC
      LIMIT 10
    `).all(accountNo);

    res.json({
      success: true,
      account,
      index_block,
      data_blocks,
      transactions,
      lookup_path: {
        root: 'ACCOUNT_INDEX_DIRECTORY',
        account: accountNo,
        index_pointer: index_block,
        allocated_data_blocks: data_blocks,
        retrieved_records: transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Operator Profile & Gamification
app.get('/api/operator', (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM operator_profile WHERE id = 1').get();
    if (profile) {
      profile.achievements = JSON.parse(profile.achievements_json || '[]');
      profile.missions_completed = JSON.parse(profile.missions_completed_json || '[]');
    }
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/operator/progress', (req, res) => {
  const { xp_gain, system_health, achievement_id, mission_id } = req.body;
  try {
    let profile = db.prepare('SELECT * FROM operator_profile WHERE id = 1').get();
    let currentXp = (profile.xp || 0) + (Number(xp_gain) || 0);

    // Levels mapping
    const levels = [
      { lvl: 1, title: 'TRANSACTION OPERATOR', minXp: 0 },
      { lvl: 2, title: 'PROCESS MANAGER', minXp: 200 },
      { lvl: 3, title: 'SCHEDULING OPERATOR', minXp: 500 },
      { lvl: 4, title: 'RESOURCE CONTROLLER', minXp: 800 },
      { lvl: 5, title: 'MEMORY MANAGER', minXp: 1100 },
      { lvl: 6, title: 'FILE SYSTEM OPERATOR', minXp: 1400 },
      { lvl: 7, title: 'ATM KERNEL ENGINEER', minXp: 1800 },
    ];

    let currentLevel = 1;
    let levelTitle = 'TRANSACTION OPERATOR';
    for (const l of levels) {
      if (currentXp >= l.minXp) {
        currentLevel = l.lvl;
        levelTitle = l.title;
      }
    }

    let achievements = JSON.parse(profile.achievements_json || '[]');
    if (achievement_id && !achievements.includes(achievement_id)) {
      achievements.push(achievement_id);
    }

    let missions = JSON.parse(profile.missions_completed_json || '[]');
    if (mission_id && !missions.includes(mission_id)) {
      missions.push(mission_id);
    }

    const health = system_health !== undefined ? Math.min(100, Math.max(0, system_health)) : profile.system_health;

    db.prepare(`
      UPDATE operator_profile
      SET xp = ?, level = ?, level_title = ?, system_health = ?, achievements_json = ?, missions_completed_json = ?
      WHERE id = 1
    `).run(currentXp, currentLevel, levelTitle, health, JSON.stringify(achievements), JSON.stringify(missions));

    res.json({
      success: true,
      profile: {
        xp: currentXp,
        level: currentLevel,
        level_title: levelTitle,
        system_health: health,
        achievements,
        missions_completed: missions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Reset simulation state
app.post('/api/reset', (req, res) => {
  try {
    db.prepare('DELETE FROM transactions WHERE id > 4').run();
    db.prepare(`
      UPDATE accounts SET balance = 45000 WHERE account_no = '****4821';
      UPDATE accounts SET balance = 18500 WHERE account_no = '****1934';
      UPDATE accounts SET balance = 82000 WHERE account_no = '****7712';
      UPDATE accounts SET balance = 12300 WHERE account_no = '****5520';
      UPDATE accounts SET balance = 29800 WHERE account_no = '****3389';
    `).run();
    res.json({ success: true, message: 'Database reset to default benchmark state' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[ATM-OS] Embedded Kernel Server listening on port ${PORT}`);
});
