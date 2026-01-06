import { create } from 'zustand';

const useAppStore = create((set, get) => ({
    // Identity
    myPeerId: null,
    setMyPeerId: (id) => set({ myPeerId: id }),

    // Connection
    connectionStatus: 'disconnected', // disconnected, connecting, connected
    remotePeerId: null,
    activeConnection: null, // PeerJS connection object
    setConnectionStatus: (status) => set({ connectionStatus: status }),
    setRemotePeerId: (id) => set({ remotePeerId: id }),
    setActiveConnection: (conn) => set({ activeConnection: conn }),

    // Connection Object (not persisted, just in memory reference if needed, though usually handled in hook)
    // We'll keep logic in the hook, but store status here.

    // Clipboard
    clipboardHistory: [],
    lastReceivedClipboard: null, // Trigger for auto-write attempts
    addClipboardItem: (item) => set((state) => ({
        clipboardHistory: [item, ...state.clipboardHistory].slice(0, 50)
    })),
    setLastReceivedClipboard: (item) => set({ lastReceivedClipboard: item }),

    // File Transfer
    fileTransfers: [],
    addFileTransfer: (transfer) => set((state) => ({
        fileTransfers: [transfer, ...state.fileTransfers]
    })),
    updateFileTransfer: (id, updates) => set((state) => ({
        fileTransfers: state.fileTransfers.map(ft => ft.id === id ? { ...ft, ...updates } : ft)
    })),

    // UI State
    activeTab: 'clipboard', // clipboard, files
    setActiveTab: (tab) => set({ activeTab: tab }),
}));

export default useAppStore;
