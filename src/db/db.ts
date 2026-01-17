import { db as firestoreDb } from '../services/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  writeBatch,
  query,
  where,
  type DocumentData
} from 'firebase/firestore';

export interface IPomodoroSession {
  duration: number; // in minutes
  completedAt: Date;
}

// Helper to convert Firestore dates to JS Dates
const convertDates = (data: DocumentData): any => {
    const result = { ...data };
    if (result.createdAt?.toDate) result.createdAt = result.createdAt.toDate();
    if (result.completedAt?.toDate) result.completedAt = result.completedAt.toDate();
    if (result.lastGeneratedAt?.toDate) result.lastGeneratedAt = result.lastGeneratedAt.toDate();
    if (result.pomodoroSessions) {
        result.pomodoroSessions = result.pomodoroSessions.map((s: any) => ({
            ...s,
            completedAt: s.completedAt?.toDate ? s.completedAt.toDate() : s.completedAt
        }));
    }
    return result;
};

export interface ITask {
  id: string;
  title: string;
  description: string;
  columnId: string;
  createdAt: Date;
  isTemplate: boolean;
  recurrenceDays: number[];
  lastGeneratedAt?: Date;
  completedAt?: Date;
  pomodoroSessions?: IPomodoroSession[];
}

export interface IColumn {
  id: string;
  title: string;
  order: number;
}

export const db = {
  tasks: {
    add: async (task: ITask) => {
      await setDoc(doc(firestoreDb, 'tasks', task.id), task);
    },
    update: async (id: string, data: Partial<ITask>) => {
      await updateDoc(doc(firestoreDb, 'tasks', id), data);
    },
    delete: async (id: string) => {
      await deleteDoc(doc(firestoreDb, 'tasks', id));
    },
    get: async (id: string): Promise<ITask | undefined> => {
       const snap = await getDoc(doc(firestoreDb, 'tasks', id));
       return snap.exists() ? (convertDates(snap.data()) as ITask) : undefined;
    },
    where: (field: string) => ({
        equals: (value: any) => ({
            count: async () => {
                const q = query(collection(firestoreDb, 'tasks'), where(field, '==', value));
                const snap = await getDocs(q);
                return snap.size;
            },
            toArray: async (): Promise<ITask[]> => {
                const q = query(collection(firestoreDb, 'tasks'), where(field, '==', value));
                const snap = await getDocs(q);
                return snap.docs.map(d => convertDates(d.data()) as ITask);
            }
        })
    })
  },
  columns: {
      count: async () => {
          const snap = await getDocs(collection(firestoreDb, 'columns'));
          return snap.size;
      },
      bulkAdd: async (columns: IColumn[]) => {
          const batch = writeBatch(firestoreDb);
          columns.forEach(col => {
              const ref = doc(firestoreDb, 'columns', col.id);
              batch.set(ref, col);
          });
          await batch.commit();
      },
      orderBy: (field: string) => ({
          first: async (): Promise<IColumn | undefined> => {
               // naive impl for 'first'
               const q = query(collection(firestoreDb, 'columns')); // Firestore sorting is separate, assumes small data
               const snap = await getDocs(q);
               const cols = snap.docs.map(d => d.data() as IColumn).sort((a: any, b: any) => a[field] - b[field]);
               return cols[0];
          },
          toArray: async (): Promise<IColumn[]> => {
               const q = query(collection(firestoreDb, 'columns'));
               const snap = await getDocs(q);
               return snap.docs.map(d => d.data() as IColumn).sort((a: any, b: any) => a[field] - b[field]);
          }
      })
  }
};
