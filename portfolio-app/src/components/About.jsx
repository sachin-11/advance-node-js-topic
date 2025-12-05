const About = () => {
  const skills = ['Node.js', 'AWS', 'ReactJS', 'CI/CD', 'NestJS', 'MongoDB', 'Stripe', 'Payment Gateways', 'REST APIs', 'Real-time Communication']

  return (
    <section 
      id="about" 
      className="py-20 px-4 bg-gray-800"
      aria-labelledby="about-heading"
    >
      <div className="max-w-6xl mx-auto">
        <h2 
          id="about-heading"
          className="text-4xl md:text-5xl font-bold mb-12 text-center text-teal-400"
        >
          About Me
        </h2>
        
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <p className="text-lg text-gray-300 leading-relaxed">
              Experienced Backend Developer with <strong className="text-teal-400">6+ years</strong> of expertise in designing, developing, and maintaining scalable APIs using Node.js and NestJS.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Proven ability to lead backend architecture for live production applications across industries including <strong className="text-teal-400">ecommerce, education, healthcare, and community platforms</strong>.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Skilled in payment gateway integrations (Stripe, ACH, Apple Pay, Cash Pay), cron job automation, and real-time communication features. Strong client-facing experience with effective communication and problem-solving skills.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Successfully delivered high-impact projects like <strong className="text-teal-400">Seekrz, Cellcast (Australia), Pondir</strong>, and platforms for Indian communities and medical services. Recognized for both technical contribution and commitment to delivery timelines.
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-6 text-teal-400">Skills</h3>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gray-700 text-teal-300 rounded-lg font-medium hover:bg-gray-600 transition-colors focus-visible-teal"
                  tabIndex={0}
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4 text-teal-400">Education</h3>
              <div className="bg-gray-700 p-6 rounded-lg">
                <h4 className="text-xl font-semibold text-white mb-2">Master of Computer Applications (MCA)</h4>
                <p className="text-gray-300">Bharati Vidyapeeth, Pune</p>
                <p className="text-gray-400 text-sm mt-1">Graduated: July 2017</p>
                <p className="text-gray-300 mt-3 text-sm">
                  Awarded for Outstanding Performance in Cricket at the college level, demonstrating teamwork, discipline, and dedication.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About

