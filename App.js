import { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, View, ScrollView, Text, ActivityIndicator } from 'react-native';
import * as Location from "expo-location";
import { MaterialCommunityIcons, Fontisto } from "@expo/vector-icons";
import WEATHER_API_KEY from "./WeatherApi";

// 화면 크기
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// 날씨 아이콘
const icons = {
  "Clear": "day-sunny",
  "Clouds": "cloudy",
  "Rain": "rains",
  "Snow": "snow",
  "Thunderstorm": "lightning",
  "Drizzle": "rain",
  "Atmosphere": "cloudy-gusts"
};


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
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`);
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

            <View style={styles.tempView}>
              <Text style={styles.temp}>{parseFloat(day.main.temp).toFixed()}</Text>
              <MaterialCommunityIcons name="temperature-celsius" size={100} color="#f78d65" marginTop={-50} />
            </View>

            <View style={styles.descriptionView}>
              <Fontisto name={icons[day.weather[0].main]} size={70} color="#488c8a" />
              <Text style={styles.main}>{day.weather[0].main}</Text>
              <Text style={styles.description}>{day.weather[0].description}</Text>
            </View>

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
  day: {
    width: SCREEN_WIDTH,
  },
  date: {
    alignSelf: "center",
    color: "#f78d65",
    fontSize: 30,
    fontWeight: "600"
  },
  tempView: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20
  },
  temp: {
    color: "#f78d65",
    fontSize: 170,
    fontWeight: "600"
  },
  descriptionView: {
    alignItems: "flex-end",
    paddingRight: 20,
  },
  main: {
    color: "#488c8a",
    fontSize: 40,
    fontWeight: "600",
  },
  description: {
    color: "#56c8d4",
    fontSize: 20
  }
});
