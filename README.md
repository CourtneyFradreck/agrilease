# 🌾 AgriLease

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

```bash
git clone https://github.com/CourtneyFradreck/agrilease
cd agrilease
npm install
npx expo start

```
Then scan the QR code in Expo Go or run it in an emulator.

## 📦 Building the App for Testing

To create a local APK for Android testing without Play Store:

```bash
eas build -p android --profile preview
````

Download the `.apk` from the EAS dashboard and install it on your device.

## 📸 Screens

A screen recording demo is available showing the prototype in use. You can convert this to a GIF or take screenshots and include them below:

```pgsql
[ Insert screen captures or link to demo video ]
```

## 🤝 Contributing

**AgriLease** is an open project—contributions are welcome! Whether you're a farmer, developer, or designer, you can help make AgriLease better. Submit a pull request or open an issue to get started.

## 📄 License

This project is licensed under the **MIT License**. See `LICENSE` for details.

## 🔗 Connect with the Developer

Developed with 💚 by **Courtney Fradreck**

* **Portfolio**: [courtney.codes](https://courtney.codes)
* **Blog**: [courtnotes.netlify.app](https://courtnotes.netlify.app)
* **GitHub**: [@my-github](https://github.com/CourtneyFradreck)



