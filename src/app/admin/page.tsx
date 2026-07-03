"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("products"); // 'products', 'users', 'chatlogs'
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Forms
  const [productForm, setProductForm] = useState({
    id: null, name: "", brand: "", category: "", price: 0, ram: 0, storage: 0,
    processor: "", processor_score: 0, gpu: "", gpu_score: 0,
    screen_score: 0, battery_score: 0, description: "", image_url: ""
  });
  
  const [userForm, setUserForm] = useState({
    id: null, name: "", email: "", password: "", role: "user"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = "products";
      if (activeTab === "users") endpoint = "users";
      if (activeTab === "chatlogs") endpoint = "chat-logs";
      if (activeTab === "reviews") endpoint = "reviews";
      
      const res = await fetch(`http://127.0.0.1:8000/api/${endpoint}`);
      const result = await res.json();
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Handle Input Changes
  const handleProductChange = (e: any) => {
    if (e.target.name === 'image') {
      setProductForm({ ...productForm, image: e.target.files[0] });
    } else {
      setProductForm({ ...productForm, [e.target.name]: e.target.value });
    }
  };
  const handleUserChange = (e: any) => setUserForm({ ...userForm, [e.target.name]: e.target.value });

  // Open Modals
  const openAddModal = () => {
    if (activeTab === "products") {
      setProductForm({
        id: null, name: "", brand: "", category: "", price: 0, ram: 0, storage: 0,
        processor: "", processor_score: 0, gpu: "", gpu_score: 0,
        screen_score: 0, battery_score: 0, description: "", image_url: ""
      });
    } else if (activeTab === "users") {
      setUserForm({ id: null, name: "", email: "", password: "", role: "user" });
    }
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    if (activeTab === "products") setProductForm(item);
    if (activeTab === "users") setUserForm({ ...item, password: "" }); // dont show hash
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/api/${activeTab}/${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const isProduct = activeTab === "products";
    const url = isProduct && productForm.id 
      ? `http://127.0.0.1:8000/api/${activeTab}/${productForm.id}` 
      : (!isProduct && userForm.id ? `http://127.0.0.1:8000/api/${activeTab}/${userForm.id}` : `http://127.0.0.1:8000/api/${activeTab}`);
    
    // For Laravel PUT/PATCH with files, we actually need to POST with _method=PUT
    let method = "POST"; 

    try {
      let bodyData;
      let headers: any = {};

      if (isProduct) {
        bodyData = new FormData();
        Object.entries(productForm).forEach(([key, value]) => {
          if (value !== null && value !== "") {
            bodyData.append(key, value as string);
          }
        });
        if (productForm.id) {
          bodyData.append('_method', 'PUT');
        }
      } else {
        bodyData = JSON.stringify(userForm);
        headers["Content-Type"] = "application/json";
        if (userForm.id) {
            method = "PUT"; // Users can use normal PUT since no files
        }
      }

      await fetch(url, {
        method: method,
        headers,
        body: bodyData
      });
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan data!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manajemen Sistem TechStore</p>
          </div>
          {activeTab !== "chatlogs" && (
            <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Tambah {activeTab === "products" ? "Produk" : "Pengguna"}
            </button>
          )}
        </div>

        {/* TABS */}
        <div className="flex space-x-4 mb-6">
          <button onClick={() => setActiveTab("products")} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "products" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>Katalog Produk</button>
          <button onClick={() => setActiveTab("users")} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "users" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>Akun Pengguna</button>
          <button onClick={() => setActiveTab("chatlogs")} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "chatlogs" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>Log Chat AI</button>
          <button onClick={() => setActiveTab("reviews")} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "reviews" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>Ulasan Produk</button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  {activeTab === "products" && (
                    <>
                      <th className="p-4">Produk</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Harga</th>
                      <th className="p-4 text-right">Aksi</th>
                    </>
                  )}
                  {activeTab === "users" && (
                    <>
                      <th className="p-4">Nama</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4 text-right">Aksi</th>
                    </>
                  )}
                  {activeTab === "chatlogs" && (
                    <>
                      <th className="p-4">Waktu</th>
                      <th className="p-4">User</th>
                      <th className="p-4 w-1/3">Pesan User</th>
                      <th className="p-4 w-1/3">Respons AI</th>
                    </>
                  )}
                  {activeTab === "reviews" && (
                    <>
                      <th className="p-4">Tanggal</th>
                      <th className="p-4">Produk</th>
                      <th className="p-4">User</th>
                      <th className="p-4">Rating</th>
                      <th className="p-4 w-1/3">Komentar</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">Memuat data...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">Belum ada data.</td></tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      {activeTab === "products" && (
                        <>
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <img src={item.image_url || "https://via.placeholder.com/50"} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                              <div>
                                <p className="font-bold text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-700">{item.category}</td>
                          <td className="p-4 font-semibold text-blue-600">Rp {new Intl.NumberFormat("id-ID").format(item.price)}</td>
                          <td className="p-4 text-right space-x-2">
                            <button onClick={() => openEditModal(item)} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium">Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium">Hapus</button>
                          </td>
                        </>
                      )}
                      
                      {activeTab === "users" && (
                        <>
                          <td className="p-4 font-bold text-gray-900">{item.name}</td>
                          <td className="p-4 text-gray-700">{item.email}</td>
                          <td className="p-4"><span className={`px-2 py-1 text-xs rounded-full font-bold uppercase ${item.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>{item.role}</span></td>
                          <td className="p-4 text-right space-x-2">
                            <button onClick={() => openEditModal(item)} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium">Edit</button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium">Hapus</button>
                          </td>
                        </>
                      )}

                      {activeTab === "chatlogs" && (
                        <>
                          <td className="p-4 text-gray-500 text-xs">{new Date(item.created_at).toLocaleString('id-ID')}</td>
                          <td className="p-4 font-bold">{item.user?.name || "Guest"}</td>
                          <td className="p-4 text-gray-800 whitespace-pre-wrap"><div className="bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">{item.user_message}</div></td>
                          <td className="p-4 text-gray-800 whitespace-pre-wrap"><div className="bg-blue-50 p-2 rounded max-h-32 overflow-y-auto border border-blue-100">{item.ai_response}</div></td>
                        </>
                      )}
                      {activeTab === "reviews" && (
                        <>
                          <td className="p-4 text-gray-500 text-xs">{new Date(item.created_at).toLocaleString('id-ID')}</td>
                          <td className="p-4 font-bold text-black">{item.product?.name}</td>
                          <td className="p-4 text-black">{item.user?.name || "Anonim"}</td>
                          <td className="p-4 text-yellow-500 font-bold">{item.rating} ★</td>
                          <td className="p-4 text-gray-800 whitespace-pre-wrap"><div className="bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">{item.comment}</div></td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto pt-20 pb-10">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">
              {activeTab === "products" ? (productForm.id ? "Edit Produk" : "Tambah Produk") : (userForm.id ? "Edit Pengguna" : "Tambah Pengguna")}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              
              {/* PRODUCT FORM */}
              {activeTab === "products" && (
                <>
                  <div className="col-span-2 sm:col-span-1"><label className="block text-sm text-gray-700 mb-1">Nama Produk</label><input required name="name" value={productForm.name} onChange={handleProductChange} className="w-full border rounded-lg p-2 bg-white text-black placeholder-gray-500" /></div>
                  <div className="col-span-2 sm:col-span-1"><label className="block text-sm text-gray-700 mb-1">Brand</label><input required name="brand" value={productForm.brand} onChange={handleProductChange} className="w-full border rounded-lg p-2 bg-white text-black placeholder-gray-500" /></div>
                  <div className="col-span-2 sm:col-span-1"><label className="block text-sm text-gray-700 mb-1">Harga (Rp)</label><input required type="number" name="price" value={productForm.price} onChange={handleProductChange} className="w-full border rounded-lg p-2 bg-white text-black placeholder-gray-500" /></div>
                  <div className="col-span-2 sm:col-span-1"><label className="block text-sm text-gray-700 mb-1">Kategori</label><input required name="category" value={productForm.category} onChange={handleProductChange} className="w-full border rounded-lg p-2 bg-white text-black placeholder-gray-500" /></div>
                  <div className="col-span-2 sm:col-span-1"><label className="block text-sm text-gray-700 mb-1">RAM (GB)</label><input required type="number" name="ram" value={productForm.ram} onChange={handleProductChange} className="w-full border rounded-lg p-2 bg-white text-black placeholder-gray-500" /></div>
                  <div className="col-span-2 sm:col-span-1"><label className="block text-sm text-gray-700 mb-1">Storage (GB)</label><input required type="number" name="storage" value={productForm.storage} onChange={handleProductChange} className="w-full border rounded-lg p-2 bg-white text-black placeholder-gray-500" /></div>
                  <div className="col-span-2 sm:col-span-1"><label className="block text-sm text-gray-700 mb-1">Processor</label><input required name="processor" value={productForm.processor} onChange={handleProductChange} className="w-full border rounded-lg p-2 bg-white text-black placeholder-gray-500" /></div>
                  <div className="col-span-2 sm:col-span-1"><label className="block text-sm text-gray-700 mb-1">GPU</label><input required name="gpu" value={productForm.gpu} onChange={handleProductChange} className="w-full border rounded-lg p-2 bg-white text-black placeholder-gray-500" /></div>
                  <div className="col-span-2 sm:col-span-1"><label className="block text-sm text-gray-700 mb-1">Gambar via File</label><input type="file" accept="image/*" name="image" onChange={handleProductChange} className="w-full border rounded-lg p-2 bg-white text-black" /></div>
                  <div className="col-span-2 sm:col-span-1"><label className="block text-sm text-gray-700 mb-1">Gambar via URL Link</label><input name="image_url" value={productForm.image_url || ""} onChange={handleProductChange} placeholder="https://..." className="w-full border rounded-lg p-2 bg-white text-black placeholder-gray-500" /></div>
                  <div className="col-span-2"><label className="block text-sm text-gray-700 mb-1">Deskripsi</label><textarea required name="description" value={productForm.description} onChange={handleProductChange} className="w-full border rounded-lg p-2 h-20 bg-white text-black placeholder-gray-500" /></div>
                  
                  <div className="col-span-2 grid grid-cols-4 gap-2 mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="col-span-4 text-xs font-bold text-blue-800 mb-2">Parameter AI (Skor 1-10)</p>
                    <div><label className="text-xs">CPU</label><input required type="number" name="processor_score" value={productForm.processor_score} onChange={handleProductChange} className="w-full border rounded p-1 text-sm bg-white text-black placeholder-gray-500" /></div>
                    <div><label className="text-xs">GPU</label><input required type="number" name="gpu_score" value={productForm.gpu_score} onChange={handleProductChange} className="w-full border rounded p-1 text-sm bg-white text-black placeholder-gray-500" /></div>
                    <div><label className="text-xs">Screen</label><input required type="number" name="screen_score" value={productForm.screen_score} onChange={handleProductChange} className="w-full border rounded p-1 text-sm bg-white text-black placeholder-gray-500" /></div>
                    <div><label className="text-xs">Battery</label><input required type="number" name="battery_score" value={productForm.battery_score} onChange={handleProductChange} className="w-full border rounded p-1 text-sm bg-white text-black placeholder-gray-500" /></div>
                  </div>
                </>
              )}

              {/* USER FORM */}
              {activeTab === "users" && (
                <>
                  <div className="col-span-2"><label className="block text-sm text-gray-700 mb-1">Nama Lengkap</label><input required name="name" value={userForm.name} onChange={handleUserChange} className="w-full border rounded-lg p-2 bg-white text-black placeholder-gray-500" /></div>
                  <div className="col-span-2"><label className="block text-sm text-gray-700 mb-1">Email</label><input required type="email" name="email" value={userForm.email} onChange={handleUserChange} className="w-full border rounded-lg p-2 bg-white text-black placeholder-gray-500" /></div>
                  <div className="col-span-2"><label className="block text-sm text-gray-700 mb-1">Password {userForm.id && "(Kosongkan jika tidak diubah)"}</label><input type="password" name="password" required={!userForm.id} value={userForm.password} onChange={handleUserChange} className="w-full border rounded-lg p-2 bg-white text-black placeholder-gray-500" /></div>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Role</label>
                    <select name="role" value={userForm.role} onChange={handleUserChange} className="w-full border rounded-lg p-2 bg-white text-black">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </>
              )}

              <div className="col-span-2 flex justify-end space-x-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
