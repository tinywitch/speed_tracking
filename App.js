import React, { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet, TextInput } from 'react-native';
import Device from 'expo-device';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';


export default function App() {
  const DEFAULT_MAX_SPEED = 50;

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [maxSpeed, setMaxSpeed] = useState(DEFAULT_MAX_SPEED);


  async function playSound() {
    const { sound } = await Audio.Sound.createAsync( require('./assets/audio.mp3'));
    
    await sound.playAsync();
  }


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      let foregroundSub = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1,
          timeInterval: 5
        },
        location => {
          setLocation(location);
        });
    })();
  }, []);

  let textStyle = 'safeText';
  let speed = {ms: 0, kmh: 0};
  if(location) {
    console.log(maxSpeed, location.coords.speed * 3.6);

    speed = {
      ms: location.coords.speed.toFixed(2),
      kmh: (location.coords.speed * 3.6).toFixed(2),
    };
    let speedValue = maxSpeed !== '' ? maxSpeed : DEFAULT_MAX_SPEED;
    if(location.coords.speed * 3.6 > speedValue) {
      playSound();
      textStyle = 'dangerText';
    }
    else {
      textStyle = 'safeText';
    }
  }


  return (
    <View style={styles.body}>
      <View style={styles.container}>
        <View>
          <Text style={[styles.paragraph, styles.bigFont]}>Welcome Ninh,</Text>
          <Text style={styles.dangerText}>{errorMsg}</Text>
        </View>
        <View style={[styles.flex]}>
          <Text style={[styles.paragraph, styles.smallFont]}>Max speed is</Text> 
          <TextInput
            style={styles.input}
            onChangeText={setMaxSpeed}
            value={maxSpeed}
            defaultValue={DEFAULT_MAX_SPEED}
            placeholder={DEFAULT_MAX_SPEED.toString()}
            placeholderTextColor={'white'}
            keyboardType="numeric"
            returnKeyType="done"
          />
          <Text style={[styles.paragraph, styles.smallFont]}>km/h</Text>
        </View>
        
        <View>
          <Text style={[styles.paragraph, styles.smallFont, styles.mb10]}>Current speed is</Text>
          <Text style={[styles.paragraph, styles.bigFont, styles[textStyle]]}>{speed.ms} m/s</Text>
          <Text style={[styles.paragraph, styles.bigFont, styles[textStyle]]}>{speed.kmh} km/h</Text>
        </View>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: 'black',
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: '30%',
  },
  paragraph: {
    textAlign: 'center',
    color: 'white',
  },
  bigFont: {
    fontSize: 35,
  },
  smallFont: {
    fontSize: 20,
  },

  mb10: {
    marginBottom: 10
  },

  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderColor: 'white',
    padding: 10,
    width: 50,
    fontSize: 20,
    textAlign: 'center',
    color: 'white',
  },
  flex: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeText: {
    color: 'green'
  },
  dangerText: {
    color: 'red'
  }
});
