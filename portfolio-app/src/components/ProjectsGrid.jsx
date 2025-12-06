import { useState, useEffect, useRef } from 'react'
import projectsData from '../data/projects.json'
import ProjectModal from './ProjectModal'

const ProjectsGrid = () => {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    setProjects(projectsData)
    setFilteredProjects(projectsData)
  }, [])

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

  // Get all unique technologies for filters
  const allTechnologies = ['All', ...new Set(projects.flatMap(p => p.technologies))]

  const handleFilter = (tech) => {
    setActiveFilter(tech)
    if (tech === 'All') {
      setFilteredProjects(projects)
    } else {
      setFilteredProjects(projects.filter(p => p.technologies.includes(tech)))
    }
  }

  const handleProjectClick = (project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedProject(null), 300)
  }

  return (
    <>
      <section 
        ref={sectionRef}
        id="projects" 
        className="py-20 px-4 bg-gray-800 relative overflow-hidden"
        aria-labelledby="projects-heading"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(20, 184, 166, 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 
              id="projects-heading"
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            >
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Featured Projects
              </span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 mx-auto rounded-full mb-8"></div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A collection of projects showcasing my expertise in backend development, API design, and scalable solutions
            </p>
          </div>

          {/* Filter Buttons */}
          <div 
            className={`flex flex-wrap justify-center gap-3 mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: '200ms' }}
          >
            {allTechnologies.slice(0, 8).map((tech) => (
              <button
                key={tech}
                onClick={() => handleFilter(tech)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeFilter === tech
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/50 scale-105'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-teal-400'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <div
                key={index}
                onClick={() => handleProjectClick(project)}
                className={`group bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:from-gray-600 hover:to-gray-700 hover:scale-105 hover:shadow-xl hover:shadow-teal-500/20 border border-gray-600 hover:border-teal-500/50 focus-visible-teal ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleProjectClick(project)
                  }
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-teal-400 group-hover:text-teal-300 transition-colors">
                    {project.name}
                  </h3>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <p className="text-gray-300 mb-4 leading-relaxed line-clamp-3">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 3).map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-600/50 text-teal-300 text-xs rounded-lg border border-teal-500/20"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-3 py-1 bg-gray-600/50 text-gray-400 text-xs rounded-lg">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>
                
                {project.features && project.features.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Key Features:</h4>
                    <ul className="space-y-1">
                      {project.features.slice(0, 2).map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-400 flex items-start">
                          <span className="text-teal-400 mr-2 mt-0.5">✓</span>
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-teal-400 mt-2 group-hover:underline">View details →</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No projects found with this filter.</p>
            </div>
          )}
        </div>
      </section>

      {isModalOpen && selectedProject && (
        <ProjectModal project={selectedProject} onClose={closeModal} />
      )}
    </>
  )
}

export default ProjectsGrid


