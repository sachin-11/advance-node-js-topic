import Link from 'next/link'

export const metadata = {
  title: 'How to Book - Jaydip Suthar Photography',
  description: 'Simple steps to book your photography session',
}

export default function HowToBook() {
  const steps = [
    {
      number: 1,
      title: 'Contact',
      description: 'Reach out to us via phone, email, or the contact form. Let us know about your event type, date, and location. We\'ll respond within 24 hours to discuss your requirements.',
    },
    {
      number: 2,
      title: 'Consultation',
      description: 'We schedule a consultation (in-person, phone, or video call) to understand your vision, preferences, and specific needs. This helps us create a customized plan for your event.',
    },
    {
      number: 3,
      title: 'Confirm Date',
      description: 'Once we align on all details, we send you a detailed proposal with package options and pricing. Secure your date by confirming the booking with a 50% advance payment.',
    },
    {
      number: 4,
      title: 'Photo Session',
      description: 'On your event day, our team arrives well-prepared to capture every special moment. We work professionally and ensure you\'re comfortable throughout the session.',
    },
    {
      number: 5,
      title: 'Instalments',
      description: 'Complete the remaining payments as per schedule: 30% before the event and 20% upon delivery. All deliverables are provided within the agreed timeline.',
    },
  ]

  return (
    <div className="bg-white">
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <h1 className="heading-primary text-center mb-4">How to Book</h1>
          <p className="text-center text-body max-w-3xl mx-auto mb-12">
            Simple steps to secure your photography session
          </p>

          <div className="space-y-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex gap-6 p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{step.title}</h2>
                  <p className="text-body">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gray-900 text-white p-8 rounded-lg text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Book?</h2>
            <p className="text-gray-300 mb-6">
              Get in touch today to discuss your photography needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-primary bg-white text-gray-900 hover:bg-gray-100">
                Contact Us
              </Link>
              <Link href="/pricing" className="btn-secondary border-white text-white hover:bg-white hover:text-gray-900">
                View Pricing
              </Link>
            </div>
          </div>

          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold mb-2">Important Notes:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Bookings are confirmed on first-come, first-served basis</li>
              <li>• Early booking recommended, especially for peak season dates</li>
              <li>• Date availability subject to prior bookings</li>
              <li>• Custom packages available upon request</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

