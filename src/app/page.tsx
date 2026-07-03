import Link from "next/link";

export default async function Home() {
  let latestProducts = [];
  try {
    const res = await fetch("http://127.0.0.1:8000/api/products", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      latestProducts = data.slice(0, 3); // Take top 3
    }
  } catch (e) {
    console.error(e);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 max-w-3xl flex flex-col items-center pt-20">
        <span className="bg-blue-100 text-blue-800 text-sm font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest shadow-sm">
          Welcome to The Future
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
          TechStore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">AI</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
          Temukan laptop impianmu tanpa bingung baca spesifikasi. Cukup beritahu AI Assistant kami apa kebutuhanmu, dan algoritma cerdas kami akan merekomendasikan yang terbaik.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/katalog"
            className="px-8 py-4 bg-white text-gray-800 font-semibold rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all text-center"
          >
            Lihat Katalog Produk
          </Link>
        </div>
      </div>
      
      {/* Product Highlights Section */}
      <div className="relative z-10 w-full max-w-6xl mt-24 mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-left">Laptop Terpopuler</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestProducts.map((item: any, i: number) => (
            <Link href={`/product/${item.id}`} key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer block text-left">
              <div className="w-full h-48 bg-gray-100 relative">
                <img src={item.image_url} alt={item.name} className="object-cover w-full h-full" />
                <span className="absolute top-3 right-3 text-xs font-bold text-blue-600 uppercase bg-blue-50/90 backdrop-blur px-2 py-1 rounded-md">{item.category}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mt-2 line-clamp-1">{item.name}</h3>
                <p className="text-blue-600 font-black mt-2">Rp {new Intl.NumberFormat("id-ID").format(item.price)}</p>
                <div className="mt-4 flex items-center text-xs text-gray-500">
                   {item.ram}GB RAM • {item.storage}GB Storage
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
