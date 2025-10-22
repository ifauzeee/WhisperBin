'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Lock,
  Unlock,
  ServerOff,
  ShieldCheck,
  Code,
  HelpCircle,
  EyeOff,
  FileQuestion,
  FileCheck,
  FileUp,
  Sparkles,
  PackageOpen,
  Github,
  ExternalLink,
} from 'lucide-react';
import { JetBrains_Mono } from 'next/font/google';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
});

export default function HomePage() {
  const mainRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    let ctx = gsap.context(() => {
      gsap.from('.hero-anim', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.2,
      });

      gsap.from('.feature-card', {
        opacity: 0,
        y: 50,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.feature-container',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      gsap.from('.how-it-works-step', {
        opacity: 0,
        y: 50,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.how-it-works-container',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      gsap.from('.faq-item', {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.faq-container',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={mainRef}
      className="flex flex-col items-center min-h-screen text-center max-w-4xl mx-auto"
    >
      <div
        className="flex flex-col items-center justify-center flex-grow w-full px-4"
        style={{ minHeight: '80vh' }}
      >
        <div className="mt-12 w-full max-w-lg p-4 bg-gray-950/50 border border-gray-700 rounded-lg hero-anim">
          <pre
            className={`${jetBrainsMono.className} text-left 
	text-sm text-gray-500 overflow-hidden`}
          >
            <span className="text-green-400">// Data Anda sebelum enkripsi:</span>
            <br />
            {"{\n  \"pesan_rahasia\": \"Halo Dunia!\"\n}"}
            <br />
            <br />
            <span className="text-red-400">
              // Data Anda setelah enkripsi (yang dikirim):
            </span>
            <br />
            <span className="text-red-300 opacity-70">
              K:eU...[scrambled_data]...AxQ.
            </span>
          </pre>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md hero-anim">
          <Link
            href="/encrypt"
            className="group flex items-center justify-center gap-3 
	px-6 py-4 bg-blue-600 rounded-lg font-semibold text-white text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            <Lock className="w-5 h-5" />
            Mulai Enkripsi
          </Link>

          <Link
            href="/decrypt"
            className="group flex items-center justify-center gap-3 px-6 py-4 bg-green-600 rounded-lg font-semibold text-white text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
          >
            <Unlock className="w-5 h-5" />
            Mulai Dekripsi
          </Link>
        </div>

        <div className="mt-12 w-full max-w-md hero-anim">
          <Link
            href="/tools/hash-check"
            className="group flex items-center justify-center gap-3 px-6 py-4 bg-gray-700 rounded-lg font-semibold text-white text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
          >
            <FileCheck className="w-5 h-5" />
            Alat: Cek Integritas File (SHA-256)
          </Link>
        </div>
      </div>

      <div className="mt-24 w-full border-t border-gray-800 pt-12 px-4">
        <h2 className="text-3xl font-bold text-gray-200">
          Kenapa WhisperBin Aman?
        </h2>
        <p className="mt-2 text-gray-400">
          Dirancang dengan transparansi dan privasi sebagai prioritas utama.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-left feature-container">
          <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg feature-card">
            <ShieldCheck className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-xl font-semibold text-white">
              100% di Browser
            </h3>
            <p className="mt-2 text-gray-400">
              Semua proses enkripsi dan dekripsi terjadi di perangkat Anda. File
              Anda tidak pernah diunggah ke server mana pun.
            </p>
          </div>

          <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg feature-card">
            <ServerOff className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-xl font-semibold text-white">Tanpa Server</h3>
            <p className="mt-2 text-gray-400">
              Aplikasi ini tidak memiliki database. Kami tidak menyimpan file,
              teks, atau password Anda. Setelah Anda menutup browser, data itu
              hilang.
            </p>
          </div>

          <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg feature-card">
            <Code className="w-8 h-8 text-gray-400 mb-3" />
            <h3 className="text-xl font-semibold text-white">Open Source</h3>
            <p className="mt-2 text-gray-400">
              Seluruh kode proyek ini terbuka (open source). Anda atau siapa saja
              dapat memeriksa kode untuk memverifikasi keamanan kami.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-24 w-full border-t border-gray-800 pt-12 text-left pb-16 px-4">
        <h2 className="text-3xl font-bold text-gray-200 text-center">
          Bagaimana Ini Bekerja?
        </h2>
        <p className="mt-2 text-gray-400 text-center max-w-2xl mx-auto">
          Proses ini 100% terjadi di browser Anda. Server kami tidak pernah
          melihat data Anda.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto how-it-works-container">
          <div className="flex flex-col items-center text-center p-6 bg-gray-800/50 border border-gray-700 rounded-lg how-it-works-step">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500 mb-4">
              <FileUp className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              1. Input Data
            </h3>
            <p className="text-gray-400 text-sm">
              Anda memilih file atau mengetik teks. Data ini tetap ada di memori
              browser Anda.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-gray-800/50 border border-gray-700 rounded-lg how-it-works-step">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-600/20 text-green-400 border border-green-500 mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              2. Proses Kunci
            </h3>
            <p className="text-gray-400 text-sm">
              Kunci enkripsi dibuat. Jika Anda pakai password, kami gunakan
              PBKDF2. Jika tidak, kami buat kunci acak. Semua di sisi klien.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-gray-800/50 border border-gray-700 rounded-lg how-it-works-step">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-600/20 text-gray-400 border border-gray-500 mb-4">
              <PackageOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              3. Output Kode
            </h3>
            <p className="text-gray-400 text-sm">
              Data Anda dienkripsi (AES-GCM) dan diubah menjadi kode Base64
              (`P:...` atau `K:...`). Kode ini siap Anda salin dan bagikan.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-24 w-full border-t border-gray-800 pt-12 text-left pb-16 px-4">
        <h2 className="text-3xl font-bold text-gray-200 text-center">
          Pertanyaan Umum (FAQ)
        </h2>
        <div className="mt-10 max-w-3xl mx-auto space-y-4 faq-container">
          <details className="group p-4 bg-gray-800/50 border border-gray-700 rounded-lg cursor-pointer faq-item">
            <summary className="flex items-center justify-between font-medium text-lg text-white list-none">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                <span>Di mana file saya disimpan?</span>
              </div>
              <span className="text-gray-500 group-open:rotate-90 transition-transform duration-300">
                {'>'}
              </span>
            </summary>
            <p className="mt-3 text-gray-400 pl-8 transition-all duration-300 ease-in-out opacity-0 translate-y-[-10px] group-open:opacity-100 group-open:translate-y-0 pt-0">
              Tidak di mana pun. File Anda{' '}
              <strong>tidak pernah meninggalkan browser Anda.</strong> Seluruh
              proses—mulai dari membaca file, mengenkripsi, hingga menghasilkan
              kode—terjadi 100% di dalam komputer Anda (client-side). Kami tidak
              pernah mengunggah atau melihat data Anda.
            </p>
          </details>

          <details className="group p-4 bg-gray-800/50 border border-gray-700 rounded-lg cursor-pointer faq-item">
            <summary className="flex items-center justify-between font-medium text-lg text-white list-none">
              <div className="flex items-center gap-3">
                <EyeOff className="w-5 h-5 text-green-400" />
                <span>Apakah Anda menyimpan password saya?</span>
              </div>
              <span className="text-gray-500 group-open:rotate-90 transition-transform duration-300">
                {'>'}
              </span>
            </summary>
            <p className="mt-3 text-gray-400 pl-8 transition-all duration-300 ease-in-out opacity-0 translate-y-[-10px] group-open:opacity-100 group-open:translate-y-0 pt-0">
              Tidak. Password yang Anda masukkan hanya digunakan di dalam browser
              Anda untuk membuat kunci enkripsi (menggunakan PBKDF2). Password
              itu tidak pernah dikirim ke server dan langsung hilang saat Anda
              me-refresh halaman.
            </p>
          </details>

          <details className="group p-4 bg-gray-800/50 border border-gray-700 rounded-lg cursor-pointer faq-item">
            <summary className="flex items-center justify-between font-medium text-lg text-white list-none">
              <div className="flex items-center gap-3">
                <FileQuestion className="w-5 h-5 text-gray-400" />
                <span>
                  Apa bedanya "Dengan Password" dan "Tanpa Password"?
                </span>
              </div>
              <span className="text-gray-500 group-open:rotate-90 transition-transform duration-300">
                {'>'}
              </span>
            </summary>
            <p className="mt-3 text-gray-400 pl-8 transition-all duration-300 ease-in-out opacity-0 translate-y-[-10px] group-open:opacity-100 group-open:translate-y-0 pt-0">
              <strong>Dengan Password (Awalan P:):</strong> Kode output hanya
              bisa dibuka jika penerima memiliki password yang benar. Ini adalah
              opsi paling aman.
              <br />
              <br />
              <strong>Tanpa Password (Awalan K:):</strong> Kami membuatkan kunci
              enkripsi acak untuk Anda dan menyimpannya di dalam kode output. Ini
              lebih cepat, tapi siapa pun yang memiliki kode tersebut dapat
              membukanya. Ini berguna jika Anda hanya ingin "mengacak" data agar
              tidak bisa dibaca langsung.
            </p>
          </details>
        </div>
      </div>

      <div className="mt-16 w-full border-t border-gray-800 pt-16 text-center pb-20 px-4">
        <h2 className="text-3xl font-bold text-gray-200">
          Transparan & Terbuka untuk Anda
        </h2>
        <p className="mt-2 text-gray-400 max-w-xl mx-auto">
          Proyek ini 100% open source. Anda bisa memeriksa setiap baris kode
          untuk memverifikasi bahwa kami tidak pernah menyimpan atau mengirim
          data Anda.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="https://github.com/ifauzeee/WhisperBin"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-gray-200 rounded-lg font-semibold text-gray-900 text-lg hover:bg-white transition-all duration-300 transform hover:scale-105"
          >
            <Github className="w-6 h-6" />
            Lihat Kode di GitHub
            <ExternalLink className="w-5 h-5 opacity-70 group-hover:opacity-100" />
          </Link>
        </div>
      </div>
    </div>
  );
}