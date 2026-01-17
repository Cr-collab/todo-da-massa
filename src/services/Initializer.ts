import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db';
import { runTaskScheduler } from './TaskScheduler';

const DEFAULT_COLUMNS = [
  { title: 'A Fazer', order: 0 },
  { title: 'Em Progresso', order: 1 },
  { title: 'Concluído', order: 2 },
];

export const initializeApp = async (): Promise<void> => {
  try {
    const columnCount = await db.columns.count();

    if (columnCount === 0) {
      console.log('Seeding default columns...');
      const columnsToCreate = DEFAULT_COLUMNS.map((col) => ({
        id: uuidv4(),
        title: col.title,
        order: col.order,
      }));
      await db.columns.bulkAdd(columnsToCreate);
    }

    await runTaskScheduler();
  } catch (error: any) {
    console.error('Error initializing app:', error);
    if (error.code === 'permission-denied') {
        alert(
            'Acesso negado ao Firebase! \n\n' +
            'Por favor, vá no Console do Firebase > Firestore Database > Regras\n' +
            'E altere para permitir leitura/escrita (allow read, write: if true;)'
        );
    }
  }
};
