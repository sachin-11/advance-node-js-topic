import Image from 'next/image'

export const metadata = {
  title: 'Our Process - Jaydip Suthar Photography',
  description: 'Our 4-step process: Consult, Plan, Shoot, Deliver',
}

export default function Process() {
  const steps = [
    {
      number: '01',
      title: 'Consult',
      description: 'We start with a consultation to understand your vision, preferences, and requirements. This can be done in person, over the phone, or via video call. We discuss your event details, style preferences, timeline, and any special requests.',
    },
    {
      number: '02',
      title: 'Plan',
      description: 'Based on our consultation, we create a customized plan for your shoot. This includes timeline, shot list, locations (if applicable), outfit suggestions, and all logistics. We ensure every detail is covered for a smooth experience.',
    },
    {
      number: '03',
      title: 'Shoot',
      description: 'On the day of your event or session, we arrive prepared and ready to capture every special moment. Our team works professionally, ensuring natural and candid shots while also capturing traditional poses. We adapt to lighting conditions and work efficiently.',
    },
    {
      number: '04',
      title: 'Deliver',
      description: 'After the shoot, we carefully curate and edit your photos and videos. We deliver high-resolution images and professionally edited videos via secure digital download. All deliverables are provided within the agreed timeline.',
    },
  ]

  return (
    <div className="bg-white">
      <section className="section-padding">
        <div className="container-custom">
          <h1 className="heading-primary text-center mb-4">Our Process</h1>
          <p className="text-center text-body max-w-3xl mx-auto mb-12">
            A simple 4-step process to ensure your photography experience is seamless
          </p>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="relative h-64 md:h-96 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={[
                        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80', // Consult
                        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80', // Plan
                        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', // Shoot
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80', // Deliver
                      ][index]}
                      alt={step.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>

                <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-6xl font-bold text-gray-200">
                      {step.number}
                    </span>
                    <h2 className="heading-secondary mb-0">{step.title}</h2>
                  </div>
                  <p className="text-body">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-xl text-gray-700 mb-6">
              Ready to start your photography journey?
            </p>
            <a href="/contact" className="btn-primary">
              Get In Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

