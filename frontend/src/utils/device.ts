export function getBottomSpace(): number {
  if (typeof window === 'undefined') return 0;
  
  // Detecta se é um dispositivo iOS com safe area
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (isIOS) {
    // Verifica se tem safe area bottom usando CSS env()
    const testElement = document.createElement('div');
    testElement.style.paddingBottom = 'env(safe-area-inset-bottom)';
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    const safeAreaBottom = parseInt(computedStyle.paddingBottom) || 0;
    
    document.body.removeChild(testElement);
    
    // Se não conseguir detectar via CSS, usa valores padrão baseados no modelo
    if (safeAreaBottom === 0) {
      const screenHeight = window.screen.height;
      // iPhone X e posteriores têm safe area
      if (screenHeight >= 812) {
        return 34; // Safe area padrão para iPhones com notch/Dynamic Island
      }
    }
    
    return safeAreaBottom;
  }
  
  return 0;
}

export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}
