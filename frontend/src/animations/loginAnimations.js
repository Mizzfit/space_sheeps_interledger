import { gsap } from 'gsap';

export const animateLoginForm = (refs) => {
  const { titleRef, input1Ref, input2Ref, linksRef, buttonRef, helpBoxRef, leftDivRef } = refs;

  // Verificar que todas las referencias existan
  if (!leftDivRef.current) {
    console.error('Referencias no disponibles');
    return;
  }

  // Timeline con delay para asegurar que React terminó de renderizar
  const tl = gsap.timeline({ 
    defaults: { ease: 'power3.out' },
    delay: 0.1 
  });

  // Animar el fondo izquierdo
  tl.fromTo(leftDivRef.current, 
    { opacity: 0 },
    { opacity: 1, duration: 0.6 }
  );

  // Animar el título
  tl.fromTo(titleRef.current,
    { y: -50, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6 },
    '-=0.3'
  );

  // Animar los inputs
  tl.fromTo([input1Ref.current, input2Ref.current],
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, stagger: 0.15 },
    '-=0.2'
  );

  // Animar los links
  tl.fromTo(linksRef.current,
    { opacity: 0 },
    { opacity: 1, duration: 0.4 },
    '-=0.2'
  );

  // Animar el botón
  tl.fromTo(buttonRef.current,
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
    '-=0.2'
  );

  // Animar la caja de ayuda
  tl.fromTo(helpBoxRef.current,
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.4 },
    '-=0.1'
  );

  return tl;
};

export const animateError = (errorRef) => {
  if (!errorRef.current) return;

  gsap.fromTo(errorRef.current,
    { x: -10, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
  );

  gsap.to(errorRef.current, {
    x: [0, -10, 10, -10, 10, 0],
    duration: 0.5,
    delay: 0.3,
    ease: 'power2.inOut'
  });
};

export const setupButtonHover = (buttonRef) => {
  if (!buttonRef.current) return;
  
  const button = buttonRef.current;

  const handleMouseEnter = () => {
    gsap.to(button, {
      scale: 1.05,
      duration: 0.3,
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