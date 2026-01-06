import { useEffect, useCallback } from 'react';
import Peer from 'peerjs';
import { generatePeerId } from '../utils/nameGenerator';
import useAppStore from '../stores/useAppStore';
import { handleFileProtocol } from '../utils/fileReceiver';

// SINGLETON: Keep peer instance outside of React lifecycle
let peerInstance = null;
let reconnectInterval = null;
let isInitialized = false;

const initializePeer = () => {
    if (peerInstance && !peerInstance.destroyed) {
        return peerInstance;
    }

    const store = useAppStore.getState();
    const id = generatePeerId();

    console.log('[Peer] Creating new instance with ID:', id);

    // Config for Global Connection (STUN/TURN)
    // Using OpenRelay (Free Tier) or similar is required for over-the-internet
    const peerConfig = {
        debug: 1,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }, // Google STUN (Free)
                { urls: 'stun:global.stun.twilio.com:3478' },
                {
                    urls: 'turn:openrelay.metered.ca:80',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:openrelay.metered.ca:443',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                }
            ]
        }
    };

    // Note: STUN/TURN servers are now enabled for global (non-LAN) connections.

    peerInstance = new Peer(id, peerConfig);

    peerInstance.on('open', (id) => {
        console.log('[Peer] Opened with ID:', id);
        useAppStore.getState().setMyPeerId(id);
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
    });

    peerInstance.on('connection', (conn) => {
        console.log('[Peer] Incoming connection from:', conn.peer);
        setupConnectionHandlers(conn);
    });

    peerInstance.on('disconnected', () => {
        console.log('[Peer] Disconnected from signaling server');
        if (!reconnectInterval) {
            reconnectInterval = setInterval(() => {
                if (peerInstance && !peerInstance.destroyed) {
                    console.log('[Peer] Attempting reconnect...');
                    peerInstance.reconnect();
                }
            }, 5000);
        }
    });

    peerInstance.on('close', () => {
        console.log('[Peer] Destroyed');
        useAppStore.getState().setMyPeerId(null);
        useAppStore.getState().setConnectionStatus('disconnected');
        peerInstance = null;
        isInitialized = false;
    });

    peerInstance.on('error', (err) => {
        console.error('[Peer] Error:', err);
    });

    return peerInstance;
};

const setupConnectionHandlers = (conn) => {
    const store = useAppStore.getState();

    conn.on('open', () => {
        console.log('[Conn] Opened with:', conn.peer);
        useAppStore.getState().setConnectionStatus('connected');
        useAppStore.getState().setActiveConnection(conn);
        useAppStore.getState().setRemotePeerId(conn.peer);
    });

    conn.on('data', (data) => {
        handleIncomingData(data);
    });

    conn.on('close', () => {
        console.log('[Conn] Closed:', conn.peer);
        const currentConn = useAppStore.getState().activeConnection;
        if (currentConn?.peer === conn.peer) {
            useAppStore.getState().setConnectionStatus('disconnected');
            useAppStore.getState().setActiveConnection(null);
            useAppStore.getState().setRemotePeerId(null);
        }
    });

    conn.on('error', (err) => {
        console.error('[Conn] Error:', err);
    });
};

const handleIncomingData = (data) => {
    console.log('[Data] Received:', data);
    if (!data || !data.type) return;

    const store = useAppStore.getState();

    switch (data.type) {
        case 'CLIPBOARD':
            const newItem = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                text: data.payload.text,
                timestamp: data.payload.timestamp,
                fromDevice: data.payload.fromDevice
            };
            store.addClipboardItem(newItem);
            store.setLastReceivedClipboard(newItem);
            break;
        case 'FILE':
            handleFileProtocol(data.payload);
            break;
        default:
            console.warn('Unknown data type:', data.type);
    }
};

// Hook for components to use
export const usePeerConnection = () => {
    const {
        connectionStatus,
        myPeerId,
        activeConnection,
        setConnectionStatus
    } = useAppStore();

    // Initialize peer on first hook usage (once globally)
    useEffect(() => {
        if (!isInitialized) {
            isInitialized = true;
            initializePeer();
        }
    }, []);

    const connectToPeer = useCallback((peerId) => {
        if (!peerInstance || peerInstance.destroyed) {
            console.error('[Conn] Peer not ready');
            return;
        }

        const currentStatus = useAppStore.getState().connectionStatus;
        if (currentStatus === 'connected') {
            console.warn('[Conn] Already connected');
            return;
        }

        console.log('[Conn] Initiating connection to:', peerId);
        useAppStore.getState().setConnectionStatus('connecting');

        const conn = peerInstance.connect(peerId, { reliable: true });
        setupConnectionHandlers(conn);
    }, []);

    const sendData = useCallback((type, payload) => {
        const conn = useAppStore.getState().activeConnection;
        if (conn && conn.open) {
            conn.send({ type, payload });
        } else {
            console.warn('[Conn] Cannot send, not connected');
        }
    }, []);

    const disconnectPeer = useCallback(() => {
        const conn = useAppStore.getState().activeConnection;
        if (conn) {
            console.log('[Conn] Disconnecting manually');
            conn.close();
        }
        useAppStore.getState().setConnectionStatus('disconnected');
        useAppStore.getState().setActiveConnection(null);
        useAppStore.getState().setRemotePeerId(null);
    }, []);

    return {
        connectionStatus,
        myPeerId,
        activeConnection,
        connectToPeer,
        disconnectPeer,
        sendData
    };
};
