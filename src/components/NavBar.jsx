// En el componente Navbar
import { Switch } from "@mui/material"; // Usamos el switch de MUI

export const Navbar = ({ toggleDarkMode, darkMode }) => {
  return (
    <nav className="bg-gray-200 dark:bg-gray-800 p-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">The Point</h1>
      </div>
      <div>
        {/* Cambiar el modo oscuro con un switch */}
        <Switch
          checked={darkMode}
          onChange={toggleDarkMode}
          color="default"
        />
      </div>
    </nav>
  );
};
