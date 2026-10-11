# Skill: Scroll World
- Video sincronizado al scroll: `currentTime` mapeado al avance de página (scrubbing continuo sin autoplay).
- Secciones fijas (`position: sticky` / ScrollTrigger pin): el contenido cambia en puntos clave mientras el fondo avanza.
- Animación fluida: suavizado de transición (`scrub: 1` o interpolación rAF), sin saltos bruscos.
- Cierre continuo: al alcanzar el final del clip, transiciona limpiamente hacia la imagen de reposo de alta fidelidad (`person.webp`).
- Mobile & Performance: degradación elegante con `prefers-reduced-motion`, posters subyacentes y desbloqueo de WebKit en iOS.
