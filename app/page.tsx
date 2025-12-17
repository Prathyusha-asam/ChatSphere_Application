import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    // #region Main Container
    <main className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-purple-50 to-white px-6 text-center relative overflow-hidden">

      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/images/background1.svg"
          alt=""
          width={120}
          height={120}
          className="absolute top-16 left-12 opacity-20"
        />

        <Image
          src="/images/background2.svg"
          alt=""
          width={100}
          height={100}
          className="absolute top-24 right-20 opacity-15"
        />
        <Image
          src="/images/background1.svg"
          alt=""
          width={120}
          height={120}
          className="absolute top-44 left-320 opacity-20"
        />

        <Image
          src="/images/background3.svg"
          alt=""
          width={140}
          height={140}
          className="absolute top-90 left-100 opacity-10"
        />
        <Image
          src="/images/background3.svg"
          alt=""
          width={140}
          height={140}
          className="absolute top-160 left-250 opacity-10"
        />

        <Image
          src="/images/background1.svg"
          alt=""
          width={160}
          height={160}
          className="absolute bottom-24 right-24 opacity-15"
        />

        <Image
          src="/images/background2.svg"
          alt=""
          width={110}
          height={110}
          className="absolute bottom-32 left-32 opacity-20"
        />
      </div>


      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 z-10">
        Connect Instantly. Chat Securely.
      </h1>

      <p className="text-gray-600 max-w-xl mb-8 z-10">
        Real-time messaging with Firebase & Next.js
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-14 z-10">
        <Link
          href="/register"
          className="px-10 py-3 bg-purple-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-purple-700 transition"
        >
          Get Started
        </Link>

        <Link
          href="/login"
          className="px-10 py-3 bg-white border border-gray-300 text-lg font-medium rounded-lg hover:bg-gray-100 transition"
        >
          Login
        </Link>
      </div>

      <div className="flex flex-wrap md:flex-nowrap justify-center gap-16 z-10 text-gray-700">
        <Feature icon="/images/message.svg" title="Realtime Messaging" />
        <Feature icon="/images/secure.svg" title="Secure Authentication" />
        <Feature icon="/images/typing.svg" title="Typing Indicators" />
        <Feature icon="/images/online.svg" title="Online Presence" />
      </div>
    </main>
    // #endregion Main Container
  );
}

function Feature({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    // #region Feature Card
    <div className="flex flex-col items-center text-center w-32">

      <div className="flex items-center justify-center h-14 w-14 mb-2">
        <Image
          src={icon}
          alt={title}
          width={48}
          height={48}
          className="object-contain"
        />
      </div>

      <p className="text-sm font-medium leading-tight">
        {title}
      </p>
    </div>
    // #endregion Feature Card
  );
}