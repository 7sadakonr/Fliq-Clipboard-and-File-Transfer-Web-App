import { useState } from 'react';
import { ClipboardCopy, Send, Smartphone } from 'lucide-react';
import useAppStore from '../stores/useAppStore';
import { isIOS } from '../utils/platform';

const ClipboardPanel = ({ onSend, onDirectCopy }) => {
    const { clipboardHistory, connectionStatus } = useAppStore();
    const [textToSend, setTextToSend] = useState('');

    const handleSend = () => {
        if (!textToSend.trim()) return;
        onSend(textToSend);
        setTextToSend('');
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).catch(err => console.error("Copy failed", err));
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md flex flex-col h-[500px]">
            <div className="mb-4">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2 block">Share Clipboard</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={textToSend}
                        onChange={(e) => setTextToSend(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isIOS() ? "Paste here first..." : "Type or paste content..."}
                        className="flex-1 bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!textToSend || connectionStatus !== 'connected'}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <Send size={18} />
                    </button>
                    {!isIOS() && (
                        <button
                            onClick={onDirectCopy}
                            disabled={connectionStatus !== 'connected'}
                            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-medium transition-colors"
                            title="Push current clipboard"
                        >
                            <ClipboardCopy size={18} />
                        </button>
                    )}
                </div>
                {isIOS() && <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><Smartphone size={10} /> iOS: Paste content manually above to send.</p>}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2 block">History</label>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {clipboardHistory.length === 0 ? (
                        <div className="text-center text-gray-600 py-8 italic">No clipboard history yet</div>
                    ) : (
                        clipboardHistory.map((item) => (
                            <div key={item.id} className="bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 transition-colors group">
                                <p className="text-sm text-gray-200 break-words line-clamp-3 mb-2">{item.text}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-gray-500">{new Date(item.timestamp).toLocaleTimeString()} • {item.fromDevice || 'Unknown'}</span>
                                    <button
                                        onClick={() => handleCopy(item.text)}
                                        className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Copy"
                                    >
                                        <ClipboardCopy size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClipboardPanel;
