# iRacing Stat Tracker

A comprehensive application for tracking and analyzing your iRacing statistics, race history, and championship progress.

## Features

- Race history tracking and management
- Championship points calculation and analysis
- Performance analytics and visualization
- Season comparison tools
- Data backup and export/import functionality
- Fully client-side application with browser storage

## Documentation

### User Guides
- [Local Storage Guide](docs/LOCAL_STORAGE.md) - Understanding data storage and management
- [Race Management](docs/features/RACE_MANAGEMENT.md) - Managing race entries and history
- [Championship Analysis](docs/features/CHAMPIONSHIP_ANALYSIS.md) - Championship tracking and analysis tools
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md) - Common issues and solutions

### Developer Documentation
- [Development Guide](docs/DEVELOPMENT_GUIDE.md) - Getting started with development
- [Architecture Overview](docs/ARCHITECTURE.md) - Application architecture and data flow
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Deployment instructions

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/iracingstattracker.git
cd iracingstattracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Deployment

The application can be deployed using Docker:

```bash
# Build the Docker image
docker build -t iracingstattracker .

# Run the container
docker run -p 80:80 iracingstattracker
```

For detailed deployment instructions, see the [Deployment Guide](DEPLOYMENT_GUIDE.md).

## Development

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### Project Structure
```
iracingstattracker/
├── src/                # Source code
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── store/         # Redux store
│   ├── services/      # Utility services
│   └── types/         # TypeScript types
├── docs/              # Documentation
└── public/            # Static assets
```

### Key Technologies
- React 18
- TypeScript
- Redux Toolkit
- Material-UI
- Vite

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

For detailed development guidelines, see the [Development Guide](docs/DEVELOPMENT_GUIDE.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues:
1. Check the [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
2. Search existing [GitHub Issues](https://github.com/yourusername/iracingstattracker/issues)
3. Create a new issue if needed

## Acknowledgments

- Thanks to all contributors
- Built with React and TypeScript
- Powered by Vite
