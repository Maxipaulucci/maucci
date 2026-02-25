import React from 'react';
import { maxturnosInfo } from './maxturnosData';

export const legalContent = {
  privacidad: {
    title: 'Política de Privacidad',
    content: (
      <>
        <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR')}</p>
        <p>En <strong>{maxturnosInfo.name}</strong> nos comprometemos a proteger la privacidad de los usuarios de nuestra plataforma de gestión de turnos.</p>
        <h4>1. Datos que recopilamos</h4>
        <p>Recopilamos la información que nos proporcionás al registrarte, reservar turnos o contactarnos: nombre, correo electrónico, teléfono y, en su caso, datos del negocio (nombre del local, dirección, servicios). Los datos de las reservas (fecha, hora, servicio, profesional) se almacenan para gestionar los turnos.</p>
        <h4>2. Uso de la información</h4>
        <p>Utilizamos tus datos para: gestionar reservas y recordatorios, mejorar el servicio, responder consultas y, si lo autorizás, enviar novedades. No vendemos ni compartimos tu información con terceros con fines comerciales.</p>
        <h4>3. Seguridad y conservación</h4>
        <p>Aplicamos medidas técnicas y organizativas para proteger tus datos. Los conservamos mientras mantengas una cuenta activa o sea necesario para cumplir obligaciones legales.</p>
        <h4>4. Tus derechos</h4>
        <p>Podés acceder, rectificar o solicitar la eliminación de tus datos contactándonos a <strong>{maxturnosInfo.email}</strong>. Si considerás que el tratamiento no es adecuado, tenés derecho a presentar una queja ante la autoridad de protección de datos competente.</p>
      </>
    )
  },
  terminos: {
    title: 'Términos de Servicio',
    content: (
      <>
        <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR')}</p>
        <p>Al utilizar los servicios de <strong>{maxturnosInfo.name}</strong> aceptás los siguientes términos.</p>
        <h4>1. Descripción del servicio</h4>
        <p>{maxturnosInfo.name} ofrece sistemas de reserva de turnos para negocios (barberías, manicurerías, estudios de piercing, etc.). Los usuarios pueden consultar locales adheridos, reservar turnos y gestionar sus citas según las opciones de cada negocio.</p>
        <h4>2. Uso aceptable</h4>
        <p>Te comprometés a usar la plataforma de forma lícita, a no falsear datos ni a reservar turnos que no tengas intención de utilizar. Los negocios adheridos son responsables de sus servicios; Maucci actúa como intermediario tecnológico.</p>
        <h4>3. Cancelaciones y modificaciones</h4>
        <p>Las políticas de cancelación o modificación de turnos dependen de cada local. Respetá las condiciones informadas al reservar y comunicate con el negocio o a través de la plataforma para cualquier cambio.</p>
        <h4>4. Propiedad intelectual y contacto</h4>
        <p>El diseño, la marca y el software de la plataforma son propiedad de {maxturnosInfo.name}. Para consultas sobre estos términos podés escribirnos a <strong>{maxturnosInfo.email}</strong>.</p>
      </>
    )
  },
  cookies: {
    title: 'Política de Cookies',
    content: (
      <>
        <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR')}</p>
        <p>Esta política describe el uso de cookies y tecnologías similares en los sitios y la aplicación de <strong>{maxturnosInfo.name}</strong>.</p>
        <h4>1. ¿Qué son las cookies?</h4>
        <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo al visitar un sitio web. Nos permiten recordar preferencias, mantener la sesión y mejorar la experiencia de uso.</p>
        <h4>2. Cookies que utilizamos</h4>
        <p><strong>Esenciales:</strong> necesarias para el funcionamiento del sitio (por ejemplo, inicio de sesión y seguridad). Sin ellas, algunas funciones no estarían disponibles.</p>
        <p><strong>Funcionales:</strong> recuerdan preferencias como idioma o región para ofrecerte una experiencia más personalizada.</p>
        <p><strong>Analíticas:</strong> nos ayudan a entender cómo se usa la plataforma (páginas visitadas, flujo de reservas) para mejorar el servicio. Pueden ser propias o de terceros confiables.</p>
        <h4>3. Cómo gestionar las cookies</h4>
        <p>Podés configurar tu navegador para bloquear o eliminar cookies. Tené en cuenta que desactivar ciertas cookies puede afectar la funcionalidad del sitio (por ejemplo, el acceso a tu cuenta o la reserva de turnos).</p>
        <h4>4. Más información</h4>
        <p>Para dudas sobre el uso de cookies podés contactarnos a <strong>{maxturnosInfo.email}</strong>.</p>
      </>
    )
  }
};
