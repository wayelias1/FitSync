import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Settings.css';
import NavbarLoged from '../components/NavbarLoged';
import Footer from '../components/Footer';

export function Settings() {
    const [user, setUser] = useState({
        name: '',
        last_name: '',
        number: '',
        email: ''
    });
    const [formData, setFormData] = useState({
        number: '',
        password: '',
        confirmPassword: ''
    });
    const [originalNumber, setOriginalNumber] = useState(''); // Guardar el número original
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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

            const userId = userData.id || userData.id_user || userData.sub;

            if (!userId) {
                setError('No se pudo identificar el ID del usuario.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://127.0.0.1:5000/user/${userId}`, {
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
                
                setUser({
                    name: userProfile.name || '',
                    last_name: userProfile.last_name || '',
                    number: userProfile.number || '',
                    email: userProfile.email || ''
                });

                // Guardar tanto en formData como en originalNumber
                setFormData(prev => ({
                    ...prev,
                    number: userProfile.number || ''
                }));
                setOriginalNumber(userProfile.number || '');
                
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError('Error al cargar los datos del usuario.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validar que al menos un campo esté completo
        if (!formData.number && !formData.password) {
            setError('Debes completar al menos un campo para actualizar.');
            return;
        }

        // Validar contraseñas si se está cambiando
        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        // Validar longitud mínima de contraseña
        if (formData.password && formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        const rawUser = localStorage.getItem('auth_user');
        const token = localStorage.getItem('auth_token');

        if (!rawUser || !token) {
            setError('No se encontró la sesión del usuario.');
            navigate('/login');
            return;
        }

        let userData;
        try {
            userData = JSON.parse(rawUser);
        } catch (error) {
            console.error('Error parsing user data:', error);
            setError('Error en los datos de sesión.');
            return;
        }

        const userId = userData.id || userData.id_user || userData.sub;

        if (!userId) {
            setError('No se pudo identificar el ID del usuario.');
            return;
        }

        setUpdating(true);

        try {
            // CORRECCIÓN: Solo enviar el número si realmente cambió
            const updateData = {};
            
            // Solo enviar number si es diferente al original Y no está vacío
            if (formData.number && formData.number !== originalNumber) {
                updateData.number = formData.number;
            }
            
            // Solo enviar password si se proporcionó una nueva
            if (formData.password) {
                updateData.password_encrypted = formData.password;
            }

            // Validar que al menos un campo tenga cambios reales
            if (Object.keys(updateData).length === 0) {
                setError('No hay cambios para actualizar.');
                setUpdating(false);
                return;
            }

            console.log('Enviando datos a actualizar:', updateData);

            const response = await fetch(`http://127.0.0.1:5000/api/user/update/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar los datos');
            }

            setSuccess('Datos actualizados correctamente.');
            
            // Limpiar campos de contraseña
            setFormData(prev => ({
                ...prev,
                password: '',
                confirmPassword: ''
            }));

            // Actualizar datos del usuario en el estado y el número original
            if (updateData.number) {
                setUser(prev => ({
                    ...prev,
                    number: updateData.number
                }));
                setOriginalNumber(updateData.number);
            }
            
        } catch (err) {
            console.error('Error updating user data:', err);
            setError(err.message || 'Error al actualizar los datos.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <>
                <NavbarLoged />
                <div className="profile-container">
                    <div className="loading">Cargando configuración...</div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <NavbarLoged />
            <div className="profile-container">
                <h1>Configuración</h1>
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <h2>{user.name} {user.last_name}</h2>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="settings-form">
                        <div className="info-group">
                            <label>Email actual</label>
                            <p className="current-email">
                                {user.email}
                            </p>
                        </div>

                        <div className="info-group">
                            <label htmlFor="number">Número de teléfono</label>
                            <input
                                type="text"
                                id="number"
                                name="number"
                                value={formData.number}
                                onChange={handleInputChange}
                                placeholder="Ingresa tu nuevo número"
                                className="settings-input"
                            />
                            {formData.number !== originalNumber && (
                                <small style={{color: '#667eea'}}>Número modificado</small>
                            )}
                        </div>

                        <div className="info-group">
                            <label htmlFor="password">Nueva contraseña</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Ingresa nueva contraseña"
                                className="settings-input"
                            />
                        </div>

                        <div className="info-group">
                            <label htmlFor="confirmPassword">Confirmar contraseña</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirma la contraseña"
                                className="settings-input"
                            />
                        </div>

                        <div className="profile-actions">
                            <button 
                                type="submit" 
                                className="edit-btn"
                                disabled={updating}
                            >
                                {updating ? 'Actualizando...' : 'Actualizar Datos'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
}