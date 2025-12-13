import '../styles/Gallery.css'
import { useEffect, useState, useRef } from 'react';

export default function Gallery({ isAdmin }) {

    const [images, setImages] = useState([])
    const [zoom, setZoom] = useState(null);

    useEffect(() => {

  const controller = new AbortController()

  const load = async () => {
    try {
      const res = await fetch('/api/gallery', { signal: controller.signal }) // ojo con la barra final

      if (!res.ok) {
        //console.error('Gallery load failed status', res.status)
        setImages([])
        return
      }

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        //console.error('Gallery: expected JSON but got', contentType)
        const text = await res.text()   // lee el cuerpo aunque sea HTML
        //console.log("Respuesta no JSON:", text)
        setImages([])
        return
      }

      const data = await res.json()
      //console.log("Respuesta JSON cruda:", data)   // 👈 aquí ves lo que llega

      const normalized = (Array.isArray(data) ? data : []).map((d, i) => ({
        id: d.id ?? `api-${i}`,
        url: d.ruta_imagen ?? '',
        alt: d.titulo ?? `Imagen ${i}`
      })).filter(x => x.url)

      //console.log("Imágenes normalizadas:", normalized) // 👈 ves cómo quedaron
      setImages(normalized)
    } catch (err) {
      if (err.name !== 'AbortError') {
        //console.error('Gallery fetch error:', err)
        setImages([])
      }
    }
  }

  load()
  return () => controller.abort()
}, [])

// Crear imagen (POST)
const fileInputRef = useRef(null);

const addImage = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("titulo", file.name);

  try {
    const res = await fetch("/api/gallery", {
      method: "POST",
      body: formData, // 👈 aquí va FormData
    });

    if (!res.ok) throw new Error("Error al subir imagen");
    const created = await res.json();
    setImages((prev) => [...prev, created]);
  } catch (err) {
    console.error("Add image failed:", err);
  }
};

// Abre el diálogo de selección de archivo y modifica segun su uso
const openFileDialog = () => {
  fileInputRef.current.click();
};

const [editImageId, setEditImageId] = useState(null);

const handleFileDialog = (imageId = null) => {
  setEditImageId(imageId); // si viene un id, es update; si es null, es add
  fileInputRef.current.click();
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (editImageId) {
    // actualizar imagen existente
    await updateImage(editImageId, file);
  } else {
    // añadir nueva imagen
    await addImage(file);
  }

  setEditImageId(null); // reset
};


// Actualizar imagen (PUT)
const updateImage = async (imageId, file) => {
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("titulo", file.name);

  try {
    const res = await fetch(`/api/gallery/${imageId}`, {
      method: "PUT",
      body: formData, // 👈 enviamos el archivo
    });

    if (!res.ok) throw new Error("Error al actualizar imagen");
    const updated = await res.json();

    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? updated : img))
    );
  } catch (err) {
    console.error("Update image failed:", err);
  }
};

// Eliminar imagen (DELETE)
const deleteImage = async (id) => {
  try {
    const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar imagen');
    await res.json();
    setImages(prev => prev.filter(img => img.id !== id));
  } catch (err) {
    console.error('Delete image failed:', err);
  }
};

    const toggleZoom = (e) => {
        e.target.classList.toggle("zoom");
    };

    return (
        <section className="Gallery">
            <div className="Gallery-container">
                <div className="Gallery-content">
                    <div className="gallery-header">
                        <h2>Gallery</h2>
                    </div>
                    {/* Recolocar el usar el ! en admin mientras no esta definida la vista de roles */}
                    <div className='gallery-images'>
                      {isAdmin ? (
                        <>
                        {/* <div className="gallery-images"> */}
                          {images.map((img) => (
                            <div className='gallery-image-container' key={img.id}>
                              <img
                                src={img.url} // ruta relativa a public/
                                alt={img.alt || ''}
                                className='gallery-image'
                                onClick={toggleZoom}
                              />
                              <div className='gallery-image-actions'>
                                <button className="edit-image" onClick={() => handleFileDialog(img.id)} >
                                  Cambiar
                                </button>
                                <button className="delete-image" onClick={() => deleteImage(img.id)} >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          ))}
                            <button className='add-image' onClick={openFileDialog}>
                              <i>+</i>Añadir imagen
                            </button>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                              />
                      {/*</div>*/}
                        </>
                    ) : (
                      <>
                      {/* <div className="gallery-images"> */}
                        {images.map((img) => (
                          <div className='gallery-image-container' key={img.id}>
                            <img
                              key={img.id}
                              src={img.url} // ruta relativa a public/
                              alt={img.alt || ''}
                              className='gallery-image'
                              onClick={toggleZoom}
                            />
                          </div>
                        ))}
                        {/*</div>*/}
                      </>
                      
                    )}
                  </div>  
                </div>
            </div>
        </section>
    )
}