import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.8;

export async function prepareImageForAI(uri: string): Promise<string> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION } }],
    { compress: JPEG_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
  );

  const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
    encoding: 'base64',
  });

  return base64;
}
