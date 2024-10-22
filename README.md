# Pro Match Frontend

Pro Match is a web application built with Angular 18 for managing and administrating football leagues. This repository contains the frontend of the project. For the backend implementation, please check the backend repository.

## 🚀 Key Features

- Complete football league management
- Modern and responsive interface with Tailwind CSS and Flowbite
- Interactive calendar with FullCalendar
- Image management with Cloudinary
- Efficient tournament and match administration

## 📋 Prerequisites

- Node.js (v20.14.0)
- npm (version included with Node.js)
- Angular CLI (latest version compatible with Angular 18)

## 🛠️ Installation

1. Clone the repository:

```bash
git clone [https://github.com/guifreribas/pro_match_app]
cd pro-match
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   - Create an `environment.ts` file in `src/environments/` with the following content:

```typescript
export const environment = {
  production: false,
  api_url: "YOUR_API_URL",
  bucket_images_url: "YOUR_CLOUDINARY_URL",
};
```

## 🚦 Available Scripts

- `npm start`: Starts the development server
- `npm run build`: Builds the application for production
- `npm run watch`: Builds the application in watch mode
- `npm test`: Runs unit tests

## 🧰 Core Technologies

- **Angular 18**: Main framework for building the application
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Flowbite**: UI component library for Tailwind CSS
- **FullCalendar**: Calendar component library
- **Day.js**: JavaScript library for date manipulation
- **Cloudinary**: Cloud service for image management

## 🔗 Related Repositories

- Backend Repository: [https://github.com/guifreribas/pro_match_api]

## 💡 Development Notes

- The project follows Angular 18 best practices and conventions
- Make sure to set up the backend server and update the `api_url` in the environment files
- Cloudinary credentials are required for image upload functionality

## 📝 License

Attribution-NonCommercial 4.0 International
