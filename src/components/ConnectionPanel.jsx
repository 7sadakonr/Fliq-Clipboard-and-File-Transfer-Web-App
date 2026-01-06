import { useState } from 'react';
import { Copy, QrCode as QrIcon } from 'lucide-react';
import useAppStore from '../stores/useAppStore';
import { QRCodeSVG } from 'qrcode.react';

const ConnectionPanel = ({ onConnect }) => {
    const { myPeerId, connectionStatus } = useAppStore();
    const [remoteIdInput, setRemoteIdInput] = useState('');
    const [showQr, setShowQr] = useState(false);

    const handleCopy = () => {
        if (myPeerId) {
            navigator.clipboard.writeText(myPeerId);
            // toast success?
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">
            <div className="mb-6">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2 block">My ID</label>
                <div className="flex items-center gap-2 bg-gray-900 p-3 rounded-lg border border-gray-700">
                    <code className="flex-1 text-green-400 font-mono overflow-hidden text-ellipsis">
                        {myPeerId || 'Initializing...'}
                    </code>
                    <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-gray-700 rounded-md transition-colors text-gray-400 hover:text-white"
                        title="Copy ID"
                    >
                        <Copy size={16} />
                    </button>
                    <button
                        onClick={() => setShowQr(!showQr)}
                        className="p-2 hover:bg-gray-700 rounded-md transition-colors text-gray-400 hover:text-white"
                        title="Show QR Code"
                    >
                        <QrIcon size={16} />
                    </button>
                </div>
            </div>

            {showQr && myPeerId && (
                <div className="mb-6 flex justify-center bg-white p-4 rounded-lg">
                    <QRCodeSVG value={myPeerId} size={150} />
                </div>
            )}

            <div className="border-t border-gray-700 pt-6">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2 block">Connect to Peer</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={remoteIdInput}
                        onChange={(e) => setRemoteIdInput(e.target.value)}
                        placeholder="Enter Remote ID"
                        className="flex-1 bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => onConnect(remoteIdInput)}
                        disabled={!remoteIdInput || connectionStatus === 'connected' || connectionStatus === 'connecting'}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Connect
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConnectionPanel;
