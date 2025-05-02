import 'react-app-polyfill/stable'
import 'core-js'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { Provider } from 'react-redux'
import './css/index.css'
import store from './store'
import 'datatables.net-dt/css/jquery.dataTables.css';
import 'datatables.net';
import 'react-toastify/dist/ReactToastify.css';
import 'react-loading-skeleton/dist/skeleton.css';
import ErrorBoundary from './components/ErrorBoundary'
import { setupErrorHandlers } from './utils/errorHandler'

// Set up global error handlers
setupErrorHandlers();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
)

reportWebVitals()
