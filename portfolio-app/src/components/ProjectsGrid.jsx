import { useState, useEffect } from 'react'
import projectsData from '../data/projects.json'

const ProjectsGrid = () => {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    setProjects(projectsData)
  }, [])

  return (
    <section 
      id="projects" 
      className="py-20 px-4 bg-gray-800"
      aria-labelledby="projects-heading"
    >
      <div className="max-w-6xl mx-auto">
        <h2 
          id="projects-heading"
          className="text-4xl md:text-5xl font-bold mb-12 text-center text-teal-400"
        >
          Projects
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-all duration-200 hover:transform hover:scale-105 focus-visible-teal border border-gray-600"
              tabIndex={0}
            >
              <h3 className="text-xl font-semibold text-teal-400 mb-3">
                {project.name}
              </h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-600 text-teal-300 text-sm rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              {project.features && project.features.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {project.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-400 flex items-start">
                        <span className="text-teal-400 mr-2">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProjectsGrid

