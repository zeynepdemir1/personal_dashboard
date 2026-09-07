// Program eklerine (ör. şartname PDF'i) dosya yükleme. Fotoğraflar gibi
// canvas'la küçültülemediği için (bir PDF'i "sıkıştıramayız") basit bir
// boyut sınırı koyup aşanları reddediyoruz — localStorage kotasını
// sessizce patlatmak yerine kullanıcıya açıkça söylemek daha iyi.
export const MAX_FILE_BYTES = 3 * 1024 * 1024; // 3 MB

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}
