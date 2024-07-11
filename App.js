import { StyleSheet, Dimensions, View, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import * as Location from "expo-location";
import WEATHER_API from "./WeatherApi";

// 화면 크기
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function App() {
  const [isgrant, setIsgrant] = useState(true);
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]);

  const getWeather = async () => {
    // 위치 정보에 대한 유저 권한 요청
    const { granted } = await Location.requestForegroundPermissionsAsync();

    // 유저가 권한 요청 거절
    if (!granted) {
      setIsgrant(false);
    }

    // 유저 위치 정보
    const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync({ accuracy: 5 });
    const location = await Location.reverseGeocodeAsync({ latitude, longitude }, { useGoogleMaps: false });
    setCity(location[0].city === null ? location[0].region : location[0].city);

    // 날씨 정보
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API}&units=metric`);
    const json = await response.json();
    setDays(json.list);
  };

  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.weather}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator size={"large"} color={"#f78d65"} />
          </View>
        ) : (
          days.map((day, index) => <View key={`DAY${index}`} style={styles.day}>
            <Text style={styles.date}>{day.dt_txt.substring(0, 16).replaceAll("-", ".")}</Text>
            <Text style={styles.temp}>{parseFloat(day.main.temp).toFixed()}</Text>
            <Text style={styles.main}>{day.weather[0].main}</Text>
            <Text style={styles.description}>{day.weather[0].description}</Text>
          </View>)

        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f4e1"
  },
  city: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    color: "#fcbc7e",
    fontSize: 50,
    fontWeight: "700"
  },
  weather: {
  },
  day: {
    width: SCREEN_WIDTH,
  },
  date: {
    alignSelf: "center",
    color: "#f78d65",
    fontSize: 30,
    fontWeight: "600"
  },
  temp: {
    marginTop: 20,
    marginLeft: 20,
    color: "#f78d65",
    fontSize: 170,
    fontWeight: "600"
  },
  main: {
    alignSelf: "flex-end",
    marginRight: 20,
    color: "#488c8a",
    fontSize: 40,
    fontWeight: "600"
  },
  description: {
    alignSelf: "flex-end",
    marginRight: 20,
    color: "#56c8d4",
    fontSize: 20
  }
});
