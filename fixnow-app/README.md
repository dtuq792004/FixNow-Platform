# FixNow App

FixNow is a cross-platform mobile application focused on repair/maintenance request workflows, built with Expo and React Native.

The app currently includes core authentication and note/request management flows, and is structured to scale with additional service features.

## ✨ Features

- **Expo Router**: A powerful file-system-based router for React Native.
- **TypeScript**: For type safety and improved developer experience.
- **Tailwind CSS (NativeWind)**: A utility-first CSS framework for rapid UI development.
- **Zustand**: A small, fast, and scalable state management solution.
- **React Hook Form**: Performant, flexible, and extensible forms with easy-to-use validation.
- **Feature-Sliced Design**: A scalable architecture for organizing your codebase.
- **ESLint & Prettier**: For consistent code style and quality.
- **Dark Mode Support**: Built-in support for light and dark themes.

## 🥞 Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) via [NativeWind](https://www.nativewind.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Server State/Data Fetching**: [TanStack React Query](https://tanstack.com/query/latest) + [Axios](https://axios-http.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Validation**: [Zod](https://zod.dev/) + [@hookform/resolvers](https://github.com/react-hook-form/resolvers)
- **UI Utilities**: class-variance-authority, clsx, tailwind-merge, tailwindcss-animate
- **Primitives**: @rn-primitives/label, @rn-primitives/slot, @radix-ui/react-slot
- **Storage**: @react-native-async-storage/async-storage, expo-secure-store
- **Media & Device**: expo-image, expo-image-picker, expo-haptics, expo-blur
- **Linting**: [ESLint](https://eslint.org/)
- **Formatting**: [Prettier](https://prettier.io/)

## 📂 Project Structure

This starter kit uses a feature-based directory structure to promote modularity and scalability. Instead of grouping files by type (e.g., all components in one folder, all hooks in another), code is organized by feature.

```
/
├── app/                # Expo Router routes (the "screens" of your app)
├── assets/             # Static assets like fonts and images
├── components/         # Global, shared, and reusable UI components
│   └── ui/             # Unstyled base components (Button, Input, etc.)
├── features/           # Feature-specific modules
│   ├── auth/           # Authentication feature
│   │   ├── components/ # React components specific to auth
│   │   ├── stores/     # Zustand stores for auth state
│   │   └── utils/      # Utility functions for auth
│   └── notes/          # Notes feature
│       ├── components/
│       ├── hooks/      # React Query hooks for notes
│       ├── services/   # Data fetching services for notes
│       └── types/      # TypeScript types for the notes feature
├── lib/                # Core libraries and utilities (constants, utils)
├── services/           # Global API service definitions
└── ...
```

### The `features` Directory

The `/features` directory is the heart of the application's business logic. Each subdirectory represents a distinct feature (e.g., `auth`, `profile`, `notes`). Inside each feature folder, you'll find all the code related to that feature:

- **`components`**: React components that are only used within this feature.
- **`hooks`**: React Query or other hooks for data fetching and logic.
- **`services`**: Functions that interact with APIs or external services.
- **`stores`**: State management stores (e.g., Zustand) for the feature's state.
- **`types`**: TypeScript interfaces and type definitions.

This approach makes the codebase easier to navigate and maintain as it grows. It also encourages code reusability and separation of concerns.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/sawsew467/expo-base
    cd expo-base
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables (optional):**
    - Copy the example `.env.example` file to a new `.env` file:
      ```bash
      cp .env.example .env
      ```
    - Add your API keys and configuration as needed.

4.  **Run the application:**

    ```bash
    npm start
    ```

    This will start the Metro bundler. You can then run the app on a simulator or a physical device.
    - Press `i` to run on the iOS Simulator.
    - Press `a` to run on the Android Emulator.
    - Scan the QR code with the Expo Go app on your phone.

## 📜 Available Scripts

- `npm start`: Starts the development server.
- `npm run android`: Runs the app on a connected Android device or emulator.
- `npm run ios`: Runs the app on the iOS simulator.
- `npm run web`: Runs the app in a web browser.
- `npm run lint`: Lints the codebase using ESLint.

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
