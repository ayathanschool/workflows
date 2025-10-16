// src/components/ConnectionStatus.jsx
import { useEffect, useState } from 'react';
import { checkConnectivity, CONNECTION_EVENTS, setDemoMode } from '../api.enhanced';
import { useTheme } from '../contexts/ThemeContext';

// Component that shows the current connection status and allows toggling demo mode
function ConnectionStatus() {
  const { theme } = useTheme();
  const [isOnline, setIsOnline] = useState(true);
  const [inDemoMode, setInDemoMode] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Listen for connection events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      // Auto-hide the banner after 3 seconds
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    const handleDemoMode = (event) => {
      setInDemoMode(event.detail?.enabled || false);
      setShowBanner(true);
    };

    const handleConnectionFailed = () => {
      setShowBanner(true);
      setIsOnline(false);
    };

    // Check connectivity when component mounts
    checkConnectivity().then(online => setIsOnline(online));

    // Add event listeners
    window.addEventListener(CONNECTION_EVENTS.ONLINE, handleOnline);
    window.addEventListener(CONNECTION_EVENTS.OFFLINE, handleOffline);
    window.addEventListener(CONNECTION_EVENTS.DEMO_MODE, handleDemoMode);
    window.addEventListener('api-connection-failed', handleConnectionFailed);

    // Also check when the window comes back online
    window.addEventListener('online', () => checkConnectivity());
    window.addEventListener('offline', () => {
      setIsOnline(false);
      setShowBanner(true);
    });

    return () => {
      // Remove event listeners on cleanup
      window.removeEventListener(CONNECTION_EVENTS.ONLINE, handleOnline);
      window.removeEventListener(CONNECTION_EVENTS.OFFLINE, handleOffline);
      window.removeEventListener(CONNECTION_EVENTS.DEMO_MODE, handleDemoMode);
      window.removeEventListener('api-connection-failed', handleConnectionFailed);
      window.removeEventListener('online', () => checkConnectivity());
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  // Handle enabling demo mode
  const enableDemoMode = () => {
    setDemoMode(true);
    setInDemoMode(true);
  };

  // Handle disabling demo mode and retry connection
  const retryConnection = () => {
    if (inDemoMode) {
      setDemoMode(false);
      setInDemoMode(false);
    }
    
    checkConnectivity().then(online => {
      setIsOnline(online);
      if (online) {
        setShowBanner(false);
      }
    });
  };

  // Don't render anything if online and not in demo mode and not showing banner
  if (isOnline && !inDemoMode && !showBanner) {
    return null;
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 p-2 transition-all duration-500 ease-in-out ${showBanner ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
      <div className={`max-w-md mx-auto rounded-lg shadow-lg p-4 transition-colors duration-300 ${theme === 'dark' ? 
        (inDemoMode ? 'bg-blue-900/70' : (isOnline ? 'bg-green-900/70' : 'bg-red-900/70')) : 
        (inDemoMode ? 'bg-blue-100' : (isOnline ? 'bg-green-100' : 'bg-red-100'))}`}>
        {inDemoMode ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-100' : 'text-blue-900'} transition-colors duration-300`}>Demo Mode Active</span>
            </div>
            <button 
              onClick={retryConnection} 
              className={`text-xs ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white py-1 px-2 rounded transition-colors duration-300 transform hover:scale-105`}
            >
              Exit Demo Mode
            </button>
          </div>
        ) : isOnline ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-green-100' : 'text-green-900'} transition-colors duration-300`}>Connected</span>
            </div>
            <button 
              onClick={() => setShowBanner(false)} 
              className={`text-xs ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-300`}
            >
              Dismiss
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-red-500 mr-2 animate-pulse"></div>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-red-100' : 'text-red-900'} transition-colors duration-300`}>Connection Lost</span>
            </div>
            <div className="space-x-2">
              <button 
                onClick={retryConnection} 
                className={`text-xs ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} py-1 px-2 rounded transition-colors duration-300 transform hover:scale-105`}
              >
                Retry
              </button>
              <button 
                onClick={enableDemoMode} 
                className={`text-xs ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white py-1 px-2 rounded transition-colors duration-300 transform hover:scale-105`}
              >
                Use Demo Mode
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConnectionStatus;