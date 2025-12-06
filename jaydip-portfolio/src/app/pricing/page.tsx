import Link from 'next/link'

export const metadata = {
  title: 'Pricing & Packages - Jaydip Suthar Photography',
  description: 'Wedding photography packages and pricing. Wedding luxury package available.',
}

export default function Pricing() {
  return (
    <div className="bg-white">
      <section className="section-padding">
        <div className="container-custom">
          <h1 className="heading-primary text-center mb-4">Pricing & Packages</h1>
          <p className="text-center text-body max-w-3xl mx-auto mb-12">
            Professional photography packages tailored to your needs
          </p>

          {/* Wedding Luxury Package */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-8 md:p-12 border-2 border-gray-900">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-2">Wedding Luxury</h2>
                <p className="text-2xl text-gray-700">₹1,26,000</p>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">Package Includes:</h3>
                <ul className="space-y-3 text-body">
                  <li className="flex items-start">
                    <span className="text-gray-900 mr-2">•</span>
                    <span>Full day wedding coverage (Pre-wedding to Reception)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 mr-2">•</span>
                    <span>Professional photography team</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 mr-2">•</span>
                    <span>4K videography with cinematic edits</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 mr-2">•</span>
                    <span>Drone coverage (where permitted)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 mr-2">•</span>
                    <span>High-resolution edited photos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 mr-2">•</span>
                    <span>Highlight video (5-7 minutes)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 mr-2">•</span>
                    <span>Full wedding video</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 mr-2">•</span>
                    <span>Digital album with all photos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 mr-2">•</span>
                    <span>Premium photo editing & color grading</span>
                  </li>
                </ul>
              </div>

              {/* Payment Schedule */}
              <div className="bg-white rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Payment Schedule</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">Booking Advance</span>
                    <span className="text-lg font-semibold">50% (₹63,000)</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">Before Event</span>
                    <span className="text-lg font-semibold">30% (₹37,800)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">On Delivery</span>
                    <span className="text-lg font-semibold">20% (₹25,200)</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t-2 mt-2">
                    <span className="font-bold text-lg">Total</span>
                    <span className="text-xl font-bold">₹1,26,000</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Link href="/contact" className="btn-primary inline-block">
                  Book This Package
                </Link>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Prices are subject to change. Travel and accommodation 
                  charges may apply for destinations outside Thasra. Please contact for custom 
                  packages and additional services.
                </p>
              </div>
            </div>
          </div>

          {/* Other Packages Note */}
          <div className="mt-12 text-center">
            <p className="text-body mb-4">
              Looking for a custom package? Contact us to discuss your requirements.
            </p>
            <Link href="/contact" className="btn-secondary">
              Request Custom Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

