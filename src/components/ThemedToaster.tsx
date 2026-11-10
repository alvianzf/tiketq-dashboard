import { Toaster } from "sonner";
import { useTheme } from "../context/ThemeContext";

// Sonner's own theme prop drives its built-in color tokens — point it at
// our toggle instead of system preference so toasts match the app.
const ThemedToaster = () => {
  const { theme } = useTheme();
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme={theme}
      toastOptions={{
        className: "shadow-2xl",
      }}
    />
  );
};

export default ThemedToaster;
