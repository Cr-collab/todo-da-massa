import { Droppable } from '@hello-pangea/dnd';
import { Paper, Typography, Box, Stack, Chip, CircularProgress } from '@mui/material';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { db as firestoreDb } from '../../services/firebase';
import { type IColumn, type ITask } from '../../db/db';
import { TaskCard } from '../TaskCard/TaskCard';

interface ColumnProps {
  column: IColumn;
  onTaskClick: (task: ITask) => void;
  onStartPomodoro: (task: ITask) => void;
}

const convertDates = (data: any): any => {
    return {
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : data.completedAt,
        lastGeneratedAt: data.lastGeneratedAt?.toDate ? data.lastGeneratedAt.toDate() : data.lastGeneratedAt,
        pomodoroSessions: data.pomodoroSessions?.map((s: any) => ({
            ...s,
            completedAt: s.completedAt?.toDate ? s.completedAt.toDate() : s.completedAt
        }))
    };
};

export function Column({ column, onTaskClick, onStartPomodoro }: ColumnProps) {
  const [tasksRaw, loading] = useCollectionData(
    query(
        collection(firestoreDb, 'tasks'), 
        where('columnId', '==', column.id)
    )
  );

  // Client-side sorting for now since composite index might be needed for compound queries
  const tasks = tasksRaw?.map(t => convertDates(t) as ITask)
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                        .reverse();

  const taskCount = tasks?.length ?? 0;

  return (
    <Paper
      elevation={0}
      sx={{
        width: 300,
        minWidth: 300,
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100%',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
          {column.title}
        </Typography>
        <Chip label={taskCount} size="small" color="default" sx={{ height: 20, fontSize: '0.75rem' }} />
      </Box>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <Stack
            ref={provided.innerRef}
            {...provided.droppableProps}
            spacing={0} // Gap handled by Card margin
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              minHeight: 100,
              transition: 'background-color 0.2s',
              bgcolor: snapshot.isDraggingOver ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              borderRadius: 1,
            }}
          >
            {tasks?.map((task, index) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                index={index} 
                onClick={() => onTaskClick(task)}
                onStartPomodoro={onStartPomodoro}
              />
            ))}
            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    </Paper>
  );
}
