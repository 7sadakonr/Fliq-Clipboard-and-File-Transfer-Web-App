import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { usePeerConnection } from '../hooks/usePeerConnection';

// Lazy Load Pages
const ConnectPage = lazy(() => import('../pages/ConnectPage'));
const TransferPage = lazy(() => import('../pages/TransferPage'));

// Loading Fallback
const LoadingScreen = () => (
    <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-stone-800 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-stone-500 text-sm font-mono animate-pulse">Loading SyncStream...</p>
    </div>
);

function App() {
    // Initialize peer connection at app level
    usePeerConnection();

    return (
        <BrowserRouter>
            <Suspense fallback={<LoadingScreen />}>
                <Routes>
                    <Route path="/" element={<ConnectPage />} />
                    <Route path="/transfer" element={<TransferPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
