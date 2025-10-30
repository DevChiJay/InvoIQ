'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Loader2 } from 'lucide-react';
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
  const [mode, setMode] = useState<'file' | 'text'>('file');

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
    setMode('file');
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
    if (mode === 'file' && !selectedFile) {
      toast.error('Please select a file to extract');
      return;
    }
    
    if (mode === 'text' && !textInput.trim()) {
      toast.error('Please enter invoice text to extract');
      return;
    }

    const formData = new FormData();
    
    if (mode === 'file' && selectedFile) {
      formData.append('file', selectedFile);
    } else if (mode === 'text' && textInput.trim()) {
      formData.append('text', textInput.trim());
    }

    onExtract(formData);
  };

  const canExtract = (mode === 'file' && selectedFile) || (mode === 'text' && textInput.trim().length > 0);

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'file' ? 'default' : 'outline'}
          onClick={() => setMode('file')}
          disabled={isLoading}
          className="flex-1"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
        <Button
          variant={mode === 'text' ? 'default' : 'outline'}
          onClick={() => setMode('text')}
          disabled={isLoading}
          className="flex-1"
        >
          <FileText className="mr-2 h-4 w-4" />
          Paste Text
        </Button>
      </div>

      {/* File Upload Mode */}
      {mode === 'file' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Invoice Screenshot</CardTitle>
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
      )}

      {/* Text Input Mode */}
      {mode === 'text' && (
        <Card>
          <CardHeader>
            <CardTitle>Paste Invoice Text</CardTitle>
            <CardDescription>
              Copy and paste invoice text or chat conversation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="text-input">Invoice Text</Label>
              <Textarea
                id="text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste your invoice text here...&#10;&#10;Example:&#10;Invoice #INV-001&#10;Client: John Doe&#10;Email: john@example.com&#10;&#10;Web Development - $1000&#10;Logo Design - $500&#10;&#10;Total: $1500"
                className="min-h-[300px] font-mono text-sm"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {textInput.length} characters
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
