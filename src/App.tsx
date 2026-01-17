import { useEffect, useRef } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { KanbanBoard } from './components/KanbanBoard/KanbanBoard';
import { initializeApp } from './services/Initializer';
import './App.css';

function App() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initializeApp();
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        <KanbanBoard />
      </div>
    </ThemeProvider>
  );
}

export default App;
