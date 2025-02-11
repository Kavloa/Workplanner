FROM php:8.3.2-cli

# Install dependencies for Laravel
RUN apt-get update && apt-get install -y \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    curl \
&& docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the application files to the container
COPY . .

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Use Composer to install PHP dependencies
RUN composer install

# Expose the port the app runs on
EXPOSE 8000

# Run PHP's built-in server
CMD ["php", "artisan", "serve", "--host", "0.0.0.0", "--port", "8000"]

