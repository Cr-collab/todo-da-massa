import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  TextField,
  Collapse
} from '@mui/material';
import { Play, Pause, Square, CheckCircle, Music } from 'lucide-react';
import { db, type ITask } from '../../db/db';

interface PomodoroModalProps {
  task: ITask;
  onClose: () => void;
  onComplete?: () => void;
}

export function PomodoroModal({ task, onClose, onComplete }: PomodoroModalProps) {
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<'config' | 'running' | 'finished'>('config');
  
  const [musicUrl, setMusicUrl] = useState(localStorage.getItem('pomo_music_url') || '');
  const [showMusic, setShowMusic] = useState(false);

  useEffect(() => {
    localStorage.setItem('pomo_music_url', musicUrl);
  }, [musicUrl]);
  
  // Custom duration input could be added here, keeping simple for now
  const PRESETS = [25, 50, 15]; 

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 0) {
                // Timer finished
                handleFinish();
                return 0;
              }
              return prevMinutes - 1;
            });
            return 59;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused]);

  const handleStart = (duration: number) => {
    setSelectedDuration(duration);
    setMinutes(duration);
    setSeconds(0);
    setMode('running');
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = async () => {
    // Save partial session if stopped? For now, only save on finish or manual log?
    // Let's just reset.
    setIsActive(false);
    setMode('config');
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleFinish = async () => {
    setIsActive(false);
    setMode('finished');
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Save session
    try {
      const newSession = {
        duration: selectedDuration, 
        completedAt: new Date(),
      };

      const updatedSessions = [...(task.pomodoroSessions || []), newSession];
      await db.tasks.update(task.id, { pomodoroSessions: updatedSessions });
      
      // Play sound?
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.play().catch(e => console.log('Audio play failed', e));

      // Trigger Completion Callback
      if (onComplete) {
          onComplete();
      }

    } catch (error) {
      console.error('Failed to save session', error);
    }
  };

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  const getEmbedUrl = (url: string) => {
    try {
        if (!url) return '';
        
        let videoId = '';
        
        // Handle youtube.com/watch?v=ID
        if (url.includes('youtube.com/watch')) {
            const urlObj = new URL(url);
            videoId = urlObj.searchParams.get('v') || '';
        } 
        // Handle youtu.be/ID
        else if (url.includes('youtu.be/')) {
            const parts = url.split('youtu.be/');
            videoId = parts[1]?.split('?')[0] || '';
        }
        // Already embed or other
        else {
            return url;
        }

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?loop=1&playlist=${videoId}`;
        }
        
        return url;
    } catch (e) {
        return url;
    }
  };

  return (
    <Dialog open={true} maxWidth="sm" fullWidth disableEscapeKeyDown>
      <DialogTitle sx={{ textAlign: 'center' }}>
        {mode === 'config' && 'Iniciar Foco 🍅'}
        {mode === 'running' && 'Focando...'}
        {mode === 'finished' && 'Sessão Concluída! 🎉'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          
          {mode === 'config' && (
             <Box sx={{ display: 'flex', gap: 2 }}>
               {PRESETS.map(min => (
                 <Button 
                   key={min} 
                   variant="outlined" 
                   onClick={() => handleStart(min)}
                   size="large"
                   sx={{ borderRadius: '50%', width: 64, height: 64 }}
                 >
                   {min}m
                 </Button>
               ))}
             </Box>
          )}

          {mode === 'running' && (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress 
                variant="determinate" 
                value={100} // Dynamic progress would be nice
                size={200} 
                thickness={2}
                sx={{ color: 'primary.main', opacity: 0.1, position: 'absolute' }} 
              />
              <CircularProgress 
                variant="indeterminate" // Pulse effect
                disableShrink
                size={200}
                thickness={2}
                sx={{ color: isPaused ? 'warning.main' : 'primary.main' }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h2" component="div" color="text.primary">
                  {formatTime(minutes)}:{formatTime(seconds)}
                </Typography>
              </Box>
            </Box>
          )}

          {mode === 'finished' && (
            <Box sx={{ textAlign: 'center' }}>
              <CheckCircle size={64} color="#4ade80" style={{ marginBottom: 16 }} />
              <Typography>
                Você completou um ciclo de foco!
              </Typography>
            </Box>
          )}

          <Box sx={{ width: '100%', mt: 3 }}>
             <Button 
                startIcon={<Music size={18} />} 
                onClick={() => setShowMusic(!showMusic)}
                size="small"
                sx={{ mb: 1 }}
             >
                {showMusic ? 'Ocultar Música' : 'Música de Fundo'}
             </Button>
             
             <Collapse in={showMusic}>
                <TextField
                  fullWidth
                  size="small"
                  label="URL da Música (YouTube)"
                  placeholder="Cole o link do vídeo aqui (ex: https://youtube.com/watch?v=...)"
                  value={musicUrl}
                  onChange={(e) => setMusicUrl(e.target.value)}
                  sx={{ mb: 2 }}
                  helperText="Links normais do YouTube serão convertidos automaticamente."
                />
                {musicUrl && (
                    <Box sx={{ 
                        position: 'relative', 
                        paddingBottom: '56.25%', // 16:9 aspect ratio
                        height: 0, 
                        overflow: 'hidden',
                        borderRadius: 2,
                        bgcolor: 'black'
                    }}>
                        <iframe 
                            src={getEmbedUrl(musicUrl)} 
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        />
                    </Box>
                )}
             </Collapse>
          </Box>

        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        {mode === 'config' && (
          <Button onClick={onClose} color="inherit">Agora não</Button>
        )}
        
        {mode === 'running' && (
          <>
            <IconButton onClick={handlePause} color="primary" size="large">
              {isPaused ? <Play size={32} /> : <Pause size={32} />}
            </IconButton>
            <IconButton onClick={handleStop} color="error" size="large">
              <Square size={32} />
            </IconButton>
          </>
        )}

        {mode === 'finished' && (
          <Button variant="contained" onClick={onClose} fullWidth>
             Continuar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
