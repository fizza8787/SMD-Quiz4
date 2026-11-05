# Phone OTP verification with Firebase

Expo app that checks a phone number with **Firebase Authentication**. The number and 6-digit code are the pair you saved in the Firebase console under **Authentication → Sign-in method → Phone → Phone numbers for testing**.

Firebase does not send an SMS to a test number. You type the code you saved next to that number. A wrong code shows **Verification failed**. The saved code shows **Verification successful**.

## Run

Close the old server window if it is still open. This app does not use it.

```powershell
cd c:\Users\HP\OneDrive\Desktop\22i-8787_Quiz4
npm install
npm start
```

Press `w` to open the app in the browser.

## Connect your Firebase project

1. In the Firebase console, open **Project settings** (the gear).
2. Under **Your apps**, select the **Web** app. Add a web app if there is none.
3. Copy the `firebaseConfig` object.
4. Paste it into the first screen of this app and tap **Save config**.
5. Enter the same phone number you saved under **Phone numbers for testing**. The preview must match, including the country code.
6. Tap **Request code**, then enter the 6-digit code you saved beside that number.

Phone sign-in has to stay enabled under **Authentication → Sign-in method**.

You can also put the same values in a root `.env` file. See `.env.example`. Restart Expo after changing it.

## Tests

```powershell
node --experimental-strip-types --test src/phone.test.ts src/firebaseConfig.test.ts
npx tsc --noEmit
```
