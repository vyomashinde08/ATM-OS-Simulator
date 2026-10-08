// Vercel Serverless Function Handler for ATM-OS Embedded Kernel API

const INITIAL_ACCOUNTS = [
  { account_no: '****4821', holder_name: 'Rohan Sharma (Executive)', pin: '1234', balance: 45000, card_type: 'VIP' },
  { account_no: '****1934', holder_name: 'Ananya Desai', pin: '4321', balance: 18500, card_type: 'REGULAR' },
  { account_no: '****7712', holder_name: 'Vikram Joshi (Corporate)', pin: '9876', balance: 82000, card_type: 'VIP' },
  { account_no: '****5520', holder_name: 'Pooja Mehta', pin: '2468', balance: 12300, card_type: 'REGULAR' },
  { account_no: '****3389', holder_name: 'Aditya Verma', pin: '1122', balance: 29800, card_type: 'REGULAR' },
];

let accounts = JSON.parse(JSON.stringify(INITIAL_ACCOUNTS));

let indexedAllocations = {
  '****4821': { indexBlock: 'I-07', dataBlocks: ['B12', 'B19', 'B27', 'B31'] },
  '****1934': { indexBlock: 'I-03', dataBlocks: ['B14', 'B22'] },
  '****7712': { indexBlock: 'I-09', dataBlocks: ['B08', 'B35', 'B44'] },
};

let transactions = [
  { txn_id: 'TXN-00041', pid: 'P004', account_no: '****4821', type: 'WITHDRAWAL', amount: 5000, status: 'SUCCESS', timestamp: '08 OCT 10:43:12', index_block: 'I-07', data_block: 'B31' },
  { txn_id: 'TXN-00040', pid: 'P002', account_no: '****4821', type: 'DEPOSIT', amount: 2000, status: 'SUCCESS', timestamp: '08 OCT 09:10:45', index_block: 'I-07', data_block: 'B27' },
  { txn_id: 'TXN-00039', pid: 'P001', account_no: '****4821', type: 'WITHDRAWAL', amount: 1500, status: 'SUCCESS', timestamp: '07 OCT 11:22:04', index_block: 'I-07', data_block: 'B19' },
  { txn_id: 'TXN-00038', pid: 'P000', account_no: '****4821', type: 'BALANCE', amount: 0, status: 'SUCCESS', timestamp: '06 OCT 14:15:20', index_block: 'I-07', data_block: 'B12' },
];

let transactionLogs = [
  { txn_id: 'TXN-00041', pid: 'P004', account_no: '****4821', type: 'WITHDRAWAL', amount: 5000, status: 'SUCCESS', timestamp: '10:43:12', log_details: 'Dispensed ₹500x10. Memory M2 released.' },
  { txn_id: 'TXN-00040', pid: 'P002', account_no: '****4821', type: 'DEPOSIT', amount: 2000, status: 'SUCCESS', timestamp: '09:10:45', log_details: 'Vault deposit accepted. Memory M1 released.' },
  { txn_id: 'TXN-00039', pid: 'P001', account_no: '****4821', type: 'WITHDRAWAL', amount: 1500, status: 'SUCCESS', timestamp: '11:22:04', log_details: 'Dispensed ₹500x3. Memory M3 released.' },
];

let operatorProfile = {
  id: 1,
  xp: 820,
  level: 4,
  level_title: 'RESOURCE CONTROLLER',
  system_health: 91,
  accuracy: 94,
  efficiency: 92,
  errors: 0,
  achievements: ['FIRST_PROCESS', 'PCB_INITIALIZED', 'PRIORITY_CONTROLLER', 'FAIR_CPU'],
  missions_completed: ['M01', 'M02', 'M03']
};

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  const pathname = url.split('?')[0];

  // 1. Health check
  if (pathname === '/api/health' || pathname === '/api') {
    return res.status(200).json({
      status: 'ONLINE',
      system: 'ATM-OS Embedded Kernel (Vercel Serverless)',
      device: 'ATM-01 (NCR Real-Time Embedded Unit)',
      version: '2.4.1-RT',
      timestamp: new Date().toISOString()
    });
  }

  // 2. Accounts
  if (pathname === '/api/accounts' && req.method === 'GET') {
    return res.status(200).json({ success: true, accounts });
  }

  // 3. Transactions List
  if (pathname === '/api/transactions' && req.method === 'GET') {
    return res.status(200).json({ success: true, transactions, logs: transactionLogs });
  }

  // 4. Create Transaction
  if (pathname === '/api/transactions' && req.method === 'POST') {
    try {
      const body = req.body || {};
      const { pid, account_no, type, amount, status = 'SUCCESS', log_details } = body;
      
      const txnNumber = String(transactions.length + 42).padStart(5, '0');
      const txn_id = `TXN-${txnNumber}`;

      let alloc = indexedAllocations[account_no];
      if (!alloc) {
        alloc = {
          indexBlock: `I-${String(Object.keys(indexedAllocations).length + 8).padStart(2, '0')}`,
          dataBlocks: [`B${Math.floor(Math.random() * 40 + 10)}`]
        };
        indexedAllocations[account_no] = alloc;
      } else {
        const nextBlockId = `B${Math.floor(Math.random() * 50 + 10)}`;
        alloc.dataBlocks.push(nextBlockId);
      }

      const current_data_block = alloc.dataBlocks[alloc.dataBlocks.length - 1];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const dateStr = `${String(now.getDate()).padStart(2, '0')} OCT ${timeStr}`;

      const newTxn = {
        txn_id,
        pid: pid || 'P000',
        account_no: account_no || '****4821',
        type: type || 'WITHDRAWAL',
        amount: Number(amount) || 0,
        status,
        timestamp: dateStr,
        index_block: alloc.indexBlock,
        data_block: current_data_block
      };

      transactions.unshift(newTxn);

      transactionLogs.unshift({
        txn_id,
        pid: newTxn.pid,
        account_no: newTxn.account_no,
        type: newTxn.type,
        amount: newTxn.amount,
        status,
        timestamp: timeStr,
        log_details: log_details || 'Dispensed cash. Memory partition released.'
      });

      // Update account balance
      const acc = accounts.find((a) => a.account_no === account_no);
      if (acc) {
        if (type === 'WITHDRAWAL') acc.balance = Math.max(0, acc.balance - (Number(amount) || 0));
        if (type === 'DEPOSIT') acc.balance += (Number(amount) || 0);
      }

      return res.status(200).json({ success: true, transaction: newTxn });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 5. Mini statement lookup (/api/accounts/:accountNo/mini-statement)
  const miniMatch = pathname.match(/^\/api\/accounts\/([^/]+)\/mini-statement/);
  if (miniMatch && req.method === 'GET') {
    const accountNo = decodeURIComponent(miniMatch[1]);
    const acc = accounts.find((a) => a.account_no === accountNo) || {
      account_no: accountNo,
      holder_name: 'Customer Account',
      pin: '****',
      balance: 25000,
      card_type: 'REGULAR'
    };

    const alloc = indexedAllocations[accountNo] || {
      indexBlock: 'I-07',
      dataBlocks: ['B12', 'B19', 'B27', 'B31']
    };

    const accTxns = transactions.filter((t) => t.account_no === accountNo);

    return res.status(200).json({
      success: true,
      account: acc,
      index_block: alloc.indexBlock,
      data_blocks: alloc.dataBlocks,
      transactions: accTxns,
      lookup_path: {
        root: 'ACCOUNT_INDEX_DIRECTORY',
        account: accountNo,
        index_pointer: alloc.indexBlock,
        allocated_data_blocks: alloc.dataBlocks,
        retrieved_records: accTxns.length
      }
    });
  }

  // 6. Operator Profile
  if (pathname === '/api/operator' && req.method === 'GET') {
    return res.status(200).json({ success: true, profile: operatorProfile });
  }

  if (pathname === '/api/operator/progress' && req.method === 'POST') {
    const { xp_gain, system_health, achievement_id, mission_id } = req.body || {};
    operatorProfile.xp += Number(xp_gain) || 0;
    if (system_health !== undefined) operatorProfile.system_health = system_health;
    if (achievement_id && !operatorProfile.achievements.includes(achievement_id)) {
      operatorProfile.achievements.push(achievement_id);
    }
    if (mission_id && !operatorProfile.missions_completed.includes(mission_id)) {
      operatorProfile.missions_completed.push(mission_id);
    }
    return res.status(200).json({ success: true, profile: operatorProfile });
  }

  // 7. Reset
  if (pathname === '/api/reset' && req.method === 'POST') {
    accounts = JSON.parse(JSON.stringify(INITIAL_ACCOUNTS));
    return res.status(200).json({ success: true, message: 'Database reset to default benchmark state' });
  }

  // Fallback 404 for unknown API
  return res.status(404).json({ error: 'Endpoint not found' });
}
