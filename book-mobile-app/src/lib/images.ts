import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

// The API stores covers/photos as compressed JPEG data URLs, same as the web
// app (~235KB target, server limit 400KB).
const TARGET_BYTES = 235 * 1024;

function base64Bytes(base64: string) {
  return Math.ceil((base64.length * 3) / 4);
}

/** Resizes and re-encodes an image until it fits the size budget. */
export async function compressToDataUrl(uri: string): Promise<string> {
  let maxWidth = 1000;
  let compress = 0.8;
  let base64 = "";

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const ref = await ImageManipulator.manipulate(uri, { maxWidth }).renderAsync();
    const result = await ref.saveAsync({ format: SaveFormat.JPEG, compress, base64: true });
    base64 = result.base64 || "";
    if (base64 && base64Bytes(base64) <= TARGET_BYTES) break;
    if (compress > 0.5) compress -= 0.15;
    else {
      maxWidth = Math.round(maxWidth * 0.75);
      compress = 0.7;
    }
  }
  if (!base64) throw new Error("Couldn't process that image — please try another one.");
  // The API rejects images over 400KB; fail here with a clear message instead.
  if (base64Bytes(base64) > 390 * 1024) throw new Error("That image is too large even after compressing. Try a smaller one.");
  return `data:image/jpeg;base64,${base64}`;
}

/** Opens the photo library and returns a compressed data URL, or null if cancelled. */
export async function pickCompressedImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 1,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  return compressToDataUrl(result.assets[0].uri);
}
