// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'
// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(),
//     tailwindcss(),
//   ],
  
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Add these new configurations:
  server: {
    host: '0.0.0.0',  // Required for Render to detect the port
    port: 5173,       // Explicit port
    strictPort: true, // Prevents Vite from trying other ports
    proxy: {
      // Proxy API requests to your local Flask backend
      '/api': {
        target: 'http://localhost:5000', // Your local Flask server
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '') // Optional: removes '/api' prefix
      }
    }
  },
  preview: {
    host: '0.0.0.0',  // Required for Render preview mode
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',   // Specify build output directory
    emptyOutDir: true // Clears old files before building
  }
})