import { useState } from 'react'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import About from './components/About'
import Experience from './components/Experience'
import ProjectsGrid from './components/ProjectsGrid'
import Contact from './components/Contact'
import ScrollToTop from './components/ScrollToTop'
import ScrollProgress from './components/ScrollProgress'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 relative overflow-x-hidden">
      <ScrollProgress />
      <Navigation />
      <Hero />
      <About />
      <Experience />
      <ProjectsGrid />
      <Contact />
      <ScrollToTop />
    </div>
  )
}

export default App

