import HabitTracker from "@/components/HabitTracker";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Habit Tracker - Build Better Habits Daily</title>
        <meta name="description" content="Track your daily habits, measure progress, and build lasting routines with our minimal habit tracking app. Free, simple, and effective." />
      </Helmet>
      <HabitTracker />
    </>
  );
};

export default Index;
