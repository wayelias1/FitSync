import NavbarLoged from '../components/NavbarLoged.jsx';
import Footer from '../components/Footer.jsx';
import { MemberWelcome } from '../components/MemberWelcome.jsx';
import { ClassSchedule } from '../components/ClassSchedule.jsx';
import { MemberGoals } from '../components/MemberGoals.jsx';
import Payment from '../components/Payment.jsx';
import Gallery from '../components/Gallery.jsx';
import { Trainers } from '../components/Trainers.jsx';
import { Nutritionists } from '../components/Nutritionist.jsx';

export function IndexPage() {
  //const [isAdmin, setIsAdmin] = useState(false);

  // useEffect(() => {
  //   const rawUser = localStorage.getItem("auth_user");
  //   const user = rawUser ? JSON.parse(rawUser) : null;
  //   const userId = user?.id_user;

  //   if (userId) {
  //     fetch(`/user/${userId}`, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("token")}`, // 👈 si usas JWT
  //       },
  //     })
  //       .then((res) => res.json())
  //       .then((data) => {
  //         if (data.id_rol === 4) {
  //           setIsAdmin(true);
  //         }
  //       })
  //       .catch((err) => console.error("Error fetching user:", err));
  //   }
  // }, []);

//   useEffect(() => {
//   const rawUser = localStorage.getItem("auth_user");
//   const token = localStorage.getItem('auth_token');
//   const user = rawUser ? JSON.parse(rawUser) : null;
//   const userId = Number(user?.id_user);

//   if (userId) {
//     fetch(`/user/${userId}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//     })
//       .then((res) => {
//         if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
//         return res.json();
//       })
//       .then((data) => {
//         console.log("Respuesta del backend:", data);
//         if (data.id_rol === 4) {
//           setIsAdmin(true);
//         } else {
//           setIsAdmin(false);
//         }
//       })
//       .catch((err) => console.error("Error fetching user:", err));
//   }
// }, []);



  /*const [active, setActive] = useState('welcome') // 'welcome' | 'class' | 'goals'

  const content = active === 'welcome'
    ? <MemberWelcome />
    : active === 'class'
      ? <ClassSchedule />
      : <MemberGoals />

  return (
    <>
      <NavbarLoged onSelect={setActive} />
      <div className="main-content">
        {content}
      </div>
      <Footer />
    </>
  );
*/

  return (
    <>
      <NavbarLoged />
      <div className="main-content">
        <MemberWelcome />
        <ClassSchedule />
        <Trainers />
        <Nutritionists />
        <Gallery />
      </div>
      
      {/* <Gallery isAdmin={isAdmin} /> */}
      <Footer />
    </>
  );
}