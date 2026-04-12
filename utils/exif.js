import exifr from 'exifr';

export async function extractExifTime(buffer) {
  try {
    const data = await exifr.parse(buffer, { tiff: true, exif: true });
    if (data && data.DateTimeOriginal) {
      return data.DateTimeOriginal.toISOString().replace('T', ' ').substring(0, 19);
    }
    if (data && data.CreateDate) {
      return data.CreateDate.toISOString().replace('T', ' ').substring(0, 19);
    }
  } catch (e) {
  }
  return null;
}
