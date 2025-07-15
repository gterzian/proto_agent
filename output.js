(async function() {
  'use strict';

  // Clear any previous UI elements
  const existingElements = document.querySelectorAll('[data-agent-ui]');
  existingElements.forEach(el => el.remove());

  // Create main container
  const container = document.createElement('div');
  container.setAttribute('data-agent-ui', 'true');
  container.style.cssText = `
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    max-width: 800px;
    margin: 0 auto;
  `;

  const title = document.createElement('h2');
  title.textContent = 'Screenshot Files Total Size';
  title.style.cssText = 'margin-bottom: 20px; color: #333;';

  const statusDiv = document.createElement('div');
  statusDiv.style.cssText = 'margin-bottom: 20px; font-style: italic; color: #666;';

  const resultsDiv = document.createElement('div');

  container.appendChild(title);
  container.appendChild(statusDiv);
  container.appendChild(resultsDiv);
  document.body.appendChild(container);

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  try {
    statusDiv.textContent = 'Retrieving previous results...';

    // Get previous results from the screenshot file finder
    const previousResult = await window.getAgentResult();

    if (!previousResult || previousResult.type !== 'screenshot_files') {
      statusDiv.textContent = 'No previous screenshot file results found.';
      resultsDiv.innerHTML = `
        <p style="color: #ff6b6b; background: #ffe6e6; padding: 15px; border-radius: 5px; border-left: 4px solid #ff6b6b;">
          <strong>No Previous Data Found</strong><br>
          Please run the screenshot file finder first to scan a folder for screenshot files.
        </p>
      `;
      return;
    }

    statusDiv.textContent = 'Calculating total size...';

    const files = previousResult.files;
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    const formattedTotal = formatFileSize(totalBytes);

    statusDiv.textContent = 'Calculation complete.';

    // Display the results
    resultsDiv.innerHTML = `
      <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 20px; text-align: center;">
        <h3 style="color: #2e7d32; margin: 0 0 10px 0;">Total Size Summary</h3>
        <div style="font-size: 24px; font-weight: bold; color: #1b5e20; margin: 15px 0;">
          ${formattedTotal}
        </div>
        <div style="color: #555; font-size: 14px;">
          Total of ${files.length} screenshot file${files.length !== 1 ? 's' : ''} 
          (${totalBytes.toLocaleString()} bytes)
        </div>
        <div style="color: #777; font-size: 12px; margin-top: 10px;">
          Data from: ${new Date(previousResult.timestamp).toLocaleString()}
        </div>
      </div>
    `;

    // Store the total size result
    window.setAgentResult({
      type: 'screenshot_files_total_size',
      totalBytes: totalBytes,
      formattedSize: formattedTotal,
      fileCount: files.length,
      originalTimestamp: previousResult.timestamp,
      calculatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calculating total size:', error);
    statusDiv.textContent = `Error: ${error.message}`;
    resultsDiv.innerHTML = `
      <p style="color: #ff6b6b; background: #ffe6e6; padding: 15px; border-radius: 5px;">
        <strong>Error:</strong> ${error.message}
      </p>
    `;
  }

})();