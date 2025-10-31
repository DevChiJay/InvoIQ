'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface UploadChatProps {
  onExtract: (formData: FormData) => void;
  isLoading?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function UploadChat({ onExtract, isLoading }: UploadChatProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');

  const validateAndSetFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, etc.)');
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return false;
    }

    setSelectedFile(file);
    return true;
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, [validateAndSetFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleExtract = () => {
    if (!selectedFile && !textInput.trim()) {
      toast.error('Please provide an image or text to extract');
      return;
    }

    const formData = new FormData();
    
    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    
    if (textInput.trim()) {
      formData.append('text', textInput.trim());
    }

    onExtract(formData);
  };

  const canExtract = selectedFile || textInput.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Invoice Screenshot (Optional)</CardTitle>
          <CardDescription>
            Drag and drop an image or click to select
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50',
              selectedFile && 'border-primary bg-primary/5'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              {selectedFile ? (
                <>
                  <div>
                    <p className="font-semibold text-lg">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    disabled={isLoading}
                  >
                    Remove
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <p className="font-semibold">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, JPEG up to 10MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Text Context (Optional)</CardTitle>
          <CardDescription>
            Add extra details or paste invoice text to enhance extraction accuracy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="text-input">Invoice Text or Additional Details</Label>
            <Textarea
              id="text-input"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your invoice text here or add additional context...&#10;&#10;Example:&#10;Invoice #INV-001&#10;Client: John Doe&#10;Email: john@example.com&#10;&#10;Web Development - $1000&#10;Logo Design - $500&#10;&#10;Total: $1500"
              className="min-h-[200px] font-mono text-sm"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              {textInput.length} characters • You can provide image only, text only, or both for better accuracy
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Extract Button */}
      <Button
        onClick={handleExtract}
        disabled={!canExtract || isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {isLoading ? 'Extracting Invoice Data...' : 'Extract Invoice Data'}
      </Button>
    </div>
  );
}
