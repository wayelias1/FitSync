import React from 'react';
import '../styles/Profile.css'; // I will create this file later
import NavbarLoged from '../components/NavbarLoged';
import Footer from '../components/Footer';

export function Profile() {
  // Static user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    memberSince: 'January 2023',
    plan: 'Premium',
  };

  return (
    <>
      <NavbarLoged />
      <div className="profile-container">
        <h1>User Profile</h1>
        <div className="profile-card">
          <div className="profile-info">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Member Since:</strong> {user.memberSince}</p>
            <p><strong>Plan:</strong> {user.plan}</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
