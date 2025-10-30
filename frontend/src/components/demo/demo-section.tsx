'use client';

import { useState } from 'react';
import DemoExtractionForm from './demo-extraction-form';
import DemoInvoicePreview from './demo-invoice-preview';
import DemoSignupPrompt from './demo-signup-prompt';
import type { ExtractionResponse } from '@/types/api';

export default function DemoSection() {
  const [extractedData, setExtractedData] = useState<ExtractionResponse | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  const handleExtractionSuccess = (data: ExtractionResponse) => {
    setExtractedData(data);
    // Show signup prompt after a short delay for better UX
    setTimeout(() => {
      setShowSignupPrompt(true);
    }, 1000);
  };

  const handleReset = () => {
    setExtractedData(null);
    setShowSignupPrompt(false);
  };

  return (
    <section id="demo" className="py-24 bg-gradient-to-b from-white via-cyan-50/20 to-white dark:from-gray-900 dark:via-cyan-950/10 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Try It Out - <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">No Signup Required</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Experience the power of AI-driven invoice extraction. Paste your invoice text below and watch 
            our AI extract all the important details in seconds.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {!extractedData ? (
            <DemoExtractionForm onSuccess={handleExtractionSuccess} />
          ) : (
            <div className="space-y-6">
              <DemoInvoicePreview extractionData={extractedData} />
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 text-base font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 rounded-lg transition-all border-2 border-teal-200 dark:border-teal-800"
                >
                  Try Another Invoice
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DemoSignupPrompt 
        isOpen={showSignupPrompt} 
        onClose={() => setShowSignupPrompt(false)} 
      />
    </section>
  );
}
