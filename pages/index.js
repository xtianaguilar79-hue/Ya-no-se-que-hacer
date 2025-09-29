// pages/index.js
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

const WORDPRESS_API_URL = 'https://public-api.wordpress.com/wp/v2/sites/xtianaguilar79-hbsty.wordpress.com';
const categories = {
  nacionales: 170094,
  sanjuan: 67720,
  sindicales: 3865306,
  opinion: 352,
  internacionales: 17119
};

const cleanText = (text) => {
  if (!text) return text;
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '--')
    .replace(/\s+/g, ' ')
    .trim();
};

const forceHttps = (url) => {
  if (!url) return '/logo.png';
  return url.replace(/^http:/, 'https:');
};

const processPosts = (posts, categoryKey) => {
  return posts.map(post => {
    let processedContent = post.content?.rendered || '';
    processedContent = cleanText(processedContent);
    
    let firstContentImage = null;
    const contentImages = processedContent.match(/<img[^>]+src="([^">]+)"/g);
    if (contentImages && contentImages.length > 0) {
      const srcMatch = contentImages[0].match(/src="([^">]+)"/);
      if (srcMatch && srcMatch[1]) {
        firstContentImage = forceHttps(srcMatch[1]);
      }
    }

    let imageUrl = '/logo.png';
    if (post.featured_media && post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
      imageUrl = forceHttps(post._embedded['wp:featuredmedia'][0].source_url);
    } else if (firstContentImage) {
      imageUrl = firstContentImage;
    }

    let source = 'Fuente: WordPress';
    const sourceMatch = processedContent.match(/Fuente:\s*([^<]+)/i);
    if (sourceMatch && sourceMatch[1]) {
      source = `Fuente: ${sourceMatch[1].trim()}`;
    }

    const postDate = new Date(post.date);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = postDate.toLocaleDateString('es-ES', options).replace(' de ', ' de ');
    
    let excerpt = post.excerpt?.rendered || '';
    excerpt = cleanText(excerpt.replace(/<[^>]*>/g, '').trim());
    if (excerpt.length > 150) excerpt = excerpt.substring(0, 150) + '...';
    else if (excerpt.length === 0 && processedContent) {
      const cleanContent = processedContent.replace(/<[^>]*>/g, '').trim();
      excerpt = cleanContent.substring(0, 150) + '...';
    }
    
    let title = cleanText(post.title?.rendered || 'Sin título');
    
    return {
      id: post.slug || post.id,
      title,
      subtitle: excerpt,
      image: imageUrl,
      categoryKey,
      categoryColor: categoryKey === 'nacionales' ? 'bg-blue-600' : 
                    categoryKey === 'sanjuan' ? 'bg-red-500' : 
                    categoryKey === 'sindicales' ? 'bg-green-600' : 
                    categoryKey === 'internacionales' ? 'bg-yellow-600' : 'bg-purple-600',
      content: processedContent,
      source,
      date: formattedDate,
      originalDate: post.date
    };
  });
};

const getCategoryName = (categoryKey) => {
  switch(categoryKey) {
    case 'nacionales': return 'Noticias Nacionales';
    case 'sanjuan': return 'Noticias de San Juan';
    case 'sindicales': return 'Noticias Sindicales';
    case 'internacionales': return 'Noticias Internacionales';
    case 'opinion': return 'Columna de Opinión';
    default: return 'Noticia';
  }
};

const getCategoryLabel = (categoryKey) => {
  switch(categoryKey) {
    case 'nacionales': return 'NACIONAL';
    case 'sanjuan': return 'SAN JUAN';
    case 'sindicales': return 'SINDICAL';
    case 'internacionales': return 'INTERNACIONAL';
    case 'opinion': return 'OPINIÓN';
    default: return 'NOTICIA';
  }
};

const renderNewsCard = (news, isFeatured = false) => {
  return (
    <Link key={news.id} href={`/noticia/${news.categoryKey}/${news.id}`} legacyBehavior>
      <a className="block bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-100 overflow-hidden">
        {isFeatured ? (
          // ✅ DESTACADA: imagen arriba + título y extracto abajo
          <div className="h-80 bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center relative overflow-hidden">
            <img 
              src={news.image} 
              alt={news.title} 
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = `
                  <div class="w-full h-full bg-gradient-to-br from-blue-300 to-blue-400 flex items-center justify-center">
                    <div class="text-blue-800 font-bold text-center p-4">${news.title}</div>
                  </div>
                `;
              }}
            />
            <div className={`absolute top-4 left-4 ${news.categoryColor} text-white px-3 py-1 rounded-full font-semibold text-sm`}>
              {getCategoryLabel(news.categoryKey)}
            </div>
          </div>
        ) : (
          // Lista: imagen a la izquierda, texto a la derecha
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 h-48 md:h-full relative">
              <img 
                src={news.image} 
                alt={news.title} 
                className="w-full h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-blue-300 to-blue-400 flex items-center justify-center">
                      <div class="text-blue-800 font-bold text-center p-4">${news.title}</div>
                    </div>
                  `;
                }}
              />
              <div className={`absolute top-2 left-2 ${news.categoryColor} text-white px-2 py-1 rounded text-xs font-semibold`}>
                {getCategoryLabel(news.categoryKey)}
              </div>
            </div>
            <div className="md:w-2/3 p-6">
              <h3 className="font-bold text-blue-900 text-xl">{news.title}</h3>
              <p className="text-gray-600 mt-2 mb-4">{news.subtitle}</p>
              <div className="mt-4 pt-2 border-t border-blue-100 flex justify-between items-center">
                <p className="text-blue-800 font-medium">{news.source}</p>
                <p className="text-gray-500 text-sm">{news.date}</p>
              </div>
            </div>
          </div>
        )}
        {/* ✅ Título y extracto SIEMPRE visible en destacadas */}
        {isFeatured && (
          <div className="p-6">
            <h3 className="font-bold text-blue-900 text-xl">{news.title}</h3>
            <p className="text-gray-600 mt-2">{news.subtitle}</p>
          </div>
        )}
      </a>
    </Link>
  );
};

export default function Home({ newsData, loading, error, currentDate }) {
  if (loading) {
    return (
      <Layout currentDate={currentDate}>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mb-4"></div>
          <div className="text-blue-900 text-xl font-semibold">Cargando noticias...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout currentDate={currentDate}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-2xl mx-auto mt-12">
          <h3 className="text-red-800 font-bold text-xl mb-2">Error al cargar las noticias</h3>
          <p className="text-red-700 mb-6">{error}</p>
        </div>
      </Layout>
    );
  }

  const allNews = [
    ...newsData.sanjuan,
    ...newsData.nacionales,
    ...newsData.internacionales,
    ...newsData.sindicales,
    ...newsData.opinion
  ].sort((a, b) => new Date(b.originalDate) - new Date(a.originalDate));

  const featuredNews = allNews.slice(0, 4);
  const recentNews = allNews.slice(4, 19);

  return (
    <>
      <Head>
        <title>UG Noticias Mineras</title>
        <meta name="description" content="Noticias del sector minero argentino." />
        <meta property="og:title" content="UG Noticias Mineras" />
        <meta property="og:description" content="Noticias nacionales, internacionales, sindicales y de San Juan." />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content="https://ug-noticias-mineras.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <Layout currentDate={currentDate}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-4">
            {/* NOTICIAS DESTACADAS */}
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6">
                <h2 className="text-2xl font-bold text-white">Noticias Destacadas</h2>
                <div className="w-24 h-1 bg-red-500 mt-2"></div>
              </div>
              <div className="p-6">
                {featuredNews.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No hay noticias destacadas disponibles.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredNews.map(news => renderNewsCard(news, true))}
                  </div>
                )}
              </div>
            </div>

            {/* ÚLTIMAS NOTICIAS */}
            {recentNews.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden mt-8">
                <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6">
                  <h2 className="text-2xl font-bold text-white">Últimas Noticias</h2>
                  <div className="w-24 h-1 bg-red-500 mt-2"></div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {recentNews.map(news => renderNewsCard(news))}
                  </div>
                </div>
              </div>
            )}

            {/* SECCIONES POR CATEGORÍA */}
            {Object.entries(newsData).map(([categoryKey, newsList]) => {
              if (newsList.length === 0) return null;
              return (
                <div key={categoryKey} className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden mt-8">
                  <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6">
                    <h2 className="text-2xl font-bold text-white">{getCategoryName(categoryKey)}</h2>
                    <div className="w-24 h-1 bg-red-500 mt-2"></div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {newsList.slice(0, 5).map(news => renderNewsCard(news))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            {Object.entries(newsData).map(([categoryKey, newsList]) => {
              if (newsList.length === 0) return null;
              return (
                <div key={categoryKey} className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden mb-4">
                  <Link href={`/noticia/${categoryKey}`} legacyBehavior>
                    <a className="block">
                      <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-3 text-center">
                        <h3 className="text-lg font-bold text-white">{getCategoryName(categoryKey)}</h3>
                        <div className="w-16 h-1 bg-red-500 mx-auto mt-1"></div>
                      </div>
                      <div className="p-3 h-24 bg-white flex items-center justify-center">
                        <p className="text-blue-900 font-semibold text-center text-sm">
                          {newsList[0]?.title || 'Sin noticias'}
                        </p>
                      </div>
                    </a>
                  </Link>
                </div>
              );
            })}
            
            {/* Sponsors */}
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
              <div className="p-3 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <img 
                    key={i}
                    src="/sponsors/aoma1.jpg" 
                    alt="Colaborador AOMA" 
                    className="w-full h-16 object-contain rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export async function getServerSideProps() {
  try {
    let newsData = {
      nacionales: [], sanjuan: [], sindicales: [], opinion: [], internacionales: []
    };

    for (const [key, categoryId] of Object.entries(categories)) {
      try {
        const response = await fetch(
          `${WORDPRESS_API_URL}/posts?categories=${categoryId}&per_page=20&orderby=date&order=desc&_embed`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; UGNoticiasMineras/1.0; +https://ug-noticias-mineras.vercel.app)',
              'Accept': 'application/json'
            }
          }
        );

        if (response.ok) {
          const posts = await response.json();
          newsData[key] = processPosts(posts, key);
        }
      } catch (err) {
        console.warn(`Error fetching ${key}:`, err.message);
      }
    }

    return {
      props: {
        newsData,
        loading: false,
        error: null,
        currentDate: new Date().toISOString()
      }
    };
  } catch (err) {
    return {
      props: {
        newsData: { nacionales: [], sanjuan: [], sindicales: [], opinion: [], internacionales: [] },
        loading: false,
        error: 'Error al cargar noticias',
        currentDate: new Date().toISOString()
      }
    };
  }
}