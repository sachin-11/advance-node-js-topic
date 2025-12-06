import Link from 'next/link'
import { FiMail, FiPhone } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">Jaydip Suthar</h3>
            <p className="text-gray-400">
              Portrait & Wedding Photographer / Filmmaker based in Thasra, Gujarat
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <FiMail className="text-white" />
                <a
                  href="mailto:thejdfilmer@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  thejdfilmer@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone className="text-white" />
                <div className="text-gray-400">
                  <a
                    href="tel:9898332286"
                    className="hover:text-white transition-colors"
                  >
                    +91 9898332286
                  </a>
                  <span className="mx-2">/</span>
                  <a
                    href="tel:9998332286"
                    className="hover:text-white transition-colors"
                  >
                    +91 9998332286
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Jaydip Suthar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

