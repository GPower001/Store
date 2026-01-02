// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(),
//     , tailwindcss()
//   ],
//   server: {
//     proxy: {
//       "/api": "http://localhost:5000", // Redirects /api/* to backend
//     },
//   },
  
// })

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss()
//   ],
//   server: {
//     proxy: {
//       // API routes
//       '/api': {
//         target: ['http://localhost:5000', 'https://inventory-sycr.onrender.com'],
//         changeOrigin: true
//       },
//       // Socket.IO routes
//       '/socket.io': {
//         target: ['http://localhost:5000', 'https://inventory-sycr.onrender.com'],
//         ws: true,
//         changeOrigin: true
//       }
//     }
//   },
//   optimizeDeps: {
//     include: ['react', 'react-dom']
//   }
// })

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Determine the target based on the environment
const isDevelopment = process.env.NODE_ENV === 'development';
const apiTarget = isDevelopment
  ? 'http://localhost:5000' // Development backend
  : 'https://inventory-sycr.onrender.com'; // Production backend

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // API routes
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
      // Socket.IO routes
      '/socket.io': {
        target: apiTarget,
        ws: true,
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});

