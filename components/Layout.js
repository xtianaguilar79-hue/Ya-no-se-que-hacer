// components/Layout.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children, currentDate }) {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Detecta la categoría activa desde la URL
  const getActiveCategory = () => {
    const path = router.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/noticia/')) {
      const parts = router.asPath.split('/');
      if (parts.length >= 3) {
        const cat = parts[2];
        if (['sanjuan', 'nacionales', 'internacionales', 'sindicales', 'opinion'].includes(cat)) {
          return cat;
        }
      }
    }
    return 'home';
  };

  const activeCategory = getActiveCategory();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName} ${day} de ${month} de ${year}`;
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
    setIsSearchOpen(false);
  };

  return (
    <>
      {/* HEADER */}
      <header className="bg-white border-b-4 border-blue-800 shadow-lg header-custom overflow-hidden sticky-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="flex justify-between items-center py-1 w-full">
            <div className="flex items-center space-x-4">
              <button 
                className="lg:hidden text-blue-900 hover:text-blue-700 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/" legacyBehavior>
                <a>
                  <img 
                    src="/logo.png" 
                    alt="UG Noticias Mineras Logo" 
                    className="h-16 w-auto object-contain"
                  />
                </a>
              </Link>
            </div>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-blue-900 hover:text-blue-700 transition-colors flex items-center"
              aria-label="Buscar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          {isSearchOpen && (
            <div className="py-2 border-t border-blue-100">
              <div className="flex items-center space-x-2">
                <input 
                  type="text"
                  placeholder="Buscar noticias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-1 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-sm rounded-lg transition-colors"
                >
                  Buscar
                </button>
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 text-sm rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* NAV DESKTOP */}
      <nav className="hidden lg:block bg-white border-b border-blue-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1 md:gap-3">
              <Link href="/" legacyBehavior>
                <a className={`px-4 py-1 text-sm ${activeCategory === 'home' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'} text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg`}>
                  <div className="flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span>Inicio</span>
                  </div>
                </a>
              </Link>
              {['sanjuan', 'nacionales', 'internacionales', 'sindicales', 'opinion'].map(cat => (
                <Link key={cat} href={`/noticia/${cat}`} legacyBehavior>
                  <a className={`px-4 py-1 text-sm ${activeCategory === cat ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'} text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg`}>
                    {cat === 'nacionales' ? 'Nacionales' :
                     cat === 'sanjuan' ? 'San Juan' :
                     cat === 'sindicales' ? 'Sindicales' :
                     cat === 'internacionales' ? 'Internacionales' : 'Opinión'}
                  </a>
                </Link>
              ))}
            </div>
            <div className="text-sm font-medium text-blue-900">
              {formatDate(currentDate)}
            </div>
          </div>
        </div>
      </nav>

      {/* FECHA MÓVIL */}
      <div className="lg:hidden bg-white py-1 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-xs font-medium text-blue-900">{formatDate(currentDate)}</div>
        </div>
      </div>

      {/* SPONSORS BANNER */}
      <div className="bg-blue-50 border-b border-blue-100 overflow-hidden">
        <div className="flex items-center space-x-8 animate-marquee" style={{ minWidth: '200%' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 flex items-center space-x-8">
              {[...Array(5)].map((_, j) => (
                <img 
                  key={j}
                  src="/sponsors/aoma1.jpg" 
                  alt="Colaborador AOMA" 
                  className="sponsor-banner-height object-contain"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b-2 border-blue-800 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <nav className="flex flex-col space-y-2">
              <Link href="/" legacyBehavior>
                <a className={`px-4 py-1 text-sm ${activeCategory === 'home' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'} text-white font-semibold rounded-full transition-all duration-300`}>
                  <div className="flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span>Inicio</span>
                  </div>
                </a>
              </Link>
              {['sanjuan', 'nacionales', 'internacionales', 'sindicales', 'opinion'].map(cat => (
                <Link key={cat} href={`/noticia/${cat}`} legacyBehavior>
                  <a className={`px-4 py-1 text-sm ${activeCategory === cat ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'} text-white font-semibold rounded-full transition-all duration-300`}>
                    {cat === 'nacionales' ? 'Nacionales' :
                     cat === 'sanjuan' ? 'San Juan' :
                     cat === 'sindicales' ? 'Sindicales' :
                     cat === 'internacionales' ? 'Internacionales' : 'Opinión'}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 content-with-sticky-header">
        {children}
      </div>

      {/* FOOTER */}
      <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white mt-8 footer-custom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="mb-2 lg:mb-0">
              <Link href="/" legacyBehavior>
                <a className="flex items-center space-x-2">
                  <img 
                    src="/logo.png" 
                    alt="UG Noticias Mineras Logo" 
                    className="h-12 w-auto object-contain"
                  />
                </a>
              </Link>
            </div>
            <div className="flex space-x-3">
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 21.128 24 18.062 24 12z" />
                </svg>
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.014-3.668.07-4.849.196-4.358 2.618-6.78 6.98-6.98C8.333.014 8.741 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.488.5.09.682-.216.682-.48 0-.236-.008-.864-.013-1.7-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.891 1.524 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.252-4.555-1.107-4.555-4.93 0-1.087.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.578 9.578 0 0112 6.835c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.639.696 1.029 1.588 1.029 2.675 0 3.833-2.337 4.675-4.566 4.921.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-blue-700 text-center">
            <p className="text-blue-300 text-xs">Comprometidos con la información veraz y el desarrollo sostenible de la minería argentina</p>
            <p className="text-blue-200 text-xs">Contacto: ugnoticiasmineras@gmail.com</p>
          </div>
        </div>
      </footer>
    </>
  );
}