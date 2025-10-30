import { Upload, Scan, CheckCircle2, Download } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload or Paste',
    description: 'Upload an invoice image or paste invoice text from an email or document.',
    color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-[#6366F1]',
    gradient: 'from-[#6366F1] to-indigo-600',
  },
  {
    icon: Scan,
    title: 'AI Extracts Data',
    description: 'Our AI scans and extracts client details, line items, amounts, and dates automatically.',
    color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-[#14B8A6]',
    gradient: 'from-[#14B8A6] to-teal-600',
  },
  {
    icon: CheckCircle2,
    title: 'Review & Edit',
    description: 'Review the extracted data and make any necessary adjustments before saving.',
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-[#FACC15]',
    gradient: 'from-[#FACC15] to-yellow-600',
  },
  {
    icon: Download,
    title: 'Generate PDF',
    description: 'Create a professional PDF invoice ready to send to your client.',
    color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-[#6366F1]',
    gradient: 'from-[#6366F1] to-indigo-700',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-white via-indigo-50/20 to-white dark:from-[#0F172A] dark:via-[#1a2642]/20 dark:to-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-[#E2E8F0] mb-4">
            How It <span className="bg-gradient-to-r from-[#6366F1] to-[#14B8A6] bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-[#E2E8F0]/80 max-w-3xl mx-auto">
            From messy invoice data to professional PDFs in just 4 simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-teal-200 via-emerald-200 to-cyan-200 dark:from-teal-800 dark:via-emerald-800 dark:to-cyan-800 rounded-full" 
               style={{ marginLeft: '10%', marginRight: '10%' }} 
          />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Step number */}
                <div className="flex flex-col items-center text-center">
                  <div className={`relative z-10 p-5 rounded-2xl ${step.color} mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <Icon className="h-10 w-10" />
                  </div>
                  <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br ${step.gradient} rounded-full flex items-center justify-center font-bold text-sm z-20 text-white shadow-md`}>
                    {index + 1}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
