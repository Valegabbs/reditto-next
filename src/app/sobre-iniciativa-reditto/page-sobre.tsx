import Image from 'next/image';
import React from 'react';

export default function SobreIniciativaReditto() {
  return (
    <main className="flex flex-col items-center px-4 py-8 max-w-3xl mx-auto">
      {/* Logo Reditto */}
      <Image src="/assets/logo.png" alt="Logo Reditto" width={120} height={120} className="mb-6" />
      {/* Título */}
      <h1 className="text-3xl font-bold mb-4 text-center">Sobre. Iniciativa Reditto</h1>
      {/* Parágrafo */}
      <p className="text-lg mb-8 text-justify">
        O Reditto nasceu com um propósito simples e transformador: tornar a educação mais acessível e inclusiva. Criamos um web app de correção de redações 100% gratuito, movido por tecnologia avançada de Inteligência Artificial em nuvem e OCR, capaz de avaliar tanto textos digitados quanto manuscritos.<br /><br />
        Nosso foco é apoiar estudantes em situação de vulnerabilidade social, que muitas vezes não têm condições de arcar com professores particulares ou plataformas pagas. Com o Reditto, esses jovens recebem feedback personalizado e de qualidade, ferramenta essencial para evoluírem na escrita e conquistarem novas oportunidades acadêmicas.<br /><br />
        Mais do que um app, o Reditto é uma rede de empatia e transformação, que cresce a cada correção e prova que quando unimos tecnologia e propósito social, criamos pontes para um futuro mais justo e igualitário.<br /><br />
        Hoje a rede expande com o <strong>Reditto Study</strong> oferecendo plantões de dúvidas com IA treinada 100% gratuito em todas as áreas do conhecimento (<a href="https://reditto-study.vercel.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Acesse aqui</a>).
      </p>
      {/* Criadores */}
      <h2 className="text-2xl font-semibold mb-6 mt-10 text-center">Criadores</h2>
      <div className="flex flex-col gap-8 w-full items-center">
        <div className="flex flex-row items-center gap-4 w-full justify-center">
          <Image src="/assets/fund1.png" alt="Gabriel Luz" width={100} height={100} className="rounded-full" />
          <span className="text-xl font-medium">Gabriel Luz</span>
        </div>
        <div className="flex flex-row-reverse items-center gap-4 w-full justify-center">
          <Image src="/assets/fund2.png" alt="Enzo Vitorello" width={100} height={100} className="rounded-full" />
          <span className="text-xl font-medium">Enzo Vitorello</span>
        </div>
      </div>
    </main>
  );
}
