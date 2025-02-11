import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],
            refresh: true,
            mixUrl: 'http://laravel-app-1:8000' // Change this URL to match your Laravel app's container name
        }),
    ],
});
