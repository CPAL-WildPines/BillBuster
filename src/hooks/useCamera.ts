import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export function useCamera() {
  const [loading, setLoading] = useState(false);

  const pickImage = useCallback(async (): Promise<string | null> => {
    setLoading(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Please allow access to your photo library in Settings.');
        return null;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });
      if (result.canceled || !result.assets?.[0]) return null;
      return result.assets[0].uri;
    } catch (err) {
      console.error('pickImage error:', err);
      Alert.alert('Error', 'Could not open photo library.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    setLoading(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Please allow camera access in Settings.');
        return null;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.9,
      });
      if (result.canceled || !result.assets?.[0]) return null;
      return result.assets[0].uri;
    } catch (err) {
      console.error('takePhoto error:', err);
      Alert.alert('Error', 'Could not open camera.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { pickImage, takePhoto, loading };
}
