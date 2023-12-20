# SocialMedia Platform - Diploma Work

Welcome to the SocialMedia Platform, a comprehensive social networking application developed as part of my diploma work. This platform includes various features such as pages, events, groups, private chat, group chat, personal emotes for chats, live chat, and other basic social media functionalities.

## Installation Guide

Follow these steps to set up and run the SocialMedia Platform on your local environment:

### 1. Clone the Repository

### 2. Create a MySQL Database

Create a new MySQL database for the SocialMedia Platform.

### 3. Configure Environment Variables

Copy the `.env.example` file and rename it to `.env`. Open the `.env` file and configure it with the database information.

### 4. Generate Application Key

Run the following command to generate a unique application key:

```bash
php artisan key:generate
```

### 5. Install Dependencies

```bash
composer install
npm install
```

### 6. Create Symbolic Link for Storage

```bash
php artisan storage:link
```

### 7. Serve the Application

```bash
php artisan serve
```

### 8. Start WebSocket Server

```bash
php artisan websocket:serve
```

### 9. Run NPM Watch

```bash
npm run watch
```

### 10. Open the Application

Visit [http://localhost:8000](http://localhost:8000) in your web browser.

Now you have successfully set up the SocialMedia Platform on your local environment! Feel free to explore the various features and functionalities.

Thank you for checking out my diploma work! I hope you enjoy using the SocialMedia Platform.
