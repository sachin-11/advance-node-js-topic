const Experience = () => {
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

  return (
    <section 
      id="experience" 
      className="py-20 px-4"
      aria-labelledby="experience-heading"
    >
      <div className="max-w-6xl mx-auto">
        <h2 
          id="experience-heading"
          className="text-4xl md:text-5xl font-bold mb-12 text-center text-teal-400"
        >
          Experience
        </h2>
        
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg p-6 md:p-8 hover:bg-gray-750 transition-colors border-l-4 border-teal-600 focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900"
              tabIndex={0}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-1">{exp.position}</h3>
                  <p className="text-xl text-teal-400 font-medium">{exp.company}</p>
                  <p className="text-gray-400 text-sm mt-1">{exp.location}</p>
                </div>
                <p className="text-teal-300 font-medium mt-2 md:mt-0">{exp.period}</p>
              </div>
              
              <ul className="space-y-3 mt-6">
                {exp.achievements.map((achievement, idx) => (
                  <li key={idx} className="flex items-start text-gray-300">
                    <span className="text-teal-400 mr-3 mt-1">▸</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Experience

