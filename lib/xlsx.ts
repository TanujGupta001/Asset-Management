let xlsxPromise: Promise<typeof import('xlsx')> | null = null;

export async function loadXLSX() {
  if (typeof window !== 'undefined' && (window as any).XLSX) {
    return (window as any).XLSX;
  }

  if (typeof window !== 'undefined') {
    if (!xlsxPromise) {
      xlsxPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.sheetjs.com/xlsx-0.18.5/package/dist/xlsx.full.min.js';
        script.async = true;
        script.onload = () => {
          resolve((window as any).XLSX);
        };
        script.onerror = () => reject(new Error('Failed to load XLSX library'));
        document.head.appendChild(script);
      });
    }
    return xlsxPromise;
  }

  return await import('xlsx');
}
