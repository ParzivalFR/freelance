"use client";

import { Safari } from "@/components/magicui/safari";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/magicui/terminal";

export default function SafariTerminal() {
  return (
    <Safari
          url="localhost:3000"
          width={1280}
          height={600}
          className="mx-auto w-full drop-shadow-2xl"
        >
          <Terminal className="border-gray-700 bg-black/95 backdrop-blur-sm">
            <AnimatedSpan delay={0}>
              <span className="text-cyan-400">gael@macbook</span>
              <span className="text-white">:</span>
              <span className="text-blue-400">~/portfolio</span>
              <span className="text-white">$ </span>
              <TypingAnimation delay={500} duration={80} className="text-white">
                npm run dev
              </TypingAnimation>
            </AnimatedSpan>

            <AnimatedSpan delay={2000}>
              <span className="text-gray-400">{">"} portfolio@1.0.0 dev</span>
            </AnimatedSpan>

            <AnimatedSpan delay={2500}>
              <span className="text-gray-400">{">"} next dev</span>
            </AnimatedSpan>

            <AnimatedSpan delay={3000}>
              <span className="text-green-400">✓</span>
              <span className="text-white"> Ready in 1.2s</span>
            </AnimatedSpan>

            <AnimatedSpan delay={3500}>
              <span className="text-gray-400">➜ Local: </span>
              <span className="text-cyan-400 underline">
                http://localhost:3000
              </span>
            </AnimatedSpan>

            <AnimatedSpan delay={4000}>
              <span className="text-gray-400">➜ Network: </span>
              <span className="text-gray-400">use --host to expose</span>
            </AnimatedSpan>

            <AnimatedSpan delay={5500}>
              <span className="text-cyan-400">gael@macbook</span>
              <span className="text-white">:</span>
              <span className="text-blue-400">~/portfolio</span>
              <span className="text-white">$ </span>
              <TypingAnimation
                delay={6000}
                duration={100}
                className="text-white"
              >
                git status
              </TypingAnimation>
            </AnimatedSpan>

            <AnimatedSpan delay={7500}>
              <span className="text-gray-400">On branch </span>
              <span className="text-green-400">main</span>
            </AnimatedSpan>

            <AnimatedSpan delay={8000}>
              <span className="text-gray-400">Your branch is up to date.</span>
            </AnimatedSpan>

            <AnimatedSpan delay={8500}>
              <span className="text-gray-400">nothing to commit, </span>
              <span className="text-green-400">working tree clean</span>
            </AnimatedSpan>

            <AnimatedSpan delay={9500}>
              <span className="text-cyan-400">gael@macbook</span>
              <span className="text-white">:</span>
              <span className="text-blue-400">~/portfolio</span>
              <span className="text-white">$ </span>
              <TypingAnimation
                delay={10000}
                duration={60}
                className="text-white"
              >
                echo "🚀 Prêt à propulser votre projet !"
              </TypingAnimation>
            </AnimatedSpan>

            <AnimatedSpan delay={12000}>
              <span className="text-yellow-400">
                🚀 Prêt à propulser votre projet !
              </span>
            </AnimatedSpan>

            <AnimatedSpan delay={13000}>
              <span className="text-cyan-400">gael@macbook</span>
              <span className="text-white">:</span>
              <span className="text-blue-400">~/portfolio</span>
              <span className="text-white">$ </span>
              <span className="animate-pulse">_</span>
            </AnimatedSpan>
          </Terminal>
    </Safari>
  );
}
