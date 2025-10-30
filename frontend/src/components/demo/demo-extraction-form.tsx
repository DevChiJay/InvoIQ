'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { extractionAPI } from '@/lib/api';
import { transformExtractionResponse, SAMPLE_INVOICE_TEXT } from '@/lib/extraction-transformer';
import type { ExtractionResponse } from '@/types/api';

interface DemoExtractionFormProps {
  onSuccess?: (data: ExtractionResponse) => void;
}

export default function DemoExtractionForm({ onSuccess }: DemoExtractionFormProps) {
  const [text, setText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!text.trim()) {
      setError('Please enter some invoice text');
      return;
    }

    setIsExtracting(true);
    setError(null);

    try {
      // Create FormData with text field
      const formData = new FormData();
      formData.append('text', text);

      // Call extraction API (works without authentication for demo)
      const response = await extractionAPI.extractJobDetails(formData);
      
      // Transform backend response to frontend format
      const transformedData = transformExtractionResponse(response.data);
      
      if (onSuccess) {
        onSuccess(transformedData);
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setError('Failed to extract invoice data. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUseExample = () => {
    setText(SAMPLE_INVOICE_TEXT);
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="invoice-text" className="text-lg font-semibold">
            Paste Invoice Text
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUseExample}
            disabled={isExtracting}
          >
            Use Example
          </Button>
        </div>
        <Textarea
          id="invoice-text"
          placeholder="Paste your invoice text here... (from email, PDF, or document)"
          value={text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
          className="min-h-[300px] font-mono text-sm"
          disabled={isExtracting}
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <Button
        onClick={handleExtract}
        disabled={isExtracting || !text.trim()}
        size="lg"
        className="w-full gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all text-base py-6"
      >
        {isExtracting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Extracting Data...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Extract Invoice Data
          </>
        )}
      </Button>
    </div>
  );
}
