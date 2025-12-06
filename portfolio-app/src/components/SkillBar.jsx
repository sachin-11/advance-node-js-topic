import { useState, useEffect } from 'react'

const SkillBar = ({ skill, level, isVisible, delay = 0 }) => {
  const [animatedLevel, setAnimatedLevel] = useState(0)

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setAnimatedLevel(level)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [isVisible, level, delay])

  return (
    <div className="group">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-300 font-medium">{skill}</span>
        <span className="text-teal-400 font-semibold">{animatedLevel}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{ width: `${animatedLevel}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>
    </div>
  )
}

export default SkillBar

