import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster as SonnerToaster } from "sonner";
import { Toaster } from "react-hot-toast"; // 🌟 Importamos el Toaster de react-hot-toast

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      
      {/* 🌟 Agregamos el contenedor de react-hot-toast en una posición premium */}
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          style: {
            fontSize: '14px',
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          }
        }} 
      />
      
      <SonnerToaster position="bottom-right" richColors />
    </>
  );
}
