'use client'

import { useState } from 'react'
import Image from 'next/image'
import GalleryLightbox from '@/components/GalleryLightbox'

export default function Portfolio() {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Placeholder gallery images - Replace with your actual images later
  const allImages = [
    // Events
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
    'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80',
    // Portraits
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
    'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
    // Lifestyle
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
  ]

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <div className="bg-white">
      <section className="section-padding">
        <div className="container-custom">
          <h1 className="heading-primary text-center mb-4">Portfolio</h1>
          <p className="text-center text-body max-w-3xl mx-auto mb-12">
            A collection of our finest work across weddings, portraits, and lifestyle photography
          </p>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allImages.map((image, index) => (
              <div
                key={index}
                className="relative h-64 md:h-80 rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={image}
                  alt={`Portfolio image ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300" />
              </div>
            ))}
          </div>

          {/* Categories */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Events</h2>
              <p className="text-gray-600">
                Weddings, Pre-weddings, and Engagement ceremonies
              </p>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Portraits</h2>
              <p className="text-gray-600">
                Family, Maternity, and Individual portraits
              </p>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Lifestyle</h2>
              <p className="text-gray-600">
                Model and Lifestyle photography
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a href="/contact" className="btn-primary">
              Book Your Session
            </a>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <GalleryLightbox
          images={allImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}

