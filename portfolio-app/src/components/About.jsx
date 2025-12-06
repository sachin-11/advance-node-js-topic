import { useState, useEffect, useRef } from 'react'
import SkillBar from './SkillBar'

const About = () => {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  const skills = [
    { name: 'Node.js', level: 95 },
    { name: 'NestJS', level: 90 },
    { name: 'AWS', level: 85 },
    { name: 'MongoDB', level: 90 },
    { name: 'REST APIs', level: 95 },
    { name: 'Payment Gateways', level: 90 },
    { name: 'ReactJS', level: 80 },
    { name: 'CI/CD', level: 85 },
    { name: 'Real-time Communication', level: 88 },
    { name: 'Stripe Integration', level: 92 }
  ]

  const techTags = ['Node.js', 'AWS', 'ReactJS', 'CI/CD', 'NestJS', 'MongoDB', 'Stripe', 'Payment Gateways', 'REST APIs', 'Real-time Communication', 'TypeScript', 'Docker', 'Redis', 'PostgreSQL']

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section 
      ref={sectionRef}
      id="about" 
      className="py-20 px-4 bg-gray-800 relative overflow-hidden"
      aria-labelledby="about-heading"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(20, 184, 166, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 
            id="about-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              About Me
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div 
            className={`space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="bg-gray-700/50 backdrop-blur-sm p-6 rounded-xl border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300">
              <p className="text-lg text-gray-300 leading-relaxed">
                Experienced Backend Developer with <strong className="text-teal-400">6+ years</strong> of expertise in designing, developing, and maintaining scalable APIs using Node.js and NestJS.
              </p>
            </div>
            <div className="bg-gray-700/50 backdrop-blur-sm p-6 rounded-xl border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300">
              <p className="text-lg text-gray-300 leading-relaxed">
                Proven ability to lead backend architecture for live production applications across industries including <strong className="text-teal-400">ecommerce, education, healthcare, and community platforms</strong>.
              </p>
            </div>
            <div className="bg-gray-700/50 backdrop-blur-sm p-6 rounded-xl border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300">
              <p className="text-lg text-gray-300 leading-relaxed">
                Skilled in payment gateway integrations (Stripe, ACH, Apple Pay, Cash Pay), cron job automation, and real-time communication features. Strong client-facing experience with effective communication and problem-solving skills.
              </p>
            </div>
            <div className="bg-gray-700/50 backdrop-blur-sm p-6 rounded-xl border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300">
              <p className="text-lg text-gray-300 leading-relaxed">
                Successfully delivered high-impact projects like <strong className="text-teal-400">Seekrz, Cellcast (Australia), Pondir</strong>, and platforms for Indian communities and medical services. Recognized for both technical contribution and commitment to delivery timelines.
              </p>
            </div>
          </div>

          <div 
            className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
            style={{ transitionDelay: '400ms' }}
          >
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-6 text-teal-400 flex items-center gap-2">
                <span className="w-1 h-8 bg-gradient-to-b from-teal-400 to-cyan-400 rounded-full"></span>
                Core Skills
              </h3>
              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <SkillBar 
                    key={index} 
                    skill={skill.name} 
                    level={skill.level} 
                    isVisible={isVisible}
                    delay={index * 100}
                  />
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 text-teal-400 flex items-center gap-2">
                <span className="w-1 h-8 bg-gradient-to-b from-teal-400 to-cyan-400 rounded-full"></span>
                Technologies
              </h3>
              <div className="flex flex-wrap gap-3">
                {techTags.map((tech, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-teal-300 rounded-lg font-medium hover:from-teal-600 hover:to-cyan-600 hover:text-white transition-all duration-300 hover:scale-105 cursor-default focus-visible-teal"
                    tabIndex={0}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-6 rounded-xl border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-teal-400 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                Education
              </h3>
              <div className="space-y-3">
                <h4 className="text-xl font-semibold text-white">Master of Computer Applications (MCA)</h4>
                <p className="text-gray-300 flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Bharati Vidyapeeth, Pune
                </p>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Graduated: July 2017
                </p>
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <p className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="text-teal-400 mt-1">🏆</span>
                    <span>Awarded for Outstanding Performance in Cricket at the college level, demonstrating teamwork, discipline, and dedication.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About


