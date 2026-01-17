import { Draggable } from '@hello-pangea/dnd';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Trash, Play } from 'lucide-react';
import { Card, CardContent, Typography, IconButton, Box, Chip, Tooltip } from '@mui/material';
import { db, type ITask } from '../../db/db';

interface TaskCardProps {
  task: ITask;
  index: number;
  onClick?: () => void;
  onStartPomodoro: (task: ITask) => void;
}

export function TaskCard({ task, index, onClick, onStartPomodoro }: TaskCardProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await db.tasks.delete(task.id);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onStartPomodoro(task);
  };

  const totalDuration = task.pomodoroSessions?.reduce((acc, session) => acc + session.duration, 0) || 0;
  
  // Find last session date
  const lastSession = task.pomodoroSessions && task.pomodoroSessions.length > 0 
    ? task.pomodoroSessions.reduce((prev, current) => (prev.completedAt > current.completedAt) ? prev : current)
    : null;

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          sx={{
            mb: 1,
            position: 'relative',
            bgcolor: 'background.paper',
            // enhance dragging visuals
            boxShadow: snapshot.isDragging ? 4 : 1,
            transition: 'box-shadow 0.2s',
            cursor: 'pointer', // Indicate clickable
            // opacity: snapshot.isDragging ? 0.9 : 1,
            '&:hover .actions': {
              opacity: 1,
            }
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            {/* Title and Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
              <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600, mr: 5, lineHeight: 1.2 }}>
                {task.title}
              </Typography>
              
              <Box className="actions" sx={{ 
                  position: 'absolute', top: 8, right: 8, 
                  opacity: 0, transition: 'opacity 0.2s',
                  display: 'flex', gap: 0.5
              }}>
                <Tooltip title="Iniciar Pomodoro">
                    <IconButton
                        size="small"
                        onClick={handlePlayClick}
                        sx={{
                        color: 'primary.main',
                        bgcolor: 'primary.light', // soft bg
                        '&:hover': { bgcolor: 'primary.main', color: 'white' }
                        }}
                    >
                        <Play size={14} fill="currentColor" />
                    </IconButton>
                </Tooltip>

                <IconButton
                    size="small"
                    onClick={handleDelete}
                    sx={{
                    color: 'text.secondary',
                    '&:hover': {
                        color: 'error.main',
                        bgcolor: 'rgba(239, 68, 68, 0.1)', 
                    }
                    }}
                >
                    <Trash size={16} />
                </IconButton>
              </Box>
            </Box>

            {/* Description */}
            {task.description && (
              <Typography variant="body2" color="text.secondary" sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineClamp: 3
              }}>
                {task.description}
              </Typography>
            )}

            {/* Footer: Days + Date + Time */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1, flexWrap: 'wrap', gap: 1 }}>
                {totalDuration > 0 && (
                   <Chip
                     icon={<Clock size={14} />}
                     label={formatDuration(totalDuration)}
                     size="small"
                     color="secondary" // Distinct color for time
                     variant="outlined"
                     sx={{ height: 20, fontSize: '0.7rem', '& .MuiChip-icon': { ml: 0.5, width: 14, height: 14 } }}
                   />
                )}

                {task.recurrenceDays && task.recurrenceDays.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1, flexWrap: 'wrap' }}>
                    {task.recurrenceDays.map(dayId => {
                      const isToday = new Date().getDay() === dayId;
                      return (
                        <Chip
                          key={dayId}
                          label={['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dayId]}
                          size="small"
                          color={isToday ? 'primary' : 'default'}
                          variant={isToday ? 'filled' : 'outlined'}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      );
                    })}
                  </Box>
               )}
               
               {/* Last Active or Created At */}
              <Typography variant="caption" color="text.disabled">
                {lastSession 
                    ? `Última vez ${formatDistanceToNow(lastSession.completedAt, { addSuffix: true, locale: ptBR })}`
                    : format(task.createdAt, 'dd MMM', { locale: ptBR })
                }
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
}
