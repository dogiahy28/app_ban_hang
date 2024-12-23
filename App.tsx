import * as React from "react";
import Trangchu from "./screen/components/Trangchu";
import Dangky from "./screen/components/Dangky";
import Dangnhap from "./screen/components/Dangnhap";
import Chitiet from "./screen/components/Chitiet";
import Footer from './screen/components/Footer';
import Giohang from './screen/components/Giohang';
import Canhan from './screen/components/Canhan';
import Timkiem from './screen/components/Timkiem';
import Goiy from './screen/components/Goiy';
import Thanhtoan from './screen/components/Thanhtoan';
import Donhang from './screen/components/Donhang';
import ThongtinDH from './screen/components/ThongtinDH';
import Thongtin from './screen/components/Thongtin';
import Thongbao from './screen/components/Thongbao';
import Uudai from './screen/components/Uudai';
import { Text, View, Image, StyleSheet, TextInput, Button, TouchableOpacity} from "react-native";
import AppNavigator from './screen/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome6';


const Stack = createNativeStackNavigator();
// const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='DangKy' component={Dangky} options={{headerShown:false}}/>
        <Stack.Screen name='DangNhap' component={Dangnhap} options={{headerShown:false}}/>
        <Stack.Screen name='TrangChu' component={Trangchu} options={{headerShown:false}}/>
        <Stack.Screen name='ChiTiet' component={Chitiet} options={{headerShown:false}}/>
        <Stack.Screen name='GioHang' component={Giohang} options={{headerShown:false}}/>
        <Stack.Screen name='CaNhan' component={Canhan} options={{headerShown:false}}/>
        <Stack.Screen name='TimKiem' component={Timkiem} options={{headerShown:false}}/>
        <Stack.Screen name='GoiY' component={Goiy} options={{headerShown:false}}/>
        <Stack.Screen name='Thanhtoan' component={Thanhtoan} options={{headerShown:false}}/>
        <Stack.Screen name='Donhang' component={Donhang} options={{headerShown:false}}/>
        <Stack.Screen name='ThongtinDH' component={ThongtinDH} options={{headerShown:false}}/>
        <Stack.Screen name='Thongtin' component={Thongtin} options={{headerShown:false}}/>
        <Stack.Screen name='Thongbao' component={Thongbao} options={{headerShown:false}}/>
        <Stack.Screen name='UuDai' component={Uudai} options={{headerShown:false}}/>
      </Stack.Navigator>
    </NavigationContainer>
    // <App2/>
  );
}

// function App() {
//     return (
//       <App2/>
//     );
//   }
// export default App;


