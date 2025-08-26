import React, { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const NotificationContext = createContext(() => {});

export function NotificationProvider({ children }) {
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const notify = useCallback((message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  }, []);

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnack((prev) => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export const useNotify = () => useContext(NotificationContext);
