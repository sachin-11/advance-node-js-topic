import { useState, useEffect } from 'react'

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleDownloadResume = async () => {
    try {
      // Fetch the PDF file
      const response = await fetch('/resume.pdf', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch resume: ${response.status}`)
      }
      
      // Get the blob data
      const blob = await response.blob()
      
      // Verify blob has content
      if (blob.size === 0) {
        throw new Error('Empty file received')
      }
      
      // Ensure correct MIME type for PDF
      const pdfBlob = blob.type === 'application/pdf' 
        ? blob 
        : new Blob([blob], { type: 'application/pdf' })
      
      // Create object URL
      const blobUrl = window.URL.createObjectURL(pdfBlob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = 'Sachin_Singh_Resume.pdf'
      link.style.display = 'none'
      
      // Append to body, click, and remove
      document.body.appendChild(link)
      link.click()
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      }, 100)
      
    } catch (error) {
      console.error('Error downloading resume:', error)
      // Fallback: open in new tab for user to manually download
      window.open('/resume.pdf', '_blank')
    }
  }

  return (
    <section 
      id="hero" 
      className="min-h-screen flex items-center justify-center px-4 py-20"
      aria-label="Hero section"
    >
      <div className={`max-w-4xl mx-auto text-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
          Sachin Singh
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-4">
          Backend Developer
        </p>
        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          6+ years of expertise in Node.js, NestJS, and scalable API development
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="#contact"
            className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors duration-200 focus-visible-teal"
            aria-label="Go to contact section"
          >
            Get In Touch
          </a>
          <button
            onClick={handleDownloadResume}
            className="px-8 py-3 border-2 border-teal-600 text-teal-400 hover:bg-teal-600 hover:text-white rounded-lg font-semibold transition-colors duration-200 focus-visible-teal"
            aria-label="Download resume PDF"
          >
            Download Resume
          </button>
        </div>
        <div className="mt-12 flex justify-center gap-6">
          <a
            href="#about"
            className="text-teal-400 hover:text-teal-300 transition-colors focus-visible-teal rounded"
            aria-label="Scroll to about section"
          >
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero

