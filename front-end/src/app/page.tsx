'use client';
import { useState, useEffect } from 'react';
import { Music, LoaderCircle, Download, AlertCircle, CheckCircle, Youtube } from 'lucide-react';

export default function YouTubeConverter() {
  const [url, setUrl] = useState('');
  const [fileName, setFileName] = useState(''); // Added to store the fileName
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [serverStatus, setServerStatus] = useState({ isOnline: false, checking: true });
  const [status, setStatus] = useState({ message: '', type: '' });
  
  // Base URL for your server
  const SERVER_BASE_URL = 'http://192.168.133.195:8080';

  // Check server health on component mount
  useEffect(() => {
    checkServerHealth();
  }, []);

  // Check if server is running
  const checkServerHealth = async () => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/healthCheck`);
      if (response.ok && await response.text() === 'Health.OK') {
        setServerStatus({ isOnline: true, checking: false });
      } else {
        setServerStatus({ isOnline: false, checking: false });
        setStatus({ message: 'Server is offline. Please try again later.', type: 'error' });
      }
    } catch (err) {
      setServerStatus({ isOnline: false, checking: false });
      setStatus({ message: 'Cannot connect to server. Please check your connection.', type: 'error' });
    }
  };

  // Submit YouTube URL for conversion
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
      setStatus({ message: 'Please enter a valid YouTube URL', type: 'error' });
      return;
    }

    if (!serverStatus.isOnline) {
      setStatus({ message: 'Server is offline. Please try again later.', type: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    setStatus({ message: 'Processing your request...', type: 'info' });
    
    try {
      // Use the exact endpoint format you provided
      const downloadUrl = `${SERVER_BASE_URL}/download?ytUrl=${encodeURIComponent(url)}`;
      const response = await fetch(downloadUrl);
      if (response.ok) {
        // Parse the JSON response to get the fileName
        const data = await response.text();
        console.log('Response data:', data);
        setFileName(data);
        
        setStatus({ 
          message: 'YouTube video submitted for conversion! You can now check download status.', 
          type: 'success' 
        });
      } else {
        const errorText = await response.text();
        setStatus({ 
          message: errorText || 'Failed to submit video for conversion', 
          type: 'error' 
        });
      }
    } catch (err) {
      setStatus({ 
        message: 'An error occurred connecting to the server', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check status and download if ready
  const handleDownload = async () => {
    if (!url) {
      setStatus({ message: 'Please submit a YouTube URL first', type: 'error' });
      return;
    }

    if (!fileName) {
      setStatus({ message: 'No file information available. Please submit the URL again.', type: 'error' });
      return;
    }

    setIsDownloading(true);
    setStatus({ message: 'Checking if download is ready...', type: 'info' });
    
    try {
      // Pass fileName as a query parameter to getStatus
      const statusResponse = await fetch(`${SERVER_BASE_URL}/getStatus?fileName=${encodeURIComponent(fileName)}`);
      const statusData:string = await statusResponse.text();
      
      if (statusResponse.ok && statusData === 'true') {
        // If downloaded, initiate the download with fileName parameter
        setStatus({ message: 'MP3 is ready! Starting download...', type: 'success' });
        
        // Redirect to download URL with fileName parameter
        window.location.href = `${SERVER_BASE_URL}/getDownload?fileName=${encodeURIComponent(fileName)}`;
      } else {
        // If not downloaded yet
        setStatus({ 
          message: 'The song hasn\'t been downloaded yet. Please wait a moment and try again.', 
          type: 'warning' 
        });
      }
    } catch (err) {
      setStatus({ 
        message: 'Failed to check download status or download the file', 
        type: 'error' 
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20">
        <div className="px-8 pt-10 pb-6">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
              <Music size={32} className="text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center text-white mb-1">YouTube to MP3</h1>
          <p className="text-center text-white/70 mb-8">Convert your favorite videos to audio</p>
          
          {serverStatus.checking ? (
            <div className="flex justify-center items-center py-6">
              <LoaderCircle size={32} className="text-white/70 animate-spin" />
            </div>
          ) : (
            <>
              {serverStatus.isOnline ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
                    <div className="relative bg-black/30 rounded-lg p-1">
                      <div className="flex items-center bg-black/40 rounded-md overflow-hidden">
                        <div className="pl-3">
                          <Youtube size={20} className="text-red-500" />
                        </div>
                        <input
                          type="text"
                          className="flex-1 bg-transparent text-white px-3 py-3 outline-none placeholder-white/50"
                          placeholder="Paste YouTube URL here..."
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Button 1: Submit Link */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative group overflow-hidden rounded-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 group-hover:from-blue-500 group-hover:to-blue-300 transition-all duration-300"></div>
                      <div className="relative px-4 py-3 bg-black/10 flex items-center justify-center space-x-2 text-white font-medium">
                        {isSubmitting ? (
                          <LoaderCircle size={18} className="animate-spin" />
                        ) : null}
                        <span>{isSubmitting ? 'Processing' : 'Submit'}</span>
                      </div>
                    </button>
                    
                    {/* Button 2: Download MP3 (with integrated status check) */}
                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={isDownloading || !url}
                      className="relative group overflow-hidden rounded-lg"
                    >
                      <div className={`absolute inset-0 ${url ? 'bg-gradient-to-r from-green-600 to-green-400 group-hover:from-green-500 group-hover:to-green-300' : 'bg-gradient-to-r from-gray-600 to-gray-400'} transition-all duration-300`}></div>
                      <div className="relative px-4 py-3 bg-black/10 flex items-center justify-center space-x-2 text-white font-medium">
                        {isDownloading ? (
                          <LoaderCircle size={18} className="animate-spin" />
                        ) : (
                          <Download size={18} />
                        )}
                        <span>{isDownloading ? 'Checking...' : 'Download'}</span>
                      </div>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
                  <AlertCircle size={20} className="text-red-300" />
                  <p className="text-red-200">Server is offline. Please try again later.</p>
                </div>
              )}
            </>
          )}
          
          {status.message && (
            <div className={`mt-6 p-4 rounded-lg backdrop-blur-sm flex items-start space-x-3 ${
              status.type === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/30' :
              status.type === 'success' ? 'bg-green-500/20 text-green-200 border border-green-500/30' :
              status.type === 'warning' ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30' :
              'bg-blue-500/20 text-blue-200 border border-blue-500/30'
            }`}>
              <div className="flex-shrink-0 mt-0.5">
                {status.type === 'error' && <AlertCircle size={18} />}
                {status.type === 'success' && <CheckCircle size={18} />}
                {status.type === 'warning' && <AlertCircle size={18} />}
                {status.type === 'info' && <LoaderCircle size={18} className="animate-spin" />}
              </div>
              <p>{status.message}</p>
            </div>
          )}
        </div>
        
        <div className="py-4 px-8 text-center bg-black/20">
          <p className="text-white/50 text-sm">Made with ♥ for your music collection</p>
        </div>
      </div>
    </div>
  );
}