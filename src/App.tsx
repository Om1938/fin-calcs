// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router";
import EMICalculatorPage from "@/pages/EMICalculatorPage";
import { motion } from "framer-motion";

// Example: If you have more calculators, import them here
// import { AnotherCalculatorPage } from "@/pages/AnotherCalculatorPage";

interface CalculatorMeta {
  path: string;
  name: string;
  description: string;
  component: React.FC;
}

// This array configures your calculators
const calculators: CalculatorMeta[] = [
  {
    path: "/emi",
    name: "EMI Calculator",
    description: "Calculate monthly loan EMIs with or without prepayments.",
    component: EMICalculatorPage,
  },
  // {
  //   path: "/savings",
  //   name: "Savings Calculator",
  //   description: "Plan your monthly or yearly savings.",
  //   component: AnotherCalculatorPage,
  // },
];

//-------------------------------------------------------------
// LANDING PAGE (HOME)
//-------------------------------------------------------------
const Home: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen w-full flex flex-col"
    >
      {/* Hero / Header Section */}
      <div className="relative w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 overflow-hidden py-20 px-6 flex flex-col items-center text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
        >
          Finance Calculators
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="max-w-2xl text-base md:text-lg text-white/90"
        >
          Simplify your financial planning with our easy-to-use calculators.
        </motion.p>

        {/* Decorative shapes or background elements could go here */}
      </div>

      {/* Main Content: Cards Section */}
      <div className="flex-grow bg-gray-50 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {calculators.map((calc) => (
              <Link
                key={calc.path}
                to={calc.path}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-lg p-6 flex flex-col transition"
              >
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="flex flex-col flex-grow"
                >
                  <h2 className="text-xl font-semibold mb-2 text-gray-900">
                    {calc.name}
                  </h2>
                  <p className="text-sm text-gray-600">{calc.description}</p>
                  <span className="mt-auto pt-4 text-indigo-600 font-medium group-hover:underline">
                    Get Started →
                  </span>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer (Optional) */}
      <footer className="bg-white py-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p className="mb-0">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </p>
      </footer>
    </motion.div>
  );
};

//-------------------------------------------------------------
// APP ROUTES
//-------------------------------------------------------------
export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {calculators.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
