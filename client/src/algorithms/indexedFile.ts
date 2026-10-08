export interface DiskBlock {
  id: number;
  blockName: string; // e.g., 'B00' to 'B63'
  type: 'FREE' | 'INDEX' | 'DATA' | 'SYSTEM';
  accountNo?: string;
  associatedIndex?: string;
  txnId?: string;
}

export interface IndexedLookupStep {
  step: number;
  phase: string;
  description: string;
  highlightedBlock?: string;
}

export function generateDiskBlocks(
  indexedAllocations: Record<string, { indexBlock: string; dataBlocks: string[] }>
): DiskBlock[] {
  const TOTAL_BLOCKS = 64;
  const blocks: DiskBlock[] = [];

  // Identify index block names and data block names
  const indexBlockMap: Record<string, string> = {}; // blockName -> accountNo
  const dataBlockMap: Record<string, { accountNo: string; indexBlock: string }> = {};

  for (const [accountNo, alloc] of Object.entries(indexedAllocations)) {
    // Normalizing block names: convert 'I-07' to 'B07' for disk mapping, or keep distinct
    const indexNum = parseInt(alloc.indexBlock.replace('I-', ''), 10) || 7;
    const indexDiskName = `B${String(indexNum).padStart(2, '0')}`;
    indexBlockMap[indexDiskName] = accountNo;

    alloc.dataBlocks.forEach((dbName) => {
      dataBlockMap[dbName] = { accountNo, indexBlock: alloc.indexBlock };
    });
  }

  for (let i = 0; i < TOTAL_BLOCKS; i++) {
    const blockName = `B${String(i).padStart(2, '0')}`;

    if (i < 4) {
      // System boot and OS inode tables
      blocks.push({
        id: i,
        blockName,
        type: 'SYSTEM',
      });
    } else if (indexBlockMap[blockName]) {
      blocks.push({
        id: i,
        blockName,
        type: 'INDEX',
        accountNo: indexBlockMap[blockName],
        associatedIndex: `I-${String(i).padStart(2, '0')}`,
      });
    } else if (dataBlockMap[blockName]) {
      blocks.push({
        id: i,
        blockName,
        type: 'DATA',
        accountNo: dataBlockMap[blockName].accountNo,
        associatedIndex: dataBlockMap[blockName].indexBlock,
      });
    } else {
      blocks.push({
        id: i,
        blockName,
        type: 'FREE',
      });
    }
  }

  return blocks;
}

export function traceIndexedLookup(
  accountNo: string,
  indexBlock: string,
  dataBlocks: string[]
): IndexedLookupStep[] {
  return [
    {
      step: 1,
      phase: 'DIRECTORY SEARCH',
      description: `OS File System searches Account Inode Directory for entry "${accountNo}". Located pointer to Index Block ${indexBlock}.`,
    },
    {
      step: 2,
      phase: 'INDEX BLOCK FETCH',
      description: `OS loads Index Block ${indexBlock} into kernel buffer cache. Reading stored block address pointers.`,
      highlightedBlock: indexBlock,
    },
    {
      step: 3,
      phase: 'POINTER RESOLUTION',
      description: `Index Block contains ${dataBlocks.length} direct block pointers: [${dataBlocks.join(', ')}]. No file fragmentation penalty.`,
    },
    {
      step: 4,
      phase: 'DATA BLOCK RETRIEVAL',
      description: `Kernel parallel I/O reads transactions from disk blocks: ${dataBlocks.join(' → ')}. Mini-statement record constructed.`,
      highlightedBlock: dataBlocks[dataBlocks.length - 1],
    },
  ];
}
