import HabitTracker from "@/components/HabitTracker";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <main role="main">
      <Helmet>
        <title>GOLDENHOUR — Habit Tracker</title>
        <meta name="description" content="GOLDENHOUR — Track your daily habits, measure progress, and build lasting routines with our minimal habit tracking app." />
      </Helmet>
      <HabitTracker />
    </main>
  );
};

export default Index;
