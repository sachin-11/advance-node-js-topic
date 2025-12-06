import Link from 'next/link'

export const metadata = {
  title: 'Terms & Conditions - Jaydip Suthar Photography',
  description: 'Terms and conditions for photography services',
}

export default function Terms() {
  return (
    <div className="bg-white">
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <h1 className="heading-primary text-center mb-4">Terms & Conditions</h1>
          <p className="text-center text-gray-600 mb-12">
            Please read our terms and conditions before booking
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            {/* Travel & Accommodation */}
            <section>
              <h2 className="heading-secondary">Travel & Accommodation</h2>
              <p className="text-body">
                Travel and accommodation expenses are not included in the package price. 
                For events outside Thasra, additional charges will apply based on distance 
                and duration. Client will be responsible for arranging accommodation if 
                required for multi-day events.
              </p>
            </section>

            {/* Deliverables Timeline */}
            <section>
              <h2 className="heading-secondary">Deliverables Timeline</h2>
              <ul className="space-y-2 text-body">
                <li>
                  <strong>Photo Delivery:</strong> Edited photos will be delivered within 
                  4-6 weeks after the event date via digital download link.
                </li>
                <li>
                  <strong>Video Delivery:</strong> Highlight video will be delivered within 
                  6-8 weeks, and full wedding video within 10-12 weeks after the event date.
                </li>
                <li>
                  <strong>Rush Delivery:</strong> Rush delivery available upon request with 
                  additional charges. Contact for details.
                </li>
              </ul>
            </section>

            {/* Revision Policy */}
            <section>
              <h2 className="heading-secondary">Revision Policy</h2>
              <p className="text-body">
                We include standard color correction and basic editing in all packages. 
                Two rounds of revisions are included for video edits. Additional revisions 
                may incur extra charges. Major style changes requested after delivery may 
                require additional fees.
              </p>
            </section>

            {/* Cancellation Policy */}
            <section>
              <h2 className="heading-secondary">Cancellation Policy</h2>
              <ul className="space-y-2 text-body">
                <li>
                  <strong>Cancellation 30+ days before event:</strong> 50% of booking 
                  amount will be refunded.
                </li>
                <li>
                  <strong>Cancellation 15-30 days before event:</strong> 25% of booking 
                  amount will be refunded.
                </li>
                <li>
                  <strong>Cancellation less than 15 days before event:</strong> No refund. 
                  Date can be rescheduled subject to availability.
                </li>
                <li>
                  <strong>Rescheduling:</strong> One free reschedule allowed if requested 
                  30+ days in advance. Additional reschedules subject to availability and 
                  may incur charges.
                </li>
              </ul>
            </section>

            {/* Payment Terms */}
            <section>
              <h2 className="heading-secondary">Payment Terms</h2>
              <ul className="space-y-2 text-body">
                <li>50% advance payment required to confirm booking</li>
                <li>30% payment due before the event date</li>
                <li>20% final payment due upon delivery of all deliverables</li>
                <li>Late payments may result in delayed delivery</li>
              </ul>
            </section>

            {/* Usage Rights */}
            <section>
              <h2 className="heading-secondary">Usage Rights</h2>
              <p className="text-body">
                Client receives personal usage rights for all delivered photos and videos. 
                Photographer retains the right to use images for portfolio, marketing, and 
                promotional purposes unless otherwise agreed in writing. Commercial usage 
                requires separate agreement.
              </p>
            </section>

            {/* Force Majeure */}
            <section>
              <h2 className="heading-secondary">Force Majeure</h2>
              <p className="text-body">
                We are not liable for delays or cancellations due to circumstances beyond 
                our control including but not limited to natural disasters, pandemics, 
                government restrictions, or equipment failure. In such cases, we will 
                work with clients to reschedule or provide alternatives.
              </p>
            </section>

            {/* Liability */}
            <section>
              <h2 className="heading-secondary">Liability</h2>
              <p className="text-body">
                While we take utmost care, our liability is limited to the value of the 
                package. We recommend clients have backup arrangements for critical moments. 
                We are not responsible for lost data due to equipment malfunction, though 
                we maintain multiple backups.
              </p>
            </section>

            {/* Contact for Full Terms */}
            <div className="bg-gray-50 p-6 rounded-lg mt-8">
              <p className="text-body mb-4">
                <strong>Full Terms & Conditions:</strong> The above are key highlights. 
                For complete terms and conditions document, please contact us.
              </p>
              <Link href="/contact" className="btn-primary inline-block">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

