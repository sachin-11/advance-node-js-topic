import Image from 'next/image'

export const metadata = {
  title: 'About - Jaydip Suthar Photography',
  description: 'Learn about Jaydip Suthar, professional photographer and filmmaker with 6+ years of experience',
}

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
                alt="Jaydip Suthar"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            
            <div>
              <h1 className="heading-primary mb-6">About Me</h1>
              <div className="space-y-4 text-body">
                <p>
                  I am Jaydip Suthar, a passionate portrait & wedding photographer and filmmaker 
                  based in Thasra, Gujarat. With over 6 years of experience in the field, I have 
                  dedicated my career to capturing life's most precious moments with creativity 
                  and artistic vision.
                </p>
                <p>
                  My journey in photography began with a deep love for storytelling through images. 
                  Whether it's the joy of a wedding celebration, the intimacy of a family portrait, 
                  or the elegance of a pre-wedding shoot, I strive to create timeless memories that 
                  reflect the true essence of each moment.
                </p>
                <p>
                  Specializing in wedding photography, portraits, and lifestyle shoots, I combine 
                  technical expertise with an artistic eye to deliver exceptional results. Every 
                  project is approached with attention to detail, professionalism, and a commitment 
                  to exceeding client expectations.
                </p>
                <p>
                  Based in Thasra, Gujarat, I serve clients across the region and beyond, bringing 
                  a unique perspective and professional service to every assignment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience & Skills */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="heading-secondary">Experience</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">6+ Years Professional Experience</h3>
                  <p className="text-gray-600">
                    Extensive experience in wedding photography, portrait sessions, and 
                    videography, serving clients across Gujarat and beyond.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="heading-secondary">Specializations</h2>
              <ul className="space-y-2 text-body">
                <li className="flex items-start">
                  <span className="text-gray-900 mr-2">•</span>
                  <span>Wedding Photography & Videography</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-900 mr-2">•</span>
                  <span>Pre-wedding & Engagement Shoots</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-900 mr-2">•</span>
                  <span>Family & Maternity Portraits</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-900 mr-2">•</span>
                  <span>Lifestyle & Model Photography</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-900 mr-2">•</span>
                  <span>Post-production & Photo Editing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-900 mr-2">•</span>
                  <span>Video Editing & Cinematography</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

