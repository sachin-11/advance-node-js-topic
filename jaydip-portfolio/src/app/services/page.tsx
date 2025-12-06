'use client'

import { useState } from 'react'
import Image from 'next/image'
import GalleryLightbox from '@/components/GalleryLightbox'

export default function Services() {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Placeholder images - Replace with actual images from assets later
  const eventImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
    'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800&q=80',
  ]

  const portraitImages = [
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
    'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
  ]

  const lifestyleImages = [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
  ]

  const openLightbox = (images: string[], index: number) => {
    setLightboxIndex(index)
    // Set all images for lightbox
    setLightboxOpen(true)
  }

  const ServiceSection = ({ 
    title, 
    description, 
    images, 
    features 
  }: { 
    title: string
    description: string
    images: string[]
    features: string[]
  }) => (
    <div className="mb-16">
      <h2 className="heading-secondary mb-4">{title}</h2>
      <p className="text-body mb-6">{description}</p>
      
      {/* Features */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <span className="text-gray-900 mr-2">•</span>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative h-64 rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => openLightbox(images, index)}
          >
            <Image
              src={image}
              alt={`${title} ${index + 1}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300" />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="bg-white">
      <section className="section-padding">
        <div className="container-custom">
          <h1 className="heading-primary text-center mb-4">Services</h1>
          <p className="text-center text-body max-w-3xl mx-auto mb-12">
            Comprehensive photography and videography services for all your special moments
          </p>

          {/* Events */}
          <ServiceSection
            title="Events"
            description="Capture the magic of your special events with professional photography and videography services."
            images={eventImages}
            features={[
              'Wedding Photography',
              'Pre-wedding Shoots',
              'Engagement Ceremonies',
              'Full Day Coverage',
              'Candid & Traditional Shots',
              'Multiple Photographers Available',
            ]}
          />

          {/* Portraits */}
          <ServiceSection
            title="Portraits"
            description="Beautiful portrait sessions to capture your family's precious moments and milestones."
            images={portraitImages}
            features={[
              'Family Portraits',
              'Maternity Photography',
              'Newborn Sessions',
              'Individual Portraits',
              'Professional Studio Setup',
              'Outdoor & Indoor Options',
            ]}
          />

          {/* Lifestyle */}
          <ServiceSection
            title="Lifestyle"
            description="Creative lifestyle and model photography for fashion, commercial, and personal projects."
            images={lifestyleImages}
            features={[
              'Model Photography',
              'Fashion Shoots',
              'Commercial Photography',
              'Editorial Work',
              'Creative Concepts',
              'Professional Retouching',
            ]}
          />
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <GalleryLightbox
          images={[...eventImages, ...portraitImages, ...lifestyleImages]}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}

