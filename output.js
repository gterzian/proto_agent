(function() {
    "use strict";

    // Create UI elements
    const container = document.createElement('div');
    container.style.fontFamily = 'sans-serif';
    container.style.padding = '1em';

    const title = document.createElement('h2');
    title.textContent = 'Total File Size';
    container.appendChild(title);

    const resultP = document.createElement('p');
    container.appendChild(resultP);

    document.body.appendChild(container);

    if (typeof previousResultForAgent === 'undefined' || !previousResultForAgent.result || !Array.isArray(previousResultForAgent.result)) {
        resultP.textContent = 'Could not find previous results. Please run the file search again.';
        resultP.style.color = 'red';
        return;
    }

    const files = previousResultForAgent.result;
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    const formattedSize = formatBytes(totalSize);
    resultP.textContent = `The total size of the ${files.length} file(s) is: ${formattedSize}`;

    window.resultForAgent = {
        result: {
            totalSizeInBytes: totalSize,
            formattedSize: formattedSize,
            fileCount: files.length
        },
        documentation: {
            description: "An object containing the total size of the previously found files, both in bytes and as a human-readable string.",
            schema: {
                type: "object",
                properties: {
                    totalSizeInBytes: {
                        type: "number",
                        description: "The total size of all files in bytes."
                    },
                    formattedSize: {
                        type: "string",
                        description: "A human-readable string representing the total size (e.g., '1.23 MB')."
                    },
                    fileCount: {
                        type: "number",
                        description: "The number of files included in the calculation."
                    }
                },
                required: ["totalSizeInBytes", "formattedSize", "fileCount"]
            }
        }
    };

})();