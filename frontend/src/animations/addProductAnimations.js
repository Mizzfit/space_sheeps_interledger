import { gsap } from 'gsap';

export const animateAddProductForm = (refs) => {
  const { formBoxRef, selectRef, inputRef, textareaRef, buttonRef } = refs;

  // Verificar que las referencias existan
  if (!formBoxRef.current) {
    console.error('Referencias no disponibles');
    return;
  }

  // Timeline con delay para la transición de Framer Motion
  const tl = gsap.timeline({ 
    defaults: { ease: 'power3.out' },
    delay: 0.8
  });

  // Animar el formulario completo (aparece desde abajo con fade)
  tl.fromTo(formBoxRef.current,
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8 }
  );

  // Animar el select
  tl.fromTo(selectRef.current,
    { x: -20, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5 },
    '-=0.4'
  );

  // Animar el input de título
  tl.fromTo(inputRef.current,
    { x: -20, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5 },
    '-=0.3'
  );

  // Animar el textarea
  tl.fromTo(textareaRef.current,
    { x: -20, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5 },
    '-=0.3'
  );

  // Animar el botón (escala con bounce)
  tl.fromTo(buttonRef.current,
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' },
    '-=0.2'
  );

  return tl;
};

// Hover effect para el botón
export const setupButtonHover = (buttonRef) => {
  if (!buttonRef.current) return;
  
  const button = buttonRef.current;

  const handleMouseEnter = () => {
    gsap.to(button, {
      scale: 1.05,
      duration: 0.7,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    gsap.to(button, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  button.addEventListener('mouseenter', handleMouseEnter);
  button.addEventListener('mouseleave', handleMouseLeave);

  // Cleanup function
  return () => {
    button.removeEventListener('mouseenter', handleMouseEnter);
    button.removeEventListener('mouseleave', handleMouseLeave);
  };
};