import { formatDistanceToNow, parse } from 'date-fns';
import { Alert, Platform, ToastAndroid } from 'react-native';

export const showToast = (message: string): void => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(message);
  }
};

export const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  // Daylight savings
  const adjustedDate = new Date(date.getTime() + 60 * 60 * 1000);

  return formatDistanceToNow(adjustedDate, {
    addSuffix: true,
  });
};
