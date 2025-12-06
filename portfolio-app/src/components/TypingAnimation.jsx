import { useState, useEffect } from 'react'

const TypingAnimation = ({ texts, speed = 100, deleteSpeed = 50, pauseTime = 2000 }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fullText = texts[currentTextIndex]

      if (!isDeleting && charIndex < fullText.length) {
        // Typing
        setCurrentText(fullText.substring(0, charIndex + 1))
        setCharIndex(charIndex + 1)
      } else if (!isDeleting && charIndex === fullText.length) {
        // Pause at end
        setTimeout(() => setIsDeleting(true), pauseTime)
      } else if (isDeleting && charIndex > 0) {
        // Deleting
        setCurrentText(fullText.substring(0, charIndex - 1))
        setCharIndex(charIndex - 1)
      } else if (isDeleting && charIndex === 0) {
        // Move to next text
        setIsDeleting(false)
        setCurrentTextIndex((currentTextIndex + 1) % texts.length)
      }
    }, isDeleting ? deleteSpeed : speed)

    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, currentTextIndex, texts, speed, deleteSpeed, pauseTime])

  return (
    <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-300">
      {currentText}
      <span className="animate-pulse text-teal-400">|</span>
    </div>
  )
}

export default TypingAnimation

