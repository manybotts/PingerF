import React, { useState, useEffect } from 'react';

function App() {
  const [appUrl, setAppUrl] = useState('');
  const [apps, setApps] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [backendUrl, setBackendUrl] = useState(''); // Add state for backend URL

  useEffect(() => {
    async function getBackendURL() {
      try {
        //  Get the Railway backend's URL
        const urlResponse = await fetch("/backend_url"); //fetch from the new end point.
        if(!urlResponse.ok){
          throw new Error(`Error fetching backend URL: ${urlResponse.status}`)
        }
        const urlData = await urlResponse.json();
        setBackendUrl(urlData.backend_url); //set the state.
      }
      catch (error){
        showMessage(error.message, 'error')
      }
    }
     getBackendURL() // Call the function to get the backend URL
  }, []); // Run once on mount

  useEffect(() => {
    if (backendUrl) { // Only fetch apps once backendUrl is set
      fetchApps();
    }
  }, [backendUrl]); // Run fetchApps when backendUrl changes


  async function fetchApps() {
      try {
        const response = await fetch(`${backendUrl}apps`);
        if (!response.ok) {
          // Check for non-200 status codes *before* parsing as JSON
          const errorText = await response.text(); // Get the raw response text
          throw new Error(`HTTP Error ${response.status}: ${errorText}`); // Include status and text
        }
        const data = await response.json();
        setApps(data);
      } catch (error) {
        showMessage(error.message, 'error'); // Show the detailed error message
      }
    }

  async function addApp() {
      if (!appUrl) {
        showMessage('Please enter a URL.', 'error');
        return;
      }
      if (!/^(https?:\/\/)/.test(appUrl)) {
        showMessage('Invalid URL.  Must start with http:// or https://', 'error');
        return;
      }

      try {
        const response = await fetch(`${backendUrl}apps`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: appUrl }),
        });

        if (response.ok) {
            showMessage('App added successfully!', 'success');
            setAppUrl(''); // Clear input
            fetchApps(); // Refresh list
          } else if (response.status === 400) {
            const data = await response.json();
            showMessage(data.detail, 'error');
          }
           else {
            throw new Error(`Error: ${response.status}`);
          }
      } catch (error) {
        showMessage(error.message, 'error');
      }
    }

  async function removeApp(urlToRemove) {
     try {
        const response = await fetch(`${backendUrl}apps`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: urlToRemove }),
        });

        if (response.ok) {
          showMessage('App removed successfully!', 'success');
          fetchApps();
        } else if(response.status === 404){
            const data = await response.json();
            showMessage(data.detail, 'error');
        }
         else {
          throw new Error(`Error: ${response.status}`);
        }
      } catch (error) {
        showMessage(error.message, 'error');
      }
  }

  function showMessage(text, type) {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000); // Hide after 5s
  }

  return (
    <div className="container">
      <h1>Koyeb App Pinger</h1>

      <div>
        <input
          type="text"
          id="appUrl"
          placeholder="Enter Koyeb app URL (e.g., https://myapp.koyeb.app)"
          value={appUrl}
          onChange={(e) => setAppUrl(e.target.value)}
        />
        <button onClick={addApp}>Add App</button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <h2>Apps to Ping</h2>
      <ul>
        {apps.map((url) => (
          <li key={url}>
            <span>{url}</span>
            <button className="remove-btn" onClick={() => removeApp(url)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default App;
