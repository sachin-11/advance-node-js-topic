import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Home - Jaydip Suthar Photography',
  description: 'Professional portrait & wedding photographer and filmmaker based in Thasra, Gujarat',
}

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="absolute inset-0 z-0">
          {/* Hero Image - Replace with actual image */}
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900">
            <Image
              src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80"
              alt="Jaydip Suthar Photography"
              fill
              className="object-cover opacity-60"
              priority
              unoptimized
            />
          </div>
        </div>
        
        <div className="relative z-10 text-center px-4 container-custom">
          <h1 className="heading-primary text-white mb-6">
            I am Jaydip Suthar
          </h1>
          <p className="text-2xl md:text-3xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Portrait & Wedding Photographer / Filmmaker based in Thasra, Gujarat
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary bg-white text-gray-900 hover:bg-gray-100">
              Book a Session
            </Link>
            <Link href="/portfolio" className="btn-secondary border-white text-white hover:bg-white hover:text-gray-900">
              View Portfolio
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </section>

      {/* Featured Services */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <h2 className="heading-secondary text-center mb-12">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Events */}
            <div className="text-center">
              <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80"
                  alt="Wedding Photography"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-300"
                  unoptimized
                />
              </div>
              <h3 className="text-2xl font-bold mb-2">Events</h3>
              <p className="text-gray-600">
                Weddings, Pre-weddings, Engagements
              </p>
            </div>

            {/* Portraits */}
            <div className="text-center">
              <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80"
                  alt="Portrait Photography"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-300"
                  unoptimized
                />
              </div>
              <h3 className="text-2xl font-bold mb-2">Portraits</h3>
              <p className="text-gray-600">
                Family, Maternity Portraits
              </p>
            </div>

            {/* Lifestyle */}
            <div className="text-center">
              <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80"
                  alt="Lifestyle Photography"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-300"
                  unoptimized
                />
              </div>
              <h3 className="text-2xl font-bold mb-2">Lifestyle</h3>
              <p className="text-gray-600">
                Model Photography
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/services" className="btn-secondary">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Experience Banner */}
      <section className="section-padding bg-gray-900 text-white">
        <div className="container-custom text-center">
          <h2 className="heading-secondary text-white mb-4">
            6+ Years of Experience
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Capturing life's most precious moments with creativity, passion, and professional excellence.
          </p>
        </div>
      </section>
    </div>
  )
}

