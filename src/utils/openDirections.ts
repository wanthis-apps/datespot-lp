import { Linking } from 'react-native';

export async function openGoogleMapsDirections(
  latitude: number,
  longitude: number,
): Promise<void> {
  const destination = `${latitude},${longitude}`;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  await Linking.openURL(url);
}
