import { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, View, ScrollView, Text, ActivityIndicator, Button } from 'react-native';
import * as Location from "expo-location";
import { MaterialCommunityIcons, Fontisto, FontAwesome5 } from "@expo/vector-icons";
import { Restart } from 'fiction-expo-restart';
import WEATHER_API_KEY from "./WeatherApi";
import { theme } from './colors';

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
  const [isgrant, setIsgrant] = useState(false);
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]);

  // 위치 정보 제공에 대한 유저 권한 요청
  const requestUserAuthority = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();

    // 유저가 권한 요청 승인
    if (granted) {
      setIsgrant(true);
      getWeather();
    }
  };

  const getWeather = async () => {
    // 유저 위치 정보
    const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync({ accuracy: 5 });
    const location = await Location.reverseGeocodeAsync({ latitude, longitude }, { useGoogleMaps: false });
    setCity(location[0].city === null ? location[0].region : location[0].city);

    // 날씨 정보
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`);
    const json = await response.json();
    setDays(json.list);
  };

  const restart = () => {
    setIsgrant(true);
    Restart();
  };

  useEffect(() => {
    requestUserAuthority();
  }, []);

  return (
    isgrant ? (<View style={styles.container}>
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
            <ActivityIndicator size={"large"} color={theme.red} />
          </View>
        ) : (
          days.map((day, index) => <View key={`DAY${index}`} style={styles.day}>
            <Text style={styles.date}>{day.dt_txt.substring(0, 16).replaceAll("-", ".")}</Text>

            <View style={styles.tempView}>
              <Text style={styles.temp}>{parseFloat(day.main.temp).toFixed()}</Text>
              <MaterialCommunityIcons name="temperature-celsius" size={100} color={theme.red} marginTop={-50} />
            </View>

            <View style={styles.descriptionView}>
              <Fontisto name={icons[day.weather[0].main]} size={70} color={theme.green} />
              <Text style={styles.main}>{day.weather[0].main}</Text>
              <Text style={styles.description}>{day.weather[0].description}</Text>
            </View>
          </View>)

        )}
      </ScrollView>
    </View>
    ) : (
      <View style={{ ...styles.container, alignItems: "center", justifyContent: "center" }}>
        <FontAwesome5 name="cloud-moon" size={100} color={theme.green} />

        <Text style={styles.infoHeader}>권한을 허용하지 않으셨네요!</Text>
        <Text style={styles.infoText}>원활한 날씨 정보 업데이트를 위해</Text>
        <Text style={styles.infoText}>권한을 허용해주세요.</Text>

        <View style={styles.btnView}>
          <Button
            title="권한 허용하기"
            color={theme.green}
            onPress={() => restart()}
          />
        </View>
      </View>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background
  },
  city: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    color: theme.orange,
    fontSize: 50,
    fontWeight: "700"
  },
  day: {
    width: SCREEN_WIDTH,
  },
  date: {
    alignSelf: "center",
    color: theme.red,
    fontSize: 30,
    fontWeight: "600"
  },
  tempView: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20
  },
  temp: {
    color: theme.red,
    fontSize: 170,
    fontWeight: "600"
  },
  descriptionView: {
    alignItems: "flex-end",
    paddingRight: 20,
  },
  main: {
    color: theme.green,
    fontSize: 40,
    fontWeight: "600",
  },
  description: {
    color: theme.blue,
    fontSize: 20
  },
  infoHeader: {
    marginTop: 50,
    marginBottom: 20,
    fontSize: 25,
    fontWeight: "600"
  },
  infoText: {
    fontSize: 15
  },
  btnView: {
    marginTop: 50
  },
});
