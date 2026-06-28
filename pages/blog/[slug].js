import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import Link from 'next/link';

export default function BlogPost({ post }) {
  if (!post) return <div style={{ color: '#FFFDF7' }}>Post not found</div>;

  return (
    <>
      <Head>
        <title>{post.title} - brnk.in Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "${post.title}",
            "description": "${post.excerpt}",
            "url": "https://brnk.in/blog/${post.slug}",
            "datePublished": "${post.date}",
            "author": {
              "@type": "Person",
              "name": "brnk Team",
              "url": "https://brnk.in/about"
            },
            "publisher": {
              "@type": "Organization",
              "name": "brnk",
              "url": "https://brnk.in",
              "logo": {
                "@type": "ImageObject",
                "url": "https://brnk.in/logo512.png"
              }
            }
          }
        `}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://brnk.in"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://brnk.in/blog"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "${post.title}",
                "item": "https://brnk.in/blog/${post.slug}"
              }
            ]
          }
        `}} />
      </Head>
      <article className="form-container" style={{ marginTop: '24px', maxWidth: '800px', width: '100%', lineHeight: '1.8' }}>
        <header style={{ marginBottom: '30px', borderBottom: '3px solid #ff6600', paddingBottom: '20px' }}>
          <nav aria-label="Breadcrumb" style={{ marginBottom: '15px', color: '#a8a8a8', fontSize: '0.85rem', fontWeight: 'bold' }}>
            <Link href="/" style={{ color: '#ff6600', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>&gt;</span>
            <Link href="/blog" style={{ color: '#ff6600', textDecoration: 'none' }}>Blog</Link>
            <span style={{ margin: '0 8px' }}>&gt;</span>
            <span style={{ color: '#FFFDF7' }}>{post.title}</span>
          </nav>
          <h1 className="title" style={{ marginTop: '5px', fontSize: '2rem' }}>{post.title}</h1>
          <p style={{ color: '#a8a8a8', marginTop: '10px' }}>Published on {post.date} • By brnk Team</p>
        </header>

        {/* Ad Placeholder Top */}
        <div style={{ margin: '20px 0', padding: '10px', border: '1px dashed #a8a8a8', textAlign: 'center', color: '#a8a8a8' }}>
          <small>Ad Placement</small>
        </div>

        <div 
          className="blog-content"
          style={{ fontSize: '1.05rem', color: '#FFFDF7' }}
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />

        {/* Ad Placeholder Bottom */}
        <div style={{ margin: '40px 0', padding: '10px', border: '1px dashed #a8a8a8', textAlign: 'center', color: '#a8a8a8' }}>
          <small>Ad Placement</small>
        </div>
      </article>
      
      <style jsx global>{`
        .blog-content h2 { margin-top: 40px; margin-bottom: 20px; font-size: 1.5rem; color: '#ff6600'; }
        .blog-content h3 { margin-top: 30px; margin-bottom: 15px; font-size: 1.25rem; }
        .blog-content p { margin-bottom: 20px; }
        .blog-content ul, .blog-content ol { margin-left: 20px; margin-bottom: 20px; }
        .blog-content li { margin-bottom: 10px; }
        .blog-content a { color: #ff6600; text-decoration: underline; font-weight: bold; }
        .blog-content strong { color: #FFFDF7; font-weight: 700; }
      `}</style>
    </>
  );
}

export async function getStaticPaths() {
  const postsDir = path.join(process.cwd(), 'data', 'posts');
  let paths = [];
  
  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir);
    for (const file of files) {
      if (file.endsWith('.js')) {
        paths.push({
          params: { slug: file.replace('.js', '') }
        });
      }
    }
  }

  return {
    paths,
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const modPath = path.join(process.cwd(), 'data', 'posts', `${slug}.js`);
  
  try {
    const mod = require('../../data/posts/' + slug + '.js');
    if (mod && mod.post) {
      return {
        props: {
          post: {
            title: mod.post.title,
            slug: mod.post.slug,
            date: mod.post.date,
            excerpt: mod.post.excerpt,
            content: mod.post.content
          }
        }
      };
    }
  } catch (e) {
    console.error("Error loading post:", modPath, e);
  }

  return {
    notFound: true
  };
}
