let xlsxModule: typeof import('xlsx') | null = null;

export async function loadXLSX() {
  if (!xlsxModule) {
    xlsxModule = await import('xlsx');
  }
  return xlsxModule;
}
