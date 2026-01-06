import { useState, useEffect, useCallback, useRef } from 'react';
import * as clipboard from 'clipboard-polyfill';
import useAppStore from '../stores/useAppStore';
import { usePeerConnection } from './usePeerConnection';
import { getDeviceName } from '../utils/platform';

export const useClipboardSync = () => {
    const { sendData } = usePeerConnection();
    const { lastReceivedClipboard, setLastReceivedClipboard } = useAppStore();

    // UI State for when auto-write fails (iOS Safari)
    const [pendingClipboardItem, setPendingClipboardItem] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);

    // 1. Sending: Read Local -> Peer
    const readAndSendClipboard = useCallback(async () => {
        try {
            // clipboard-polyfill handles some cross-browser issues
            const text = await clipboard.readText();

            if (!text) {
                console.warn("Clipboard was empty");
                return;
            }

            console.log("Read from clipboard:", text);

            sendData('CLIPBOARD', {
                text,
                timestamp: Date.now(),
                fromDevice: getDeviceName()
            });

            // Optionally add to own history? App logic usually handles this via optimistic update or explicit add
            useAppStore.getState().addClipboardItem({
                id: Date.now().toString(),
                text: text,
                timestamp: Date.now(),
                fromDevice: 'Me'
            });

            return true;
        } catch (err) {
            console.error("Failed to read clipboard:", err);
            // Permission denied or not focused
            return false;
        }
    }, [sendData]);

    // 2. Receiving: Peer -> Local Write (with fallback)
    useEffect(() => {
        if (!lastReceivedClipboard) return;

        const attemptWrite = async () => {
            const { text, fromDevice } = lastReceivedClipboard;
            console.log("New clipboard item received, attempting write:", text);

            try {
                // Try to write immediately
                await clipboard.writeText(text);
                console.log("Auto-write to clipboard successful!");
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            } catch (err) {
                console.warn("Auto-write failed (expected on iOS Safari/Firefox without gesture):", err);
                // Fallback: Show UI to tap
                setPendingClipboardItem(lastReceivedClipboard);
            }
        };

        attemptWrite();

        // Reset trigger? No, we just react when it *changes*
        // But if we receive the *same* reference object it won't trigger. 
        // Zustand creates new objects usually.
    }, [lastReceivedClipboard]);

    // 3. Manual Write (Fallback Action)
    const confirmPendingCopy = async () => {
        if (!pendingClipboardItem) return;

        try {
            await clipboard.writeText(pendingClipboardItem.text);
            setPendingClipboardItem(null);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error("Manual write failed:", err);
            alert("Failed to copy. Please copy manually from the history list.");
        }
    };

    const clearPending = () => setPendingClipboardItem(null);

    return {
        readAndSendClipboard, // To be attached to a button
        pendingClipboardItem, // If not null, show "New Clip! Tap to Copy"
        confirmPendingCopy,   // Action for that button
        clearPending,
        copySuccess           // Show "Copied!" toast
    };
};
