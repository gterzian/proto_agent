// Screenshot Thumbnail Viewer
// This program uses previous results to display thumbnails of screenshot files

function displayScreenshotThumbnails() {
    const containerDiv = document.createElement('div');
    containerDiv.style.cssText = `
        font-family: system-ui, -apple-system, sans-serif;
        margin: 20px;
        padding: 20px;
        border-radius: 8px;
        background: #f5f5f5;
        max-width: 1200px;
    `;
    document.body.appendChild(containerDiv);

    const statusDiv = document.createElement('div');
    const thumbnailGrid = document.createElement('div');
    thumbnailGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 20px;
    `;

    containerDiv.appendChild(statusDiv);
    containerDiv.appendChild(thumbnailGrid);

    const updateStatus = (message) => {
        statusDiv.innerHTML = `<h2>Screenshot Thumbnails</h2><p>${message}</p>`;
    };

    // Check if we have previous results
    if (!window.previousResultForAgent || !window.previousResultForAgent.result || window.previousResultForAgent.result.length === 0) {
        updateStatus('No previous screenshot data found. Please run the screenshot finder first to select files.');
        
        // Create file input for selecting screenshots
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.multiple = true;
        fileInput.style.cssText = `
            margin: 10px 0;
            padding: 8px;
            border: 2px dashed #ccc;
            border-radius: 4px;
            background: white;
            cursor: pointer;
        `;

        const selectButton = document.createElement('button');
        selectButton.textContent = 'Select Screenshot Files';
        selectButton.style.cssText = `
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin: 10px 0;
        `;

        containerDiv.appendChild(selectButton);
        containerDiv.appendChild(fileInput);

        selectButton.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (event) => {
            const files = Array.from(event.target.files);
            const screenshots = files.filter(file => 
                file.type.startsWith('image/') && 
                file.name.toLowerCase().includes('screenshot')
            );
            
            if (screenshots.length > 0) {
                processScreenshots(screenshots);
            } else {
                updateStatus('No screenshot image files selected. Please select image files with "screenshot" in their names.');
            }
        });

        window.resultForAgent = {
            result: [],
            documentation: 'No previous data available. Waiting for user to select screenshot files.'
        };
        return;
    }

    // Process screenshots from previous results
    updateStatus('Loading screenshot thumbnails from previous results...');
    
    // We need to get the actual files again since File objects can't be serialized
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.webkitdirectory = true;
    fileInput.multiple = true;
    fileInput.style.display = 'none';

    const reloadButton = document.createElement('button');
    reloadButton.textContent = 'Select Folder to Load Thumbnails';
    reloadButton.style.cssText = `
        padding: 10px 20px;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin: 10px 0;
    `;

    containerDiv.appendChild(reloadButton);
    containerDiv.appendChild(fileInput);

    reloadButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        const screenshots = files.filter(file => 
            file.type.startsWith('image/') && 
            file.name.toLowerCase().includes('screenshot')
        );
        
        processScreenshots(screenshots);
    });

    function processScreenshots(files) {
        updateStatus(`Processing ${files.length} screenshot files...`);
        thumbnailGrid.innerHTML = '';

        const thumbnails = [];

        files.forEach((file, index) => {
            // Create thumbnail container
            const thumbnailCard = document.createElement('div');
            thumbnailCard.style.cssText = `
                background: white;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transition: transform 0.2s;
                cursor: pointer;
            `;

            thumbnailCard.addEventListener('mouseenter', () => {
                thumbnailCard.style.transform = 'scale(1.02)';
            });

            thumbnailCard.addEventListener('mouseleave', () => {
                thumbnailCard.style.transform = 'scale(1)';
            });

            // Create image element
            const img = document.createElement('img');
            img.style.cssText = `
                width: 100%;
                height: 150px;
                object-fit: cover;
                border-radius: 4px;
                border: 1px solid #ddd;
            `;

            // Create file reader
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
                
                thumbnails.push({
                    name: file.name,
                    size: file.size,
                    lastModified: file.lastModified,
                    type: file.type,
                    dataUrl: e.target.result
                });

                // Update status
                if (thumbnails.length === files.length) {
                    updateStatus(`Successfully loaded ${thumbnails.length} screenshot thumbnails. Click on any thumbnail to view full size.`);
                    
                    // Sort thumbnails by last modified date
                    thumbnails.sort((a, b) => b.lastModified - a.lastModified);
                    
                    window.resultForAgent = {
                        result: thumbnails,
                        documentation: `
                            Array of screenshot thumbnail data. Each thumbnail object contains:
                            - name: string (filename including extension)
                            - size: number (file size in bytes)
                            - lastModified: number (timestamp in milliseconds)
                            - type: string (MIME type of the file)
                            - dataUrl: string (base64 data URL of the image for display)
                            
                            Files are sorted by last modified date (newest first).
                            Thumbnails are displayed in a responsive grid layout.
                            Click functionality allows viewing full-size images.
                        `
                    };
                }
            };

            reader.readAsDataURL(file);

            // Create info section
            const info = document.createElement('div');
            info.style.cssText = `
                margin-top: 10px;
                font-size: 12px;
                color: #666;
            `;

            const lastModified = new Date(file.lastModified).toLocaleDateString();
            info.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px; color: #333; font-size: 14px;">${file.name}</div>
                <div>Size: ${Math.round(file.size / 1024)} KB</div>
                <div>Modified: ${lastModified}</div>
            `;

            thumbnailCard.appendChild(img);
            thumbnailCard.appendChild(info);

            // Add click handler for full-size view
            thumbnailCard.addEventListener('click', () => {
                const modal = document.createElement('div');
                modal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    cursor: pointer;
                `;

                const fullImg = document.createElement('img');
                fullImg.src = img.src;
                fullImg.style.cssText = `
                    max-width: 90%;
                    max-height: 90%;
                    object-fit: contain;
                    border-radius: 8px;
                `;

                modal.appendChild(fullImg);
                document.body.appendChild(modal);

                modal.addEventListener('click', () => {
                    document.body.removeChild(modal);
                });
            });

            thumbnailGrid.appendChild(thumbnailCard);
        });
    }

    // Set initial result
    window.resultForAgent = {
        result: [],
        documentation: 'Screenshot thumbnail viewer initialized. Waiting for files to be selected.'
    };
}

// Start the thumbnail viewer when the page loads
displayScreenshotThumbnails();