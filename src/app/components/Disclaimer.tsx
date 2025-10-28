'use client';

export default function Disclaimer() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="text-center">
        <div className="text-xs font-semibold tracking-wide mb-1 uppercase text-disclaimer">Disclaimer</div>
        <p className="text-xs leading-relaxed text-gray-400">
          A Reditto é uma ferramenta de apoio baseada em inteligência artificial para correção e sugestão de melhorias em redações. Nosso objetivo é auxiliar no processo de aprendizado e desenvolvimento da escrita. No entanto, não substituímos a orientação de professores ou profissionais especializados em correção textual. Recomendamos sempre buscar avaliação humana para uma análise completa e personalizada.
        </p>
        <div className="mt-6 flex justify-center">
          <a
            href="/sobre-iniciativa-reditto"
            className="inline-block px-5 py-2 rounded-full bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition-colors text-sm"
            style={{letterSpacing: '0.03em'}}
          >
            Sobre a iniciativa Reditto
          </a>
        </div>
      </div>
    </div>
  );
}


