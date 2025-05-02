/**
 * Global error handler for uncaught runtime errors
 * This utility provides functions to set up global error handling
 */

// Function to safely stringify objects for error logging
export const safeStringify = (obj) => {
  try {
    if (typeof obj === 'string') return obj;
    if (obj instanceof Error) return obj.message;

    return JSON.stringify(obj, (key, value) => {
      // Handle circular references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }
      return value;
    }, 2);
  } catch (err) {
    return `[Object could not be stringified: ${err.message}]`;
  } finally {
    seen.clear();
  }
};

// Set to track objects for circular reference detection
const seen = new Set();

// Set up global error handlers
export const setupErrorHandlers = () => {
  // Handle uncaught promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);

    // Prevent the default browser handling
    event.preventDefault();

    // You could also log to an error reporting service here
    // logErrorToService('Unhandled Promise Rejection', event.reason);
  });

  // Handle runtime errors
  window.addEventListener('error', (event) => {
    console.error('Runtime Error:', event.error);

    // Prevent the default browser handling
    event.preventDefault();

    // You could also log to an error reporting service here
    // logErrorToService('Runtime Error', event.error);
  });

  // Override console.error to ensure objects are properly stringified
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const safeArgs = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        return safeStringify(arg);
      }
      return arg;
    });

    originalConsoleError.apply(console, safeArgs);
  };
};

// Function to handle React rendering errors
export const handleRenderError = (error, errorInfo) => {
  console.error('React Render Error:', error);
  console.error('Component Stack:', errorInfo?.componentStack);

  // You could also log to an error reporting service here
  // logErrorToService('React Render Error', { error, componentStack: errorInfo?.componentStack });
};

const errorHandlerUtils = {
  setupErrorHandlers,
  handleRenderError,
  safeStringify
};

export default errorHandlerUtils;
