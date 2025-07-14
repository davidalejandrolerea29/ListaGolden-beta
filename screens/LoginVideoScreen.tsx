import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Tabs: undefined;
  LoginVideo: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'LoginVideo'>;

export default function LoginVideoScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [videoEnded, setVideoEnded] = useState(false);

  const handleVideoEnd = () => {
    setVideoEnded(true); // oculta video
    // navegamos con un pequeño delay para que se oculte el video

      navigation.reset({
        index: 0,
        routes: [{ name: 'Tabs' }],
      });
    
  };

  return (
    <View style={styles.container}>
      {!videoEnded && (
        <Video
          source={require('../assets/images/llave.mp4')}
          style={styles.video}
          resizeMode="cover"
          onEnd={handleVideoEnd}
          controls={false}
          muted={false}
          playInBackground={false}
          ignoreSilentSwitch="obey"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  video: { flex: 1 },
});

