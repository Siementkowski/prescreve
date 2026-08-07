// Cache local da base inteira, em IndexedDB — é isso que torna o app instantâneo e
// utilizável offline. A base é pequena (texto puro, poucos milhares de linhas), cabe
// inteira no dispositivo sem paginação nem lazy loading.
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

interface PrescreveDB extends DBSchema {
  cache: {
    key: string
    value: unknown
  }
}

let dbPromise: Promise<IDBPDatabase<PrescreveDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<PrescreveDB>('prescreve-cache', 1, {
      upgrade(db) {
        db.createObjectStore('cache')
      },
    })
  }
  return dbPromise
}

export async function lerCache<T>(chave: string): Promise<T | undefined> {
  try {
    const db = await getDB()
    return (await db.get('cache', chave)) as T | undefined
  } catch {
    // IndexedDB indisponível (modo privado restrito etc.) — degrada pra "sem cache",
    // o app ainda funciona, só depende de rede toda vez.
    return undefined
  }
}

export async function gravarCache(chave: string, valor: unknown): Promise<void> {
  try {
    const db = await getDB()
    await db.put('cache', valor, chave)
  } catch {
    // Mesma degradação silenciosa — não é crítico o suficiente pra travar a sincronização.
  }
}
