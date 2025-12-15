import NavbarLoged from '../components/NavbarLoged.jsx';
import Footer from '../components/Footer.jsx';
import { MemberWelcome } from '../components/MemberWelcome.jsx';
import { ClassSchedule } from '../components/ClassSchedule.jsx';
import Gallery from '../components/Gallery.jsx';
import { Trainers } from '../components/Trainers.jsx';
import { Nutritionists } from '../components/Nutritionist.jsx';
import { useEffect, useState } from 'react';

export function IndexPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  //const [isTrainer, setIsTrainer] = useState(false);
  //const [isVip, setIsVip] = useState(false);
  useEffect(() => {
    const rawUser = localStorage.getItem("auth_user");
    const user = rawUser ? JSON.parse(rawUser) : null;
    const userId = Number(user?.id_user);
    const token = localStorage.getItem("auth_token");

    if (userId && token) {
      fetch(`/user/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
          //console.log("Datos del usuario:", res.json());
          return res.json();
        })
        .then((data) => {
          //console.log("Datos del usuario:", data);
          //console.log(typeof data.id_rol, data.id_rol)
          setIsAdmin(Number(data.id_rol) === 4);
          //setIsTrainer(Number(data.id_rol) === 3);
          //setIsVip(Number(data.id_rol) === 2);
        })
        .catch((err) => console.error("Error fetching user:", err));
    }
  }, []);

  return (
    <>
      <NavbarLoged />
      <div className="main-content">
        <MemberWelcome />
        <ClassSchedule />
        <Trainers />
        <Nutritionists />
        <Gallery isAdmin={isAdmin} />
      </div>
      <Footer />
    </>
  );
}