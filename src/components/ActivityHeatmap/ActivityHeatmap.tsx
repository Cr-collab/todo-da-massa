import { useMemo } from 'react';
import { Box, Tooltip, Typography, Paper, CircularProgress } from '@mui/material';
import { eachDayOfInterval, subDays, format } from 'date-fns';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
import { db as firestoreDb } from '../../services/firebase';
import { type ITask } from '../../db/db';

interface ActivityHeatmapProps {
  filterByTitle?: string;
}

const convertDates = (data: any): ITask => {
    return {
        ...data,
        completedAt: data.completedAt?.toDate ? data.completedAt.toDate() : data.completedAt,
        pomodoroSessions: data.pomodoroSessions?.map((s: any) => ({
            ...s,
            completedAt: s.completedAt?.toDate ? s.completedAt.toDate() : s.completedAt
        }))
    } as ITask;
};

export function ActivityHeatmap({ filterByTitle }: ActivityHeatmapProps) {
  // Fetch completed tasks. Filtering by date in query requires index.
  // For now, load all completed tasks or tasks with pomodoro sessions and filter client side.
  // Actually, filtering by filterByTitle is important.
  
  const [tasksRaw, loading] = useCollectionData(collection(firestoreDb, 'tasks'));
  
  const tasks = useMemo(() => {
      if (!tasksRaw) return [];
      return tasksRaw.map(convertDates);
  }, [tasksRaw]);

  const today = new Date();
  const startDate = subDays(today, 365); // Last year



  const dailyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!tasks) return counts;
    
    const relevantTasks = filterByTitle 
        ? tasks.filter(t => t.title === filterByTitle)
        : tasks;

    relevantTasks.forEach(task => {
        // 1. Task completion
        if (task.completedAt) {
            const dayKey = format(task.completedAt, 'yyyy-MM-dd');
            counts[dayKey] = (counts[dayKey] || 0) + 1;
        }

        // 2. Pomodoro sessions
        task.pomodoroSessions?.forEach(session => {
            if (session.completedAt) {
                const dayKey = format(session.completedAt, 'yyyy-MM-dd');
                counts[dayKey] = (counts[dayKey] || 0) + 1;
            }
        });
    });

    return counts;
  }, [tasks, filterByTitle]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={20} /></Box>;

  const getColor = (count: number) => {
    if (count === 0) return '#161b22'; // empty
    if (count <= 2) return '#0e4429';
    if (count <= 4) return '#006d32';
    if (count <= 6) return '#26a641';
    return '#39d353'; // max
  };

  const dates = eachDayOfInterval({ start: startDate, end: today });

  return (
    <Paper sx={{ p: 2, mb: 3, bgcolor: '#0d1117', color: 'text.secondary', overflowX: 'auto' }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Contribuicões (Últimos 365 dias)
      </Typography>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateRows: 'repeat(7, 10px)', 
        gridAutoFlow: 'column', 
        gap: 0.5,
        height: (7 * 10 + 6 * 2) // rough math
      }}>
        {dates.map(date => {
           const dayKey = format(date, 'yyyy-MM-dd');
           const count = dailyCounts[dayKey] || 0;
           return (
             <Tooltip key={dayKey} title={`${count} tarefas em ${format(date, 'dd/MM/yyyy')}`}>
               <Box sx={{ 
                 width: 10, 
                 height: 10, 
                 bgcolor: getColor(count), 
                 borderRadius: '2px' 
               }} />
             </Tooltip>
           );
        })}
      </Box>
    </Paper>
  );
}
