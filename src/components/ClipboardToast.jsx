import { ClipboardCopy, X } from 'lucide-react';

const ClipboardToast = ({ pendingItem, onConfirm, onCancel }) => {
    if (!pendingItem) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-slide-up">
            <div className="bg-blue-600 text-white p-4 rounded-xl shadow-2xl border border-blue-500 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold flex items-center gap-2">
                            <ClipboardCopy size={16} />
                            Received Clipboard
                        </h4>
                        <p className="text-xs text-blue-100 mt-1">
                            From {pendingItem.fromDevice}
                        </p>
                    </div>
                    <button onClick={onCancel} className="text-blue-200 hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                <div className="bg-blue-800/50 p-2 rounded text-sm font-mono truncate">
                    {pendingItem.text}
                </div>

                <button
                    onClick={onConfirm}
                    className="w-full bg-white text-blue-600 font-bold py-2.5 rounded-lg active:scale-95 transition-transform"
                >
                    Tap to Copy to Device
                </button>
            </div>
        </div>
    );
};

export default ClipboardToast;
