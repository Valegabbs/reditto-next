"use client";
import Image from 'next/image';
import React from 'react';
import { useRouter } from 'next/navigation';
import FloatingMenu from '../components/FloatingMenu';

export default function SobreIniciativaReditto() {
		const router = useRouter();
		return (
			<div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
				<FloatingMenu />
				<div className="max-w-2xl w-full mx-auto px-4 py-8 flex flex-col items-center">
					<button
						onClick={() => router.back()}
						className="mb-6 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md self-start"
					>
						← Voltar
					</button>
					<Image src="/assets/logo.png" alt="Logo Reditto" width={120} height={120} className="mb-6" />
					<h1 className="text-4xl font-extrabold mb-4 text-center">Sobre. Iniciativa Reditto</h1>
					<p className="text-lg mb-8 text-justify leading-relaxed bg-[var(--card-bg)] p-6 rounded-xl shadow-md" style={{color: 'inherit'}}>
						O Reditto nasceu com um propósito simples e transformador: tornar a educação mais acessível e inclusiva. Criamos um web app de correção de redações 100% gratuito, movido por tecnologia avançada de Inteligência Artificial em nuvem e OCR, capaz de avaliar tanto textos digitados quanto manuscritos.<br /><br />
						Nosso foco é apoiar estudantes em situação de vulnerabilidade social, que muitas vezes não têm condições de arcar com professores particulares ou plataformas pagas. Com o Reditto, esses jovens recebem feedback personalizado e de qualidade, ferramenta essencial para evoluírem na escrita e conquistarem novas oportunidades acadêmicas.<br /><br />
						Mais do que um app, o Reditto é uma rede de empatia e transformação, que cresce a cada correção e prova que quando unimos tecnologia e propósito social, criamos pontes para um futuro mais justo e igualitário.<br /><br />
						Hoje a rede expande com o <strong>Reditto Study</strong> oferecendo plantões de dúvidas com IA treinada 100% gratuito em todas as áreas do conhecimento (<a href="https://reditto-study.vercel.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Acesse aqui</a>).
					</p>
					<h2 className="text-3xl font-bold mb-8 mt-10 text-center">Criadores</h2>
					<div className="flex flex-col md:flex-row gap-8 w-full items-center justify-center">
						<div className="flex flex-col items-center bg-[var(--card-bg)] p-6 rounded-xl shadow-md w-full md:w-1/2">
							<Image src="/assets/fund1.png" alt="Gabriel Luz" width={120} height={120} className="rounded-full mb-4 border-4 border-purple-400" />
							<span className="text-2xl font-semibold">Gabriel Luz</span>
						</div>
						<div className="flex flex-col items-center bg-[var(--card-bg)] p-6 rounded-xl shadow-md w-full md:w-1/2">
							<Image src="/assets/fund2.png" alt="Enzo Vitorello" width={120} height={120} className="rounded-full mb-4 border-4 border-purple-400" />
							<span className="text-2xl font-semibold">Enzo Vitorello</span>
						</div>
					</div>
				</div>
			</div>
		);
	}
