import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "./AddToCartButton";
import ReviewsSection from "./ReviewsSection";

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  let product = null;
  let reviews = [];
  const resolvedParams = await params;
  
  try {
    const [resProduct, resReviews] = await Promise.all([
      fetch(`http://127.0.0.1:8000/api/products/${resolvedParams.id}`, { cache: "no-store" }),
      fetch(`http://127.0.0.1:8000/api/products/${resolvedParams.id}/reviews`, { cache: "no-store" })
    ]);

    if (!resProduct.ok) {
      console.error(`Backend returned ${resProduct.status}`);
      notFound();
    }
    
    product = await resProduct.json();
    
    if (resReviews.ok) {
      reviews = await resReviews.json();
    }
  } catch (e) {
    console.error("Fetch error:", e);
    throw e;
  }

  // Calculate rating
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount).toFixed(1)
    : "0.0";

  return (
    <main className="min-h-screen bg-white pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm mb-8 text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link> &gt;{" "}
          <Link href="/katalog" className="hover:text-blue-600">Katalog</Link> &gt;{" "}
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Image Gallery / Main Image */}
          <div className="w-full md:w-1/2">
            <div className="bg-gray-100 rounded-3xl overflow-hidden aspect-square flex items-center justify-center p-8 border border-gray-100">
              <img src={product.image_url} alt={product.name} className="object-contain w-full h-full drop-shadow-xl" />
            </div>
          </div>

          {/* Product Info */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider w-max mb-4">
              {product.brand} • {product.category}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>

            {/* Ratings and Sold Count */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-yellow-400">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                <span className="ml-1 text-gray-700 font-bold text-lg">{avgRating}</span>
                <span className="ml-1 text-gray-500 text-sm">({reviewCount} Ulasan)</span>
              </div>
              <div className="w-1 h-4 bg-gray-300"></div>
              <div className="text-gray-600 text-sm font-medium">
                {(product.id * 27) % 500 + 100} Terjual
              </div>
            </div>
            
            <div className="text-3xl font-black text-blue-600 mb-8">
              Rp {new Intl.NumberFormat("id-ID").format(product.price)}
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-sm">Key Specifications</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <span className="block text-gray-500">Processor</span>
                  <span className="font-semibold text-gray-900">{product.processor} (Score: {product.processor_score}/10)</span>
                </div>
                <div>
                  <span className="block text-gray-500">Graphics</span>
                  <span className="font-semibold text-gray-900">{product.gpu} (Score: {product.gpu_score}/10)</span>
                </div>
                <div>
                  <span className="block text-gray-500">Memory (RAM)</span>
                  <span className="font-semibold text-gray-900">{product.ram} GB</span>
                </div>
                <div>
                  <span className="block text-gray-500">Storage</span>
                  <span className="font-semibold text-gray-900">{product.storage} GB SSD</span>
                </div>
                <div>
                  <span className="block text-gray-500">Display Quality</span>
                  <span className="font-semibold text-gray-900">{product.screen_score}/10</span>
                </div>
                <div>
                  <span className="block text-gray-500">Battery Life</span>
                  <span className="font-semibold text-gray-900">{product.battery_score}/10</span>
                </div>
              </div>
            </div>

            <AddToCartButton product={product} />
          </div>
        </div>

        <ReviewsSection productId={product.id} />
      </div>
    </main>
  );
}
