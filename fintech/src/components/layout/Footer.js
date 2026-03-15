import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">TAAGC Fintech</h3>
            <p className="text-gray-400 text-sm">
              Powered by 9 Payment Service Bank. Providing innovative financial solutions to Nigerians.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              RC: BN8514665
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white">Services</Link></li>
              <li><Link to="/agents" className="hover:text-white">Become an Agent</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link to="/support" className="hover:text-white">Customer Support</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📍 No.2 Gubi Village, Maiduguri Road, Ganjuwa, Bauchi</li>
              <li>📞 08023566143</li>
              <li>✉️ prihamz@gmail.com</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Triple A-Ahal Global Concept. All rights reserved.</p>
          <p className="mt-2">Licensed by Central Bank of Nigeria. NDPR Compliant.</p>
        </div>
      </div>
    </footer>
  );
}
