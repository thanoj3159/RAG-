export const uploadPDF = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002';
        const response = await fetch(`${apiUrl}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload file');
        }

        const data = await response.json();
        console.log('Upload successful:', data);
        return data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};
