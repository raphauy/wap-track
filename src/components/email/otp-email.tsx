import React from 'react';
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Link } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface OtpEmailProps {
  code: string;
}

export default function OtpEmail({ code }: OtpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verifica tu identidad para RC Starter Kit</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-20 px-4">
            <Section className="border border-solid border-gray-200 rounded-lg p-8 shadow-sm">
              <div className="text-center mb-4">
                {/* Aquí podrías agregar un logo */}
                <svg
                  className="mx-auto h-12 w-12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <Heading className="text-center text-xl mb-4">
                VERIFICA TU IDENTIDAD
              </Heading>
              <Text className="text-center text-gray-700 mb-8">
                Ingresa el siguiente código para finalizar el proceso de inicio de sesión
              </Text>
              <Section className="bg-gray-100 rounded-md py-4 text-center mb-8">
                <Text className="text-3xl font-mono tracking-[.5em] font-bold">
                  {code}
                </Text>
              </Section>
              <Text className="text-sm text-gray-500 text-center">
                ¿No esperabas este correo?
                <br />
                Contacta a{' '}
                <Link
                  href="mailto:soporte@rapha.uy"
                  className="text-blue-600 underline"
                >
                  soporte@rapha.uy
                </Link>{' '}
                si no solicitaste este código.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
} 