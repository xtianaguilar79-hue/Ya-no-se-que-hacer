// pages/noticia/[categoria].js
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';

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

const renderNewsCard = (news) => {
  return (
    <Link key={news.id} href={`/noticia/${news.categoryKey}/${news.id}`} legacyBehavior>
      <a className="block bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-100 overflow-hidden">
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
      </a>
    </Link>
  );
};

export default function CategoryPage({ newsList, categoryKey, currentDate }) {
  if (!newsList || newsList.length === 0) {
    return (
      <Layout currentDate={currentDate}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center max-w-2xl mx-auto mt-12">
          <h3 className="text-yellow-800 font-bold text-xl mb-2">No hay noticias en esta categoría</h3>
          <p className="text-yellow-700 mb-6">No se encontraron noticias para "{getCategoryName(categoryKey)}".</p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{getCategoryName(categoryKey)} - UG Noticias Mineras</title>
        <meta name="description" content={`Noticias de ${getCategoryName(categoryKey).toLowerCase()}.`} />
        <meta property="og:title" content={`${getCategoryName(categoryKey)} - UG Noticias Mineras`} />
        <meta property="og:description" content={`Noticias de ${getCategoryName(categoryKey).toLowerCase()}.`} />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content={`https://ug-noticias-mineras.vercel.app/noticia/${categoryKey}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <Layout currentDate={currentDate}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6">
                <h2 className="text-2xl font-bold text-white">{getCategoryName(categoryKey)}</h2>
                <div className="w-24 h-1 bg-red-500 mt-2"></div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {newsList.map(news => renderNewsCard(news))}
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            {/* Sidebar igual que en index.js */}
            {Object.entries(categories).map(([key, _]) => {
              if (key === categoryKey) return null;
              return (
                <div key={key} className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden mb-4">
                  <Link href={`/noticia/${key}`} legacyBehavior>
                    <a className="block">
                      <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-3 text-center">
                        <h3 className="text-lg font-bold text-white">{getCategoryName(key)}</h3>
                        <div className="w-16 h-1 bg-red-500 mx-auto mt-1"></div>
                      </div>
                      <div className="p-3 h-24 bg-white flex items-center justify-center">
                        <p className="text-gray-500 text-center text-sm">Ver noticias</p>
                      </div>
                    </a>
                  </Link>
                </div>
              );
            })}
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

export async function getServerSideProps({ params }) {
  const { categoria } = params;
  const categoryId = categories[categoria];

  if (!categoryId) {
    return { notFound: true };
  }

  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?categories=${categoryId}&per_page=50&orderby=date&order=desc&_embed`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; UGNoticiasMineras/1.0; +https://ug-noticias-mineras.vercel.app)',
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return {
        props: {
          newsList: [],
          categoryKey: categoria,
          currentDate: new Date().toISOString()
        }
      };
    }

    const posts = await response.json();
    const newsList = processPosts(posts, categoria);

    return {
      props: {
        newsList,
        categoryKey: categoria,
        currentDate: new Date().toISOString()
      }
    };
  } catch (err) {
    return {
      props: {
        newsList: [],
        categoryKey: categoria,
        currentDate: new Date().toISOString()
      }
    };
  }
}