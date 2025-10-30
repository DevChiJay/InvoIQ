'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Freelance Designer',
      content: 'InvoIQ saved me 10+ hours every week. I used to manually enter invoice data, now it\'s done in seconds. Game changer!',
      rating: 5,
      avatar: 'SC',
    },
    {
      name: 'Michael Rodriguez',
      role: 'Agency Owner',
      content: 'The AI extraction is incredibly accurate. We process 50+ invoices daily and InvoIQ handles them flawlessly.',
      rating: 5,
      avatar: 'MR',
    },
    {
      name: 'Emily Thompson',
      role: 'Consultant',
      content: 'Love the payment tracking features. Getting paid on time has never been easier. Highly recommend!',
      rating: 5,
      avatar: 'ET',
    },
    {
      name: 'David Park',
      role: 'Small Business Owner',
      content: 'Simple, powerful, and affordable. InvoIQ is exactly what I needed to manage my invoicing workflow.',
      rating: 5,
      avatar: 'DP',
    },
    {
      name: 'Lisa Anderson',
      role: 'Marketing Director',
      content: 'The Pro plan is worth every penny. Payment links and automated reminders have improved our cash flow significantly.',
      rating: 5,
      avatar: 'LA',
    },
    {
      name: 'James Wilson',
      role: 'Web Developer',
      content: 'Clean interface, powerful AI, and great support. InvoIQ is the best invoicing tool I\'ve used.',
      rating: 5,
      avatar: 'JW',
    },
  ];

  return (
    <section className="py-20 bg-white dark:bg-[#0F172A]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-[#E2E8F0]">
            Loved by <span className="bg-gradient-to-r from-[#6366F1] to-[#14B8A6] bg-clip-text text-transparent">Thousands</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-[#E2E8F0]/70 max-w-2xl mx-auto">
            See what our customers have to say about transforming their invoicing workflow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2 hover:border-[#14B8A6]/50 dark:hover:border-[#14B8A6] transition-colors">
              <CardContent className="pt-6">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#FACC15] text-[#FACC15]" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 dark:text-[#E2E8F0]/80 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-[#6366F1] to-[#14B8A6] text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-[#E2E8F0]">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-[#E2E8F0]/60">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
