// pages/noticia/[categoria]/[id].js
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../components/Layout';

const WORDPRESS_API_URL = 'https://public-api.wordpress.com/wp/v2/sites/xtianaguilar79-hbsty.wordpress.com';
const categories = {
  nacionales: 170094,
  sanjuan: 67720,
  sindicales: 3865306,
  opinion: 352,
  internacionales: 17119
};

// ✅ Corrección: forzar HTTPS en imágenes
const forceHttps = (url) => {
  if (!url) return '/logo.png';
  return url.replace(/^http:/, 'https:');
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

const processPost = (post, categoryKey) => {
  let processedContent = post.content?.rendered || '';
  processedContent = cleanText(processedContent);
  
  // ✅ Extraer primera imagen del contenido si no hay featured
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

  // ✅ Extraer fuente del contenido
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

export default function NoticiaPage({ noticia, relatedNews, currentDate }) {
  const router = useRouter();
  const { categoria, id } = router.query;

  if (!noticia) {
    return (
      <Layout currentDate={currentDate}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center max-w-2xl mx-auto mt-12">
          <h3 className="text-yellow-800 font-bold text-xl mb-2">Noticia no encontrada</h3>
          <p className="text-yellow-700 mb-6">La noticia que buscas no está disponible.</p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{noticia.title} - UG Noticias Mineras</title>
        <meta name="description" content={noticia.subtitle} />
        <meta property="og:title" content={noticia.title} />
        <meta property="og:description" content={noticia.subtitle} />
        <meta property="og:image" content={noticia.image} />
        <meta property="og:url" content={`https://ug-noticias-mineras.vercel.app/noticia/${categoria}/${id}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={noticia.title} />
        <meta name="twitter:description" content={noticia.subtitle} />
        <meta name="twitter:image" content={noticia.image} />
      </Head>

      <Layout currentDate={currentDate}>
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6">
            <h2 className="text-2xl font-bold text-white">
              {getCategoryName(noticia.categoryKey)}
            </h2>
            <div className="w-24 h-1 bg-red-500 mt-2"></div>
          </div>
          <div className="p-6">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
              {noticia.image && (
                <div className="h-80 bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center relative overflow-hidden">
                  <img 
                    src={noticia.image} 
                    alt={noticia.title} 
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-blue-300 to-blue-400 flex items-center justify-center">
                          <div class="text-blue-800 font-bold text-center p-4">${noticia.title}</div>
                        </div>
                      `;
                    }}
                  />
                  <div className={`absolute top-4 left-4 ${noticia.categoryColor} text-white px-3 py-1 rounded-full font-semibold text-sm`}>
                    {getCategoryLabel(noticia.categoryKey)}
                  </div>
                </div>
              )}
              <div className="p-6">
                <h3 className="font-bold text-2xl text-blue-900 mb-4">{noticia.title}</h3>
                {noticia.subtitle && <p className="text-blue-700 font-medium mb-4">{noticia.subtitle}</p>}
                <div className="content-html text-gray-700 leading-relaxed max-w-none prose" 
                  dangerouslySetInnerHTML={{ __html: noticia.content }}>
                </div>
                <div className="mt-6 pt-4 border-t border-blue-100">
                  <p className="text-blue-800 font-medium">{noticia.source}</p>
                  <p className="text-gray-500 text-sm mt-1">Publicado: {noticia.date}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { categoria, id } = params;
  const categoryId = categories[categoria];

  if (!categoryId) {
    return { notFound: true };
  }

  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/posts?slug=${id}&_embed`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; UGNoticiasMineras/1.0; +https://ug-noticias-mineras.vercel.app)',
          'Accept': 'application/json'
        }
      }
    );
    if (!response.ok) return { notFound: true };
    const posts = await response.json();
    if (posts.length === 0) return { notFound: true };
    const noticia = processPost(posts[0], categoria);

    const relatedResponse = await fetch(
      `${WORDPRESS_API_URL}/posts?categories=${categoryId}&per_page=10&orderby=date&order=desc&_embed`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; UGNoticiasMineras/1.0; +https://ug-noticias-mineras.vercel.app)',
          'Accept': 'application/json'
        }
      }
    );
    let relatedNews = [];
    if (relatedResponse.ok) {
      const relatedPosts = await relatedResponse.json();
      relatedNews = relatedPosts
        .filter(p => p.slug !== id)
        .map(p => processPost(p, categoria))
        .slice(0, 3);
    }

    return {
      props: {
        noticia,
        relatedNews,
        currentDate: new Date().toISOString()
      }
    };
  } catch (err) {
    return { notFound: true };
  }
}