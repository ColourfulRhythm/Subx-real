# Subx Admin Frontend

This is the admin frontend for the Subx platform, built with React and Material-UI.

## Features

- Developer management (CRUD operations)
- Project management (CRUD operations)
- Dashboard with key metrics
- Authentication and authorization
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
2. Navigate to the admin-frontend directory:
   ```bash
   cd admin-frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

The admin frontend is configured to connect to the backend API. The API URL is set in `src/services/api.js`. Make sure the backend server is running and accessible.

## Development

To start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── pages/         # Page components
  ├── services/      # API services
  ├── App.js         # Main application component
  └── index.js       # Application entry point
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## Dependencies

- React
- React Router
- Material-UI
- Axios
- Emotion (for styled components)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
