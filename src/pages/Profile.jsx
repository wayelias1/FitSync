import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css'; 
import NavbarLoged from '../components/NavbarLoged';
import Footer from '../components/Footer';

export function Profile() {
    const [user, setUser] = useState({
        name: '',
        last_name: '',
        number: '',
        email: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const rawUser = localStorage.getItem('auth_user');
            const token = localStorage.getItem('auth_token');

            if (!rawUser || !token) {
                setError('No se encontró la sesión del usuario.');
                setLoading(false);
                navigate('/login');
                return;
            }

            let userData;
            try {
                userData = JSON.parse(rawUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
                setError('Error en los datos de sesión.');
                setLoading(false);
                return;
            }

            // Obtener el ID del usuario de la misma manera que en EliminateUserPage
            const userId = userData.id || userData.id_user || userData.sub;

            if (!userId) {
                setError('No se pudo identificar el ID del usuario.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/user/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al obtener los datos del usuario');
                }

                const userProfile = await response.json();
                
                // Mapear los datos de Supabase
                setUser({
                    name: userProfile.name || '',
                    last_name: userProfile.last_name || '',
                    number: userProfile.number || '',
                    email: userProfile.email || ''
                });
                
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Error al cargar los datos del usuario.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    if (loading) {
        return (
            <>
                <NavbarLoged />
                <div className="profile-container">
                    <div className="loading">Cargando perfil...</div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <NavbarLoged />
                <div className="profile-container">
                    <div className="error">{error}</div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <NavbarLoged />
            <div className="profile-container">
                <h1>Mi Perfil</h1>
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <h2>{user.name} {user.last_name}</h2>
                    </div>
                    <div className="profile-info">
                        <div className="info-group">
                            <label>Nombre</label>
                            <p>{user.name || 'No especificado'}</p>
                        </div>
                        <div className="info-group">
                            <label>Apellido</label>
                            <p>{user.last_name || 'No especificado'}</p>
                        </div>
                        <div className="info-group">
                            <label>Teléfono</label>
                            <p>{user.number || 'No especificado'}</p>
                        </div>
                        <div className="info-group">
                            <label>Email</label>
                            <p>{user.email || 'No especificado'}</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}