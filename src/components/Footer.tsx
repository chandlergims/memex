"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center">
              <Image 
                src="/Untitled design (63).png" 
                alt="BIF Logo" 
                width={100} 
                height={30} 
                style={{ maxHeight: '40px', width: 'auto' }}
                priority
              />
            </Link>
          </div>
          
          <div className="flex space-x-6">
            <a href="https://twitter.com/bagsindexfund" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 flex justify-center">
          <p className="text-gray-500 text-xs font-bold">
            &copy; {currentYear} BIF. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
