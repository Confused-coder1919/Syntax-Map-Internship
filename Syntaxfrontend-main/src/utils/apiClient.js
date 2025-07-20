import { getBackendUrl } from '../config';

/**
 * API client for making requests to the backend with proper error handling,
 * automatic retries, and authentication token management.
 */
class ApiClient {
  /**
   * Makes a fetch request to the backend with proper error handling
   * @param {string} endpoint - API endpoint to call (without base URL)
   * @param {Object} options - Request options (method, headers, body)
   * @param {number} retries - Number of retries allowed (default: 1)
   * @returns {Promise} - Promise resolving to response data or error
   */
  async request(endpoint, options = {}, retries = 1) {
    // Get the current backend URL
    const baseUrl = await getBackendUrl();
    
    // Ensure headers exist
    options.headers = options.headers || {};
    
    // Add default headers
    if (!options.headers['Content-Type'] && !options.formData) {
      options.headers['Content-Type'] = 'application/json';
    }
    
    // Add auth token if available
    const token = localStorage.getItem('jstoken');
    if (token) {
      options.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    
    // If body is an object and not FormData, stringify it
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      options.body = JSON.stringify(options.body);
    }
    
    try {
      const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      console.log(`API ${options.method || 'GET'} request to: ${url}`);
      
      const response = await fetch(url, options);
      
      // Handle non-2xx status codes
      if (!response.ok) {
        // Special handling for 401 Unauthorized
        if (response.status === 401) {
          console.warn('Authentication error. User may need to re-login.');
          // You could trigger an auth refresh or logout here
        }
        
        // Try to parse error details from response
        let errorDetails = {};
        try {
          errorDetails = await response.json();
        } catch (e) {
          // Ignore parse errors
        }
        
        // Create error object with HTTP info
        const error = new Error(errorDetails.msg || `HTTP Error: ${response.status}`);
        error.status = response.status;
        error.details = errorDetails;
        throw error;
      }
      
      // Check if response is empty
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      // Handle network errors and retry if possible
      if (error.name === 'AbortError' || error.name === 'TypeError') {
        console.warn(`Network error: ${error.message}. Retries left: ${retries}`);
        
        if (retries > 0) {
          console.log('Retrying request...');
          // Wait a bit before retrying (increasing delay with each retry)
          await new Promise(resolve => setTimeout(resolve, 1000 * (2 - retries)));
          return this.request(endpoint, options, retries - 1);
        }
      }
      
      // Re-throw the error if we can't recover
      throw error;
    }
  }
  
  // Convenience methods for common HTTP methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }
  
  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: data });
  }
  
  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: data });
  }
  
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
  
  /**
   * Upload a file or files to the backend
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - FormData object with files
   * @param {Function} progressCallback - Optional callback for upload progress
   * @returns {Promise} - Promise resolving to response data
   */
  async uploadFile(endpoint, formData, progressCallback = null) {
    const options = {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary
      headers: {}
    };
    
    // Add upload progress tracking if callback provided
    if (progressCallback && typeof progressCallback === 'function') {
      return new Promise(async (resolve, reject) => {
        try {
          const baseUrl = await getBackendUrl();
          const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
          
          const xhr = new XMLHttpRequest();
          xhr.open(options.method, url);
          
          // Add auth token if available
          const token = localStorage.getItem('jstoken');
          if (token) {
            xhr.setRequestHeader('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
          }
          
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              progressCallback(percentComplete, event);
            }
          });
          
          xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
              try {
                const contentType = xhr.getResponseHeader('Content-Type');
                if (contentType && contentType.includes('application/json')) {
                  resolve(JSON.parse(xhr.responseText));
                } else {
                  resolve(xhr.responseText);
                }
              } catch (error) {
                resolve(xhr.responseText);
              }
            } else {
              reject({
                status: this.status,
                message: xhr.statusText
              });
            }
          };
          
          xhr.onerror = function() {
            reject({
              status: this.status,
              message: xhr.statusText
            });
          };
          
          xhr.send(formData);
        } catch (error) {
          reject(error);
        }
      });
    }
    
    // No progress tracking, use standard request
    return this.request(endpoint, options);
  }
}

// Create and export a singleton instance
export default new ApiClient();