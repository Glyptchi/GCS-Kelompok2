import { configureStore } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';

import reducers from './reducers';
import initializeFromBackend from './initializeFromBackend';

const store = configureStore({
    reducer: reducers,
})

const socket = io(
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
    { autoConnect: false }
);

const cleanup = initializeFromBackend(store, socket);

socket.connect();

if(import.meta.hot){
    import.meta.hot.dispose(() => {
        cleanup();
        socket.disconnect();
    });
}

export { store, socket };