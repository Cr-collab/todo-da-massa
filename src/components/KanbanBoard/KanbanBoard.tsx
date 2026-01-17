import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { Plus, BarChart2 } from 'lucide-react';
import { useState } from 'react';
import { db, type ITask, type IColumn } from '../../db/db';
import { Column } from '../Column/Column';
import { NewTaskModal } from '../NewTaskModal/NewTaskModal';
import { PomodoroModal } from '../PomodoroModal/PomodoroModal';
import { StatsModal } from '../StatsModal/StatsModal';
import { Box, Button, Typography, Stack, IconButton, Tooltip } from '@mui/material';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy } from 'firebase/firestore';
import { db as firestoreDb } from '../../services/firebase';

export function KanbanBoard() {
  const [columns, loading, error] = useCollectionData(
    query(collection(firestoreDb, 'columns'), orderBy('order'))
  ) as [IColumn[] | undefined, boolean, any, any];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | undefined>(undefined);
  const [pomodoroTask, setPomodoroTask] = useState<ITask | undefined>(undefined);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId !== result.source.droppableId) {
       // WIP Limit Check
       const targetColumn = columns?.find(c => c.id === destination.droppableId);
       const inProgressTitle = "Em Progresso"; // Should match default title or be robust
       
       if (targetColumn && targetColumn.title === inProgressTitle) {
         const tasksInTarget = await db.tasks.where('columnId').equals(targetColumn.id).count();
         if (tasksInTarget >= 1) {
           alert("Foco total! Você só pode ter 1 tarefa em progresso por vez.");
           return;
         }
       }

       await db.tasks.update(draggableId, { columnId: destination.droppableId });
       
       // If moved to Done, mark completedAt
       const doneTitle = "Concluído";
       if (targetColumn && targetColumn.title === doneTitle) {
           await db.tasks.update(draggableId, { completedAt: new Date() });
       }
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}>Carregando...</Box>;
  if (error) return <Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>Erro ao carregar dados.</Box>;

  const handleEditTask = (task: ITask) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleStartPomodoro = (task: ITask) => {
    setPomodoroTask(task);
  };

  const handlePomodoroComplete = async () => {
    if (pomodoroTask) {
        // Move to Done
        const doneTitle = "Concluído";
        const doneColumn = columns?.find(c => c.title === doneTitle);
        
        if (doneColumn) {
            await db.tasks.update(pomodoroTask.id, { 
                columnId: doneColumn.id,
                completedAt: new Date()
            });
        }
        setPomodoroTask(undefined);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        px: 3,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700, letterSpacing: '-0.025em' }}>
            Todo da Massa
          </Typography>
          <Tooltip title="Estatísticas">
            <IconButton onClick={() => setIsStatsOpen(true)} size="small">
              <BarChart2 size={20} />
            </IconButton>
          </Tooltip>
        </Box>

        <Button 
          variant="contained" 
          startIcon={<Plus size={20} />} 
          onClick={() => setIsModalOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Nova Tarefa
        </Button>
      </Box>

      {/* Board Container */}
      <Box sx={{ 
        flexGrow: 1, 
        overflowX: 'auto', 
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Stack direction="row" spacing={3} sx={{ height: '100%', minWidth: 'fit-content' }}>
            {columns?.map((col) => (
              <Column 
                key={col.id} 
                column={col} 
                onTaskClick={handleEditTask}
                onStartPomodoro={handleStartPomodoro}
              />
            ))}
          </Stack>
        </DragDropContext>
      </Box>

      {isModalOpen && (
        <NewTaskModal 
          onClose={handleCloseModal} 
          task={editingTask} 
        />
      )}

      {pomodoroTask && (
        <PomodoroModal 
          task={pomodoroTask} 
          onClose={() => setPomodoroTask(undefined)}
          onComplete={handlePomodoroComplete}
        />
      )}

      {isStatsOpen && (
        <StatsModal onClose={() => setIsStatsOpen(false)} />
      )}
    </Box>
  );
}
