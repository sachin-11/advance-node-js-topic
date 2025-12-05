import { useState } from 'react'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import ProjectsGrid from './components/ProjectsGrid'
import Contact from './components/Contact'

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Hero />
      <About />
      <Experience />
      <ProjectsGrid />
      <Contact />
    </div>
  )
}

export default App

