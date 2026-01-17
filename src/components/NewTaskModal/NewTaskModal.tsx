import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,

  Paper
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { db, type ITask } from '../../db/db';
import { ActivityHeatmap } from '../ActivityHeatmap/ActivityHeatmap';

interface NewTaskModalProps {
  onClose: () => void;
  task?: ITask;
}

const DAYS_OF_WEEK = [
  { id: 0, label: 'Dom' },
  { id: 1, label: 'Seg' },
  { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' },
  { id: 4, label: 'Qui' },
  { id: 5, label: 'Sex' },
  { id: 6, label: 'Sáb' },
];

export function NewTaskModal({ onClose, task }: NewTaskModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setIsRecurring(task.isTemplate);
      setRecurrenceDays(task.recurrenceDays || []);
    }
  }, [task]);

  const handleDayToggle = (dayId: number) => {
    setRecurrenceDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (task) {
        // Edit existing task
        await db.tasks.update(task.id, {
          title,
          description,
          isTemplate: isRecurring,
          recurrenceDays,
        });
      } else {
        // Create new task
        const firstColumn = await db.columns.orderBy('order').first();
        const columnId = firstColumn?.id || 'default';

        await db.tasks.add({
          id: uuidv4(),
          title,
          description,
          columnId: isRecurring ? '' : columnId,
          createdAt: new Date(),
          isTemplate: isRecurring,
          recurrenceDays,
        });
      }

      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const isSubmitDisabled = !title.trim() || (isRecurring && recurrenceDays.length === 0);

  // Group sessions by day for history list
  const getSessionHistory = () => {
    if (!task || !task.pomodoroSessions) return [];
    
    // Sort by date desc
    const sorted = [...task.pomodoroSessions].sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    const grouped: Record<string, { date: Date; duration: number; count: number }> = {};
    
    sorted.forEach(session => {
        const dayKey = format(session.completedAt, 'yyyy-MM-dd');
        if (!grouped[dayKey]) {
            grouped[dayKey] = { date: session.completedAt, duration: 0, count: 0 };
        }
        grouped[dayKey].duration += session.duration;
        grouped[dayKey].count += 1;
    });

    return Object.values(grouped);
  };

  const totalDuration = task?.pomodoroSessions?.reduce((acc, s) => acc + s.duration, 0) || 0;
  
  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ p: 0 }}>
        {task ? (
            <Tabs 
              value={activeTab} 
              onChange={(_, v) => setActiveTab(v)} 
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label="Editar" />
                <Tab label="Produtividade" />
            </Tabs>
        ) : (
            <Box sx={{ p: 2, pb: 1 }}>Nova Tarefa</Box>
        )}
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {/* Tab 0: Edit Form */}
        {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                autoFocus
                label="Título"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="O que precisa ser feito?"
                variant="outlined"
              />
              <TextField
                label="Descrição"
                fullWidth
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione detalhes..."
                variant="outlined"
              />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Dias da Semana (Opcional)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {DAYS_OF_WEEK.map((day) => (
                     <Chip
                       key={day.id}
                       label={day.label}
                       onClick={() => handleDayToggle(day.id)}
                       color={recurrenceDays.includes(day.id) ? 'primary' : 'default'}
                       variant={recurrenceDays.includes(day.id) ? 'filled' : 'outlined'}
                       clickable
                     />
                  ))}
                </Box>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                }
                label="Recriar automaticamente nestes dias (Modo Rotina)"
              />
            </Box>
        )}

        {/* Tab 1: Stats & History */}
        {activeTab === 1 && task && (
            <Box>
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography variant="overline" color="text.secondary">Tempo Total de Foco</Typography>
                    <Typography variant="h3" color="primary.main">{formatDuration(totalDuration)}</Typography>
                </Box>
                
                <Typography variant="h6" gutterBottom>Consistência</Typography>
                <ActivityHeatmap filterByTitle={task.title} />
                
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Histórico de Sessões</Typography>
                <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                    <List dense>
                        {getSessionHistory().map((group, i) => (
                            <ListItem key={i} divider>
                                <ListItemText 
                                    primary={format(group.date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                                    secondary={`${group.count} sessões`}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {formatDuration(group.duration)}
                                </Typography>
                            </ListItem>
                        ))}
                        {getSessionHistory().length === 0 && (
                            <ListItem>
                                <ListItemText primary="Nenhuma sessão registrada ainda." />
                            </ListItem>
                        )}
                    </List>
                </Paper>
            </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        {activeTab === 0 && (
             <Button onClick={handleSubmit} variant="contained" disabled={isSubmitDisabled}>
               {task ? 'Salvar Alterações' : (isRecurring ? 'Criar Rotina' : 'Criar Tarefa')}
             </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
