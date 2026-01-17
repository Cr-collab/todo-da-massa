import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { ActivityHeatmap } from '../ActivityHeatmap/ActivityHeatmap';

interface StatsModalProps {
  onClose: () => void;
  taskTitle?: string;
}

export function StatsModal({ onClose, taskTitle }: StatsModalProps) {
  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {taskTitle ? `Histórico: ${taskTitle} 📊` : 'Minhas Estatísticas 📊'}
      </DialogTitle>
      <DialogContent>
        <ActivityHeatmap filterByTitle={taskTitle} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
