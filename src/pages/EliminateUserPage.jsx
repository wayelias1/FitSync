import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/ELiminateUserPage.css'

export default function EliminateUserPage() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleDelete = async () => {
        const rawUser = localStorage.getItem('auth_user');
        const token = localStorage.getItem('auth_token');

        if (!rawUser || !token) {
            alert('No se encontró la sesión del usuario.');
            navigate('/login');
            return;
        }

        let user;
        try {
            user = JSON.parse(rawUser);
        } catch (error) {
            console.error('Error parsing user data:', error);
            alert('Error en los datos de sesión.');
            return;
        }

        // Intentar obtener el ID del usuario (ajustar según la estructura real de tu objeto user)
        const userId = user.id || user.id_user || user.sub;

        if (!userId) {
            alert('No se pudo identificar el ID del usuario.');
            return;
        }

        if (!window.confirm('¿Estás SEGURO de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            return;
        }

        setLoading(true);

        try {
            // Nota: Usamos la URL completa si el proxy en vite.config.js no cubre '/user'
            // Si '/user' estuviera en el proxy, podrías usar '/user/delete/...'
            const response = await fetch(`/user/delete/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert('Tu cuenta ha sido eliminada correctamente.');
                // Limpiar almacenamiento local
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                localStorage.removeItem('user');
                
                // Redirigir al inicio o login
                window.location.href = '/'; 
            } else {
                const data = await response.json();
                alert(data.message || 'Ocurrió un error al eliminar la cuenta.');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="eliminate-user-page">
            <div className="eliminate-card">
                <h1>¿Estás seguro de eliminar tu cuenta?</h1>
                <p>Esta acción es irreversible y perderás todos tus datos.</p>
                <div className="actions">
                    <button 
                        className="btn-delete" 
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? 'Eliminando...' : 'Eliminar permanentemente'}
                    </button>
                    <Link to="/home" className="btn-cancel">Cancelar</Link>
                </div>
            </div>
        </div>
    )
}