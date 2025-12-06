import Link from 'next/link'

export const metadata = {
  title: 'Post-Production - Jaydip Suthar Photography',
  description: 'Photo editing, video editing, and delivery services',
}

export default function PostProduction() {
  return (
    <div className="bg-white">
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <h1 className="heading-primary text-center mb-4">Post-Production</h1>
          <p className="text-center text-body max-w-3xl mx-auto mb-12">
            Professional editing and delivery services for all your photography needs
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Photo Editing */}
            <div className="bg-gray-50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Photo Editing</h2>
              <ul className="space-y-3 text-body">
                <li className="flex items-start">
                  <span className="text-gray-900 mr-2">•</span>
                  <span>Color correction and grading</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-900 mr-2">•</span>
                  <span>Professional retouching</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-900 mr-2">•</span>
                  <span>Background adjustments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-900 mr-2">•</span>
                  <span>Skin smoothing and enhancement</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-900 mr-2">•</span>
                  <span>High-resolution output</span>
                </li>
              </ul>
            </div>

            {/* Video Editing */}
            <div className="bg-gray-50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Video Editing</h2>
              <ul className="space-y-3 text-body">
                <li className="flex items-start">
                  <span className="text-gray-900 mr-2">•</span>
                  <span>4K video editing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-900 mr-2">•</span>
                  <span>Cinematic color grading</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-900 mr-2">•</span>
                  <span>Music and sound design</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-900 mr-2">•</span>
                  <span>Multiple format delivery</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-900 mr-2">•</span>
                  <span>Drone footage integration</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Video Lengths */}
          <div className="mb-12">
            <h2 className="heading-secondary mb-6">Video Deliverables</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-gray-900 pl-6">
                <h3 className="text-xl font-semibold mb-2">Highlight Video</h3>
                <p className="text-body">
                  5-7 minutes of the best moments from your event, set to music with 
                  cinematic edits. Perfect for sharing on social media.
                </p>
              </div>
              <div className="border-l-4 border-gray-900 pl-6">
                <h3 className="text-xl font-semibold mb-2">Full Event Video</h3>
                <p className="text-body">
                  Complete coverage of your event with all major ceremonies and moments 
                  captured and edited professionally.
                </p>
              </div>
              <div className="border-l-4 border-gray-900 pl-6">
                <h3 className="text-xl font-semibold mb-2">Additional Edits</h3>
                <p className="text-body">
                  Custom video edits available upon request, including teaser videos, 
                  ceremony-only edits, and specific moment highlights.
                </p>
              </div>
            </div>
          </div>

          {/* Photo Book */}
          <div className="mb-12">
            <h2 className="heading-secondary mb-6">Photo Book</h2>
            <p className="text-body mb-4">
              Premium photo books available as add-on service. Choose from various sizes 
              and cover options. Perfect for preserving your memories in a tangible format.
            </p>
            <ul className="space-y-2 text-body">
              <li className="flex items-start">
                <span className="text-gray-900 mr-2">•</span>
                <span>Multiple size options (8x8, 10x10, 12x12 inches)</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-900 mr-2">•</span>
                <span>Premium paper quality</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-900 mr-2">•</span>
                <span>Hardcover and softcover options</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-900 mr-2">•</span>
                <span>Custom layout design</span>
              </li>
            </ul>
          </div>

          {/* Delivery Timeline */}
          <div className="bg-gray-50 p-8 rounded-lg">
            <h2 className="heading-secondary mb-6">Delivery Timeline</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-medium">Edited Photos</span>
                <span className="text-gray-700">4-6 weeks</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-medium">Highlight Video</span>
                <span className="text-gray-700">6-8 weeks</span>
              </div>
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-medium">Full Wedding Video</span>
                <span className="text-gray-700">10-12 weeks</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Photo Book (if ordered)</span>
                <span className="text-gray-700">Additional 2-3 weeks</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-6">
              <strong>Note:</strong> Timeline may vary during peak season. Rush delivery 
              available with additional charges. Contact us for specific timelines.
            </p>
          </div>

          <div className="mt-12 text-center">
            <Link href="/contact" className="btn-primary">
              Inquire About Post-Production Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

