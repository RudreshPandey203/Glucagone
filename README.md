# 🍎 Glucagone

A smart, AI-powered food tracking application designed to help you monitor your nutrition simply and effectively.

![App Screenshot](assets/icon.png)

## 📖 User Manual

### 1. **Home Dashboard**
Your daily command center.
- **Daily Progress**: See exactly how many Calories, Protein, Carbs, and Fat you've consumed today vs. your targets.
- **Weight Log**: Quickly log today's weight at the top left.
- **Recent Meals**: A list of what you've eaten today.

### 2. **Logging Food (The Magic Wand 🪄)**
We made tracking effortless with AI.
1.  Tap the **+** button.
2.  **Type what you ate** (e.g., *"2 eggs and a slice of toast"* or *"Chicken breast 200g"*).
3.  Tap the **Magic Wand (🪄)** icon.
4.  **Done!** The AI automatically calculates the Calories, Protein, Carbs, and Fat for you.
    - *Note: You can also enter values manually if you prefer.*

### 3. **History & Calendar**
Review your past nutrition.
- **Calendar View**: Swipe left/right to view past months. Dots indicate days with logs.
- **Day Detail**: Tap any date to see that day's full log and total macros.
- **Edit/Delete**: Made a mistake? Tap any food item in the list to edit or remove it.
- **Toggle View**: Tap "Hide Calendar" to see more logs on the screen.

### 4. **Analytics**
Visualize your long-term progress.
- **Time Periods**: Switch between **Weekly**, **Monthly**, and **3-Month** views.
- **Charts**: Interactive bar charts for Calories and Macros.
- **Weight Trend**: Track your weight changes over the last 30 days.

### 5. **Settings**
Customize the app to fit you.
- **Daily Targets**: Set your goals for Calories, Protein, Carbs, and Fat.
- **API Keys**: Manage your connection to Gemini AI and Supabase Database.
    - *Warning: Changing database keys can result in data loss if not careful.*

---

## 🛠️ For Developers: Installation & Setup

If you want to run this project locally or contribute:

### Prerequisites
- Node.js & npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase Project

### Setup
1.  **Clone the repo**:
    ```bash
    git clone https://github.com/RudreshPandey203/Glucagone.git
    cd Glucagone
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env` file in the root with your keys:
    ```bash
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
    EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key
    ```
4.  **Database Setup**:
    Run the SQL scripts provided in `database_setup.md` in your Supabase SQL Editor to create the necessary tables (`food_logs`, `weight_logs`).

### Running the App
```bash
npx expo start
```
- Scan the QR code with **Expo Go** on your phone.

## 📱 Build Standalone (APK/IPA)
See `deployment_guide.md` for instructions on building a standalone app using EAS.
