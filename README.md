# WhisperBin

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FUSERNAME%2FREPO-ANDA)**WhisperBin** is a web-based privacy tool that allows you to encrypt and decrypt files and text messages directly in your browser. This project is built on a philosophy of **absolute privacy**: your data never leaves your computer.

[Link to your Live Demo Here](https://your-project-name.vercel.app)

![WhisperBin Screenshot](https://via.placeholder.com/1200x600.png?text=Replace+me+with+a+screenshot+of+your+application!)

---

## 🚀 Key Features

* **Client-Side Encryption:** Encrypt files or text using modern cryptographic standards (AES-GCM).
* **Two Encryption Modes:**
    * **Password Protected (P:)**: Uses your password to generate a strong encryption key via PBKDF2.
    * **Passwordless (K:)**: Generates a random key and embeds it in the output code, ideal for quickly "scrambling" data.
* **Client-Side Decryption:** Securely decrypt data created by this tool in your browser.
* **File Integrity Checker:** Verify files with an SHA-256 hash calculator tool (which also runs 100% in the browser).
* **Modern Animations:** A smooth user interface powered by GSAP.

---

## 🛡️ Why It's Secure (Design Philosophy)

This project is designed from the ground up to build user trust. Our security claims are not just promises but architectural constraints.

* **100% In-Browser**
    All encryption, decryption, and hashing processes occur on your device using the standard [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API). Your files or text are never uploaded to any server.
* **Serverless / No Database**
    The application has no database. We do not store your files, text, or passwords. Once you close the browser tab, that sensitive data is gone.
* **Completely Open Source**
    The entire project code is open source. You or anyone can inspect every line of code to verify that we never transmit or store your data.

---

## ⚙️ How It Works (Technical Details)

The application runs in two distinct modes, identifiable by the output code prefix (`P:` or `K:`).

### 1. "Password Protected" Mode (Prefix `P:`)

This is the most secure mode, ideal for protecting sensitive data.

1.  **Input:** You provide a file/text and a password.
2.  **Salt:** A random cryptographic `salt` (16-byte) is created.
3.  **Key Derivation:** Your password and the `salt` are processed via **PBKDF2** with **100,000 iterations** and **SHA-256** to generate a secure 256-bit encryption key.
4.  **Encryption:** Your data is encrypted using **AES-GCM** with a random `iv` (12-byte).
5.  **Output (`P:`):** The output code is a Base64URL concatenation of:
    `P:<filename>.<filetype>.<salt>.<iv>.<encrypted_data>`.

For decryption, the same password and `salt` are used to regenerate the identical key to unlock the data.

### 2. "Passwordless" Mode (Prefix `K:`)

This mode is faster and useful if you only want to "scramble" data so it can't be read directly but don't require password security.

1.  **Input:** You provide a file/text (without a password).
2.  **Random Key:** Instead of PBKDF2, we directly create a strong random 256-bit AES-GCM `CryptoKey`.
3.  **Encryption:** Your data is encrypted using that random key and a random `iv` (12-byte).
4.  **Output (`K:`):** The random key is exported as raw data and combined into the output:
    `K:<filename>.<filetype>.<raw_key>.<iv>.<encrypted_data>`.

For decryption, the application extracts the `raw_key` directly from the code, imports it, and uses it to unlock the data.

---

## 🛠️ Technology Stack (Tech Stack)

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Cryptography:** [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) (via Web Worker)
* **Animation:** [GSAP (GreenSock Animation Platform)](https://gsap.com/)
* **UI:** [React](https://reactjs.org/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Password Validation:** [zxcvbn](https://github.com/dropbox/zxcvbn)

---

## 🏁 Getting Started (Local Development)

Interested in running this project locally or contributing?

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ifauzeee/WhisperBin
    cd WhisperBin
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
4.  Open (http://localhost:3000) in your browser to see the result.