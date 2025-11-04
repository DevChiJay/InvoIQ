import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Scan, 
  Users, 
  FileText, 
  Download, 
  CreditCard, 
  Bell,
  Sparkles,
  Globe
} from 'lucide-react';

const features = [
  {
    icon: Scan,
    title: 'AI-Powered Extraction',
    description: 'Upload invoice images or paste text. Our AI instantly extracts client details, line items, and totals with 99% accuracy.',
    isPro: false,
  },
  {
    icon: Users,
    title: 'Smart Client Management',
    description: 'Organize all your clients in one place. Auto-create client profiles from extracted invoices.',
    isPro: false,
  },
  {
    icon: FileText,
    title: 'Invoice Organization',
    description: 'Track all your invoices with status updates (draft, sent, paid, overdue). Never lose track of payments.',
    isPro: false,
  },
  {
    icon: Download,
    title: 'Professional PDF Generation',
    description: 'Generate beautiful, professional PDF invoices instantly. Customizable templates and branding.',
    isPro: false,
  },
  {
    icon: CreditCard,
    title: 'Payment Links',
    description: 'Add payment links to your invoices and get paid faster. Supports multiple payment providers.',
    isPro: true,
  },
  {
    icon: Bell,
    title: 'Automated Reminders',
    description: 'Send automatic payment reminders to clients. Never chase payments manually again.',
    isPro: true,
  },
  {
    icon: Globe,
    title: 'Multi-Currency Support',
    description: 'Work with clients globally. Support for multiple currencies and automatic conversion.',
    isPro: true,
  },
  {
    icon: Sparkles,
    title: 'AI Data Validation',
    description: 'Our AI validates extracted data and flags potential errors before you save.',
    isPro: false,
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-[#0F172A] dark:via-[#1a2642]/30 dark:to-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-[#E2E8F0] mb-4">
            Everything You Need to <span className="bg-gradient-to-r from-[#6366F1] to-[#14B8A6] bg-clip-text text-transparent">Succeed</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-[#E2E8F0]/80 max-w-3xl mx-auto">
            From AI extraction to payment tracking, InvoYQ has all the tools you need 
            to streamline your invoicing workflow.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="relative overflow-hidden border-2 hover:border-[#14B8A6]/50 dark:hover:border-[#14B8A6] hover:shadow-lg transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-3 bg-gradient-to-br from-[#6366F1]/10 to-[#14B8A6]/10 group-hover:from-[#6366F1]/20 group-hover:to-[#14B8A6]/20 rounded-lg transition-colors">
                      <Icon className="h-6 w-6 text-[#6366F1] dark:text-[#14B8A6]" />
                    </div>
                    {feature.isPro && (
                      <Badge className="bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white border-none">
                        PRO
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-[#E2E8F0]/70 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
