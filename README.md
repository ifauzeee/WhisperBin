# WhisperBin 🤫

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%F%2F%2Fgithub.com%2Fifauzeee%2FWhisperBin)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Tech Stack: Next.js](https://img.shields.io/badge/tech-Next.js-black?logo=nextdotjs)](https://nextjs.org/)

Encrypt and share files or text with absolute privacy. **WhisperBin** is a tool that runs 100% in your browser. Your data **never** leaves your device.

### [➡️ Try it Live (Live Demo) ⬅️](https://whisper-bin.vercel.app/)

---

<p align="center">
  <img src="https://via.placeholder.com/1200x600.png?text=Replace+me+with+a+Screenshot+or+GIF+demo!" alt="WhisperBin Demo">
</p>

## 🚀 Key Features

* **Secure In-Browser Encryption:** Encrypt files or text using modern cryptographic standards (AES-GCM) right on your device.
* **Flexible Security Modes:**
    * [cite_start]**Password Protected (Prefix `P:`):** Uses your password to generate a strong encryption key via PBKDF2 (100,000 iterations) [cite: 207, 214-215].
    * **Passwordless (Prefix `K:`):** Creates a random key and embeds it in the output code. [cite_start]Ideal for quickly "scrambling" data [cite: 216-218].
* **Large File Handling:** Bypasses mobile clipboard limits by allowing you to **download** the encrypted code as a `.txt` file and **import** it back for decryption.
* **File Integrity Checker:** Verify files with an SHA-256 hash calculator tool (which also runs 100% in-browser).
* **Modern Interface:** A smooth, responsive UI with animations powered by GSAP.

---

## 🛡️ Your Data Never Leaves Your Device

This isn't a promise; it's an architectural constraint. Your security is our first priority.

* **100% Client-Side**
    All processes—encryption, decryption, and hashing—happen inside your browser using the standard [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API). [cite_start]Your file is never uploaded to any server [cite: 52-53].

* **No Server, No Database**
    This application has no backend or database. [cite_start]We do not store your files, text, or passwords [cite: 54-56]. Once you close the browser tab, that sensitive data is gone.

* **Completely Open Source**
    The entire project code is open to the public. [cite_start]You or anyone can inspect every line of code to verify that we never transmit or store your data [cite: 57-58].

---

## ⚙️ How It Works (Technical Details)

The application runs in two distinct modes, identifiable by the output code prefix.

### 1. `P:` Mode (Password Protected)

This is the most secure mode, ideal for protecting sensitive data.

1.  **Input:** You provide a file/text and a password.
2.  **Salt:** A random 16-byte cryptographic `salt` is created.
3.  **Key Derivation:** Your password and the `salt` are processed via **PBKDF2** with **100,000 iterations** and **SHA-256** to generate a secure 256-bit encryption key.
4.  **Encryption:** Your data is encrypted using **AES-GCM** with a random 12-byte `iv`.
5.  **Output (`P:`):** The output code is a Base64URL concatenation of:
    `P:<filename>.<filetype>.<salt>.<iv>.<encrypted_data>`.

### 2. `K:` Mode (Passwordless)

This mode is faster and useful if you just want to "scramble" data so it can't be read directly.

1.  **Input:** You provide a file/text (no password).
2.  **Random Key:** Instead of PBKDF2, we directly create a strong, random 256-bit AES-GCM `CryptoKey`.
3.  **Encryption:** Your data is encrypted using that random key and a random 12-byte `iv`.
4.  [cite_start]**Output (`K:`):** The random key is exported as raw data and combined into the output [cite: 217-218]:
    `K:<filename>.<filetype>.<raw_key>.<iv>.<encrypted_data>`.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Cryptography:** [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) (running in a Web Worker)
* **Animation:** [GSAP (GreenSock Animation Platform)](https://gsap.com/)
* **UI:** [React](https://reactjs.org/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Password Validation:** [zxcvbn](https://github.com/dropbox/zxcvbn)

---

## 🏁 Getting Started (Local Development)

Interested in running this project locally or contributing?

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/ifauzeee/WhisperBin.git]
    cd WhisperBin
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    # or
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    pnpm run dev
    ```

4.  Open [http://localhost:3000] in your browser to see the result.

---

