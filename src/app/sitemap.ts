import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.techtoko.my.id';
  
  // Rute statis
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/katalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/chat`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/orders`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  // Fetch produk dari backend API dengan ISR (update tiap 1 jam)
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://techstoreai.my.id/api'}/products`, { 
      next: { revalidate: 3600 } // Update cache tiap 1 jam (3600 detik)
    });
    
    if (res.ok) {
      const products = await res.json();
      productRoutes = products.map((product: any) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: new Date(product.updated_at),
        changeFrequency: 'daily',
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error("Gagal fetch products untuk sitemap", e);
  }

  return [...staticRoutes, ...productRoutes];
}
