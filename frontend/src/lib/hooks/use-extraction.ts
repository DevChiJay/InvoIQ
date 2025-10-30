import { useMutation } from '@tanstack/react-query';
import { extractionAPI } from '@/lib/api';

export const useExtraction = () => {
  return useMutation({
    mutationFn: (formData: FormData) => extractionAPI.extractJobDetails(formData),
  });
};

export const useExtractFromFile = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return extractionAPI.extractJobDetails(formData);
    },
  });
};

export const useExtractFromText = () => {
  return useMutation({
    mutationFn: async (text: string) => {
      const formData = new FormData();
      formData.append('text', text);
      return extractionAPI.extractJobDetails(formData);
    },
  });
};
