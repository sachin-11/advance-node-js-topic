import { useState, useEffect, useRef } from 'react'

const Experience = () => {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)
  
  const experiences = [
    {
      company: "Moon Technolabs",
      location: "Ahmedabad",
      position: "Sr. Node JS Developer",
      period: "07/2023 - Present",
      achievements: [
        "Working as a Backend Developer for Seekrz, a live mobile application available on both App Store and Play Store, designed for users and store owners across multiple locations",
        "Responsible for entire backend architecture and API development using Node.js, including client communication and technical discussions",
        "Designed and developed a key feature where one store can send a trade offer and another store can accept or reject it; integrated multiple cron jobs to automate trade handling (e.g., auto-cancel after 48 hours if not accepted)",
        "Implemented various payment integrations including Stripe, ACH direct debits, Apple Pay, and Cash Pay to enable seamless financial transactions",
        "Developed bulk order functionality and ensured high-performance API responses under heavy loads",
        "Built backend logic to support trade-related workflows, notification systems, and user/store authentication",
        "Also contributed to Austin Indian, a community platform to help Indians in Austin, Texas find local Indian restaurants easily – developed complete backend APIs to support search and filtering",
        "Developed backend APIs for a Speech Therapy Medical Application using NestJS, focusing on secure patient data handling, appointment scheduling, and session management"
      ]
    },
    {
      company: "ManekTech",
      location: "Ahmedabad",
      position: "Software Engineer (MERN)",
      period: "11/2021 - 05/2023",
      achievements: [
        "Handled complete backend development for Cellcast, an Australia-based project focused on bulk SMS communication and client engagement solutions",
        "Developed and maintained robust APIs for sending and managing bulk SMS campaigns, ensuring high reliability and delivery speed",
        "Integrated Stripe Payment Gateway for handling top-ups and subscription billing, enabling smooth and secure financial transactions",
        "Designed and implemented systems to manage SMS credits, user balances, and transactional logging, ensuring full transparency for users",
        "Collaborated closely with cross-functional teams to ensure seamless feature development, bug resolution, and deployment",
        "Actively participated in client calls and requirement discussions to understand business needs and provide optimal backend solutions",
        "Applied innovative backend strategies to optimize performance, reduce costs, and enhance platform scalability"
      ]
    },
    {
      company: "Crest Infosystems Pvt. Ltd",
      location: "Surat",
      position: "Software Engineer (Node Js)",
      period: "01/2021 - 10/2021",
      achievements: [
        "Worked as a Backend Developer, solely responsible for backend architecture, API development, and client communication",
        "Developed and implemented a revenue generation strategy through Facebook integration, similar to the Udemy model for selling online courses",
        "Built the platform from scratch using Node.js, including the creation of APIs for course management, mastermind modules, and agency features",
        "Designed and implemented a comprehensive agency module to streamline and centralize key functionalities, improving overall performance",
        "Developed secure authentication and authorization mechanisms using JWT, allowing safe user access and storing session data",
        "Integrated Twilio API for seamless SMS-based communication between the platform and its users",
        "Used Node-Cron for automated scheduling, including activation and deactivation of membership accounts",
        "Applied MongoDB Aggregation Pipelines to manipulate and deliver complex API responses efficiently",
        "Regularly interacted with clients through calls and meetings to gather requirements, provide progress updates, and deliver customized solutions"
      ]
    },
    {
      company: "EbizzInfotech Pvt Ltd",
      location: "Surat",
      position: "Software Engineer (Node Js)",
      period: "01/2019 - 12/2019",
      achievements: [
        "Independently handled a project, focusing on backend development and API creation",
        "Designed and developed scalable and efficient backend APIs to support application functionality and performance",
        "Conducted detailed analysis, data retrieval, and indexing to support business logic and enhance user experience",
        "Collaborated with business analysts, developers, and technical teams to define optimal technical specifications",
        "Focused on client requirements while designing and implementing backend logic and system architecture"
      ]
    },
    {
      company: "Dronstudy Pvt Ltd",
      location: "Delhi, CA",
      position: "Junior Software Engineer",
      period: "01/2018 - 12/2018",
      achievements: [
        "Worked as a Backend Developer using Node.js, responsible for building scalable and efficient APIs",
        "Developed RESTful APIs to support live class functionality, ensuring smooth streaming and real-time communication",
        "Collaborated closely with front-end developers and other IT team members to design and implement seamless system integrations"
      ]
    }
  ]

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
      id="experience" 
      className="py-20 px-4 relative overflow-hidden"
      aria-labelledby="experience-heading"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/5 to-transparent"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 
            id="experience-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Experience
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 mx-auto rounded-full"></div>
        </div>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500 via-cyan-500 to-teal-500"></div>
          
          <div className="space-y-12">
            {experiences.map((exp, index) => (
            <div
              key={index}
              className={`relative transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
                {/* Timeline Dot */}
                <div className="hidden md:block absolute left-0 top-6 w-4 h-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full border-4 border-gray-900 z-10"></div>
                
                <div className="md:ml-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 md:p-8 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 border border-teal-500/20 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-500/10 group">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors">
                        {exp.position}
                      </h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-xl text-teal-400 font-medium flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {exp.company}
                        </p>
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {exp.location}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <span className="inline-block px-4 py-2 bg-teal-500/10 border border-teal-500/30 text-teal-300 rounded-lg font-medium text-sm">
                        {exp.period}
                      </span>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mt-6">
                    {exp.achievements.map((achievement, idx) => (
                      <li 
                        key={idx} 
                        className="flex items-start text-gray-300 group/item hover:text-gray-200 transition-colors"
                      >
                        <span className="text-teal-400 mr-3 mt-1.5 flex-shrink-0 group-hover/item:scale-110 transition-transform">▸</span>
                        <span className="leading-relaxed">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Experience

