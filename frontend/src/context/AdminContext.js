import React, { createContext, useContext, useEffect, useState } from 'react';
import API_BASE from '../utils/apiBase';
import getImageUrl from '../utils/getImageUrl';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [designs, setDesigns] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const catRes = await fetch(`${API_BASE}/api/categories`);
        const cats = await catRes.json();
        setCategories(cats);

        const desRes = await fetch(`${API_BASE}/api/designs`);
        const data = await desRes.json();
        const withUrls = await Promise.all(
          data.map(async (d) => {
            let imageUrl = '';
            try {
              imageUrl = await getImageUrl(d.imageKey);
            } catch {}
            return {
              id: d.id,
              name: d.title,
              imageKey: d.imageKey,
              imageUrl,
              category: cats.find((c) => c.id === d.categoryId)?.name || '',
              main_category:
                cats.find((c) => c.id === d.categoryId)?.main_category || '',
              featured: d.featured,
              hidden: d.hidden,
            };
          })
        );
        setDesigns(withUrls);
      } catch {
        // ignore fetch errors
      }
    };
    load();
  }, []);

  const createCategory = async (name, mainCategory) => {
    const res = await fetch(`${API_BASE}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, main_category: mainCategory }),
    });
    if (res.ok) {
      const cat = await res.json();
      setCategories((prev) => [...prev, cat]);
    }
  };

  const renameCategory = async (id, name, mainCategory) => {
    const body = {};
    if (name !== undefined) body.name = name;
    if (mainCategory) body.main_category = mainCategory;
    const res = await fetch(`${API_BASE}/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, name: name ?? c.name, main_category: mainCategory || c.main_category } : c,
        ),
      );
    }
  };

  const deleteCategory = async (id) => {
    const res = await fetch(`${API_BASE}/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const uploadDesigns = async (
    files,
    categoryId,
    categoryName,
    mainCategory,
    baseName,
    onProgress,
    names = [],
  ) => {
    const uploaded = [];
    const base = baseName || `${categoryName}#`;
    const existingCount = designs.filter((d) => d.name.startsWith(base)).length;
    for (let i = 0; i < files.length; i += 1) {
      const fallback = `${base}${String(existingCount + i + 1).padStart(3, '0')}`;
      const name = names[i]?.trim() || fallback;
      const formData = new FormData();
      formData.append('category_id', categoryId);
      formData.append('title', name);
      formData.append('image', files[i]);

      const res = await fetch(`${API_BASE}/api/designs`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      const data = await res.json();
      let imageUrl = '';
      try {
        imageUrl = await getImageUrl(data.imageKey);
      } catch {}
      uploaded.push({
        id: data.id,
        name,
        category: categoryName,
        main_category: mainCategory,
        featured: data.featured,
        hidden: data.hidden,
        imageKey: data.imageKey,
        imageUrl,
      });
      if (onProgress) {
        onProgress(Math.round(((i + 1) / files.length) * 100));
      }
    }
    setDesigns((prev) => [...prev, ...uploaded]);
    return uploaded.length;
  };

  return (
    <AdminContext.Provider
      value={{
        categories,
        setCategories,
        designs,
        setDesigns,
        createCategory,
        renameCategory,
        deleteCategory,
        uploadDesigns,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
