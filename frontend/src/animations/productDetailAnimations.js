import { gsap } from 'gsap';

export const animateProductDetail = (refs) => {
  const { 
    imageRef, 
    nameRef, 
    ratingRef, 
    comisionRef, 
    priceRef, 
    descriptionRef, 
    buttonRef 
  } = refs;

  // Verificar que las referencias existan
  if (!imageRef.current) {
    console.error('Referencias no disponibles');
    return;
  }

  // Timeline con delay para esperar la transición
  const tl = gsap.timeline({ 
    defaults: { ease: 'power2.out' },
    delay: 0.8
  });

  // Animar imagen desde la izquierda con fade
  tl.fromTo(imageRef.current,
    { x: -60, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.8 }
  );

  // Animar nombre desde arriba
  tl.fromTo(nameRef.current,
    { y: -30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6 },
    '-=0.4'
  );

  // Animar estrellas con escala
  tl.fromTo(ratingRef.current,
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.6 },
    '-=0.3'
  );

  // Animar texto de comisión
  tl.fromTo(comisionRef.current,
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5 },
    '-=0.2'
  );

  // Animar sección de precios
  tl.fromTo(priceRef.current,
    { x: 20, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.6 },
    '-=0.2'
  );

  // Animar descripción
  tl.fromTo(descriptionRef.current,
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7 },
    '-=0.3'
  );

  // Animar botón con bounce
  tl.fromTo(buttonRef.current,
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' },
    '-=0.2'
  );

  return tl;
};