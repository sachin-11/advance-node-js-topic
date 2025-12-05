const Contact = () => {
  const handleEmailClick = () => {
    window.location.href = 'mailto:rajeshsachin786@gmail.com'
  }

  const handlePhoneClick = () => {
    window.location.href = 'tel:+917041200380'
  }

  return (
    <section 
      id="contact" 
      className="py-20 px-4"
      aria-labelledby="contact-heading"
    >
      <div className="max-w-4xl mx-auto">
        <h2 
          id="contact-heading"
          className="text-4xl md:text-5xl font-bold mb-12 text-center text-teal-400"
        >
          Get In Touch
        </h2>
        
        <div className="bg-gray-800 rounded-lg p-8 md:p-12">
          <p className="text-lg text-gray-300 text-center mb-8">
            I'm always open to discussing new opportunities, interesting projects, or just having a chat about technology.
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <a
              href="mailto:rajeshsachin786@gmail.com"
              onClick={handleEmailClick}
              className="flex items-center gap-3 px-6 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors duration-200 focus-visible-teal"
              aria-label="Send email to rajeshsachin786@gmail.com"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Me
            </a>
            
            <a
              href="tel:+917041200380"
              onClick={handlePhoneClick}
              className="flex items-center gap-3 px-6 py-4 border-2 border-teal-600 text-teal-400 hover:bg-teal-600 hover:text-white rounded-lg font-semibold transition-colors duration-200 focus-visible-teal"
              aria-label="Call 7041200380"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +91 7041200380
            </a>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-2">Location</p>
            <p className="text-gray-300">Prayag Raj, Uttar Pradesh, India</p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-2">Languages</p>
            <p className="text-gray-300">English, Hindi</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact

