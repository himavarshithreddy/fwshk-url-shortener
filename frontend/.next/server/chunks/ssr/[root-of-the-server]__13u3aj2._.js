module.exports=[22734,(a,b,c)=>{b.exports=a.x("fs",()=>require("fs"))},81718,a=>{"use strict";var b=a.i(22734),c=a.i(14747);async function d({res:a}){let e=c.default.join(process.cwd(),"data","posts"),f=[];if(b.default.existsSync(e))for(let a of b.default.readdirSync(e))a.endsWith(".js")&&f.push({slug:a.replace(".js","")});let g=`<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!-- Static URLs -->
     <url>
       <loc>https://brnk.in</loc>
       <changefreq>weekly</changefreq>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>https://brnk.in/about</loc>
       <changefreq>monthly</changefreq>
       <priority>0.8</priority>
     </url>
     <url>
       <loc>https://brnk.in/blog</loc>
       <changefreq>weekly</changefreq>
       <priority>0.9</priority>
     </url>
     <url>
       <loc>https://brnk.in/privacy-policy</loc>
       <changefreq>yearly</changefreq>
       <priority>0.5</priority>
     </url>
     <url>
       <loc>https://brnk.in/terms</loc>
       <changefreq>yearly</changefreq>
       <priority>0.5</priority>
     </url>
     <url>
       <loc>https://brnk.in/contact</loc>
       <changefreq>monthly</changefreq>
       <priority>0.6</priority>
     </url>
     <url>
       <loc>https://brnk.in/report</loc>
       <changefreq>monthly</changefreq>
       <priority>0.5</priority>
     </url>
     
     <!-- Dynamic Blog URLs -->
     ${f.map(({slug:a})=>`
       <url>
           <loc>https://brnk.in/blog/${a}</loc>
           <changefreq>monthly</changefreq>
           <priority>0.7</priority>
       </url>
     `).join("")}
   </urlset>
 `;return a.setHeader("Content-Type","text/xml"),a.write(g),a.end(),{props:{}}}a.s(["default",0,function(){},"getServerSideProps",0,d])},68497,a=>a.a(async(b,c)=>{try{var d=a.i(79168),e=a.i(27068),f=a.i(32759),g=a.i(39141),h=a.i(27342),i=a.i(81718),j=a.i(9193),k=b([h]);[h]=k.then?(await k)():k;let l=(0,f.hoist)(i,"default"),m=(0,f.hoist)(i,"getStaticProps"),n=(0,f.hoist)(i,"getStaticPaths"),o=(0,f.hoist)(i,"getServerSideProps"),p=(0,f.hoist)(i,"config"),q=(0,f.hoist)(i,"reportWebVitals"),r=(0,f.hoist)(i,"unstable_getStaticProps"),s=(0,f.hoist)(i,"unstable_getStaticPaths"),t=(0,f.hoist)(i,"unstable_getStaticParams"),u=(0,f.hoist)(i,"unstable_getServerProps"),v=(0,f.hoist)(i,"unstable_getServerSideProps"),w=new d.PagesRouteModule({definition:{kind:e.RouteKind.PAGES,page:"/sitemap.xml",pathname:"/sitemap.xml",bundlePath:"",filename:""},distDir:".next",relativeProjectDir:"",components:{App:h.default,Document:g.default},userland:i}),x=(0,j.getHandler)({srcPage:"/sitemap.xml",config:p,userland:i,routeModule:w,getStaticPaths:n,getStaticProps:m,getServerSideProps:o});a.s(["config",0,p,"default",0,l,"getServerSideProps",0,o,"getStaticPaths",0,n,"getStaticProps",0,m,"handler",0,x,"reportWebVitals",0,q,"routeModule",0,w,"unstable_getServerProps",0,u,"unstable_getServerSideProps",0,v,"unstable_getStaticParams",0,t,"unstable_getStaticPaths",0,s,"unstable_getStaticProps",0,r]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__13u3aj2._.js.map