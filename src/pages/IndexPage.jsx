import NavbarLoged from '../components/NavbarLoged.jsx';
import Footer from '../components/Footer.jsx';
import { MemberWelcome } from '../components/MemberWelcome.jsx';
import { ClassSchedule } from '../components/ClassSchedule.jsx';
import { MemberGoals } from '../components/MemberGoals.jsx';
import Payment from '../components/Payment.jsx';

export function IndexPage() {
  return (
    <>
      <NavbarLoged />
      <div className="main-content">
        <MemberWelcome />
        <ClassSchedule />
        <MemberGoals />
      </div>
    </>
  );
}