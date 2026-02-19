import axios from 'axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadImageToCloudinary = async (
  file: File,
  options?: {
    folder?: string;
    onProgress?: (percent: number) => void;
  }
): Promise<string> => {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', options?.folder || 'jewellery/products');

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (!options?.onProgress || !progressEvent.total) return;

        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        options.onProgress(percent);
      },
    }
  );

  return response.data.secure_url;
};

export const uploadMultipleImages = async (
  files: File[],
  options?: {
    folder?: string;
    onProgress?: (percent: number) => void;
  }
): Promise<string[]> => {
  const totalFiles = files.length;
  let completedFiles = 0;

  const urls = await Promise.all(
    files.map(async (file) => {
      const url = await uploadImageToCloudinary(file, {
        folder: options?.folder,
        onProgress: (fileProgress) => {
          if (!options?.onProgress) return;

          /**
           * Each file contributes equally to total progress
           */
          const baseProgress =
            (completedFiles / totalFiles) * 100;

          const currentFileContribution =
            fileProgress / totalFiles;

          const totalProgress = Math.min(
            Math.round(baseProgress + currentFileContribution),
            100
          );

          options.onProgress(totalProgress);
        },
      });

      completedFiles += 1;

      // Snap progress forward after file completes
      options?.onProgress?.(
        Math.round((completedFiles / totalFiles) * 100)
      );

      return url;
    })
  );

  return urls;
};
