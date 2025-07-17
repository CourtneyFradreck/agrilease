# 🌾 AgriLease

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/CourtneyFradreck/agrilease?utm_source=oss&utm_medium=github&utm_campaign=CourtneyFradreck%2Fagrilease&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

**AgriLease** is a mobile-first application that empowers farmers by giving them easy access to lease agricultural machinery nearby. It also serves as a marketplace for renting, buying, or selling equipment within a defined radius. The app is designed to bridge the equipment accessibility gap in rural areas by connecting farmers and equipment owners directly through a simple, intuitive interface.

Built with **React Native**, **TypeScript**, and **Expo**, AgriLease is focused on reliability, scalability, and offline-friendly features suited for agricultural communities.

---

## 🚜 Why AgriLease?

Many small to medium-scale farmers in regions like Zimbabwe struggle to access modern agricultural equipment due to cost or availability. AgriLease enables:

- Cost-effective short-term equipment rentals
- Equipment visibility based on proximity
- Peer-to-peer trust-building mechanisms for safe transactions
- Offline-first features with USSD/SMS/Call fallback planned for the future

---

## 📱 Current Features

- 📍 **GPS-Based Equipment Discovery**: Farmers can locate available equipment within 50–80 km.
- 🔍 **Browse Listings**: View various types of machinery (tractors, ploughs, etc.) available for rent.
- 📅 **Book Equipment**: Select availability dates and place lease requests.
- 🧾 **View Active Bookings**: Keep track of your current and past leases.
- 🧑‍🌾 **User Profiles**: Manage your personal information and lease history.
- 🕶️ **Modern UI**: Built with a clean, mobile-optimized interface using `expo-router` and custom components.

---

## 🔜 Upcoming Features

These features are currently under development or planned:

- 🧠 **AI-Based Equipment Recommendations**: Suggest machinery based on crop type and land size.
- 📊 **Farm Planning Tools**: Smart schedules and crop management assistance.
- 🔐 **Trust & Verification System**:
  - KYC (Know Your Customer)
  - User ratings & reviews
  - Optional insurance for rentals
- 💬 **WhatsApp and USSD Integration**: Book equipment via chat or USSD for offline access.
- 💰 **Flexible Payment Options**:
  - Crop-based payment arrangements
  - Microloan support
  - Integration with NGO/Government grant programs
- 🛒 **Buy & Sell Marketplace**: List or purchase used farm equipment.
- 🌐 **Multilingual Support**: Cater to local dialects and farmer-friendly terms.
- 🌙 **Dark Mode**: Theme toggle for low-light usage.

---

## ⚙️ Tech Stack

- [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- TypeScript
- Expo Router for navigation
- Expo Modules: Camera, Linear Gradient, Fonts, etc.
- React Navigation for screen management
- Day.js for date handling
- AsyncStorage for local state persistence

---

## 🚀 Getting Started

Clone the project:

1. Clone the repository:

```bash
git clone https://github.com/CourtneyFradreck/agrilease
cd agrilease
```

2. 📦 Install Dependencies

Before running the app, make sure all dependencies are installed:

```bash
npm install
```

---

3. 🔧 Start the Development Server

To run the app on your local machine using Expo:

```bash
npx expo start
```

Then:

- Open the **Expo Go** app on your physical device.
- Scan the QR code shown in your terminal or browser.
- The app will load automatically.

## 📦 Building the App for Testing

If you want to test the app on your phone without publishing it to the Play Store:

1. Make sure you have EAS CLI installed:

```bash
npm install -g eas-cli
```

2. Log in to your Expo account (if not already):

```bash
eas login
```

3. Build a preview APK:

```bash
eas build -p android --profile preview
```

After the build completes, download the `.apk` from your Expo account and install it manually on your Android device.

> No need to run `npx expo start` when testing a built APK — it runs independently.

---

## 📸 Screens

```
coming soon
```

## 🤝 Contributing

**AgriLease** is an open project—contributions are welcome! Whether you're a farmer, developer, or designer, you can help make AgriLease better. Submit a pull request or open an issue to get started.

### Steps to Contribute:

1. **Fork** this repo.
2. **Create** a new branch:  
   `git checkout -b feature/your-feature-name`
3. **Commit** your changes:  
   `git commit -m "Added new feature"`
4. **Push** your branch:  
   `git push origin feature/your-feature-name`
5. **Open** a Pull Request on GitHub.

## 📄 License

⚠️ This project is under a custom pre-release license. Do **not** deploy, distribute, or commercialize without permission. See [LICENSE](./LICENSE) for details.

## 🔗 Connect with the Developer

Developed with 💚 by **Courtney Fradreck**

- 🌍 **Portfolio**: [courtney.codes](https://courtney.codes)
- ✍️ **Blog**: [courtnotes.netlify.app](https://courtnotes.netlify.app)
- 🐙 **GitHub**: [@my-github](https://github.com/CourtneyFradreck)
